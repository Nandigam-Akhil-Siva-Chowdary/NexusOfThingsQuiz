// routes/admin.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Question = require('../models/Question');
const Participant = require('../models/Participant');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// ==================== ADMIN AUTHENTICATION ====================

// Admin login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // In production, use proper JWT authentication with environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        
        if (username === adminUsername && password === adminPassword) {
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    username: 'admin',
                    role: 'administrator'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get admin dashboard stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get total participants
        const totalParticipants = await Participant.countDocuments();
        
        // Get participants who have taken quiz
        const quizTaken = await Participant.countDocuments({ 
            quiz_taken: true,
            quiz_score: { $exists: true }
        });
        
        // Calculate average score
        const participantsWithScore = await Participant.find({ 
            quiz_score: { $exists: true, $ne: null }
        }).select('quiz_score');
        
        const scores = participantsWithScore.map(p => p.quiz_score);
        const averageScore = scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
            : 0;
        
        // Get top score
        const topScore = scores.length > 0 ? Math.max(...scores) : 0;
        
        // Get questions count
        const totalQuestions = await Question.countDocuments();
        
        // Get questions by event
        const questionsByEvent = await Question.aggregate([
            { $group: { _id: '$event', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            data: {
                totalParticipants,
                quizTaken,
                averageScore,
                topScore,
                totalQuestions,
                questionsByEvent,
                completionRate: totalParticipants > 0 
                    ? Math.round((quizTaken / totalParticipants) * 100) 
                    : 0
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

// ==================== CSV UPLOAD ====================

// Upload quiz questions via CSV - FIXED VERSION
router.post('/upload-questions', upload.single('csvFile'), async (req, res) => {
    try {
        const { event } = req.body;
        
        if (!event) {
            return res.status(400).json({
                success: false,
                message: 'Event is required'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'CSV file is required'
            });
        }
        
        const filePath = req.file.path;
        const questions = [];

        console.log(`📁 Processing CSV for event: ${event}`);
        console.log(`📄 File: ${req.file.originalname}`);

        // Read CSV file with proper error handling
        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log('Raw CSV row:', row); // Debug log

                // Read raw values (support both header styles)
                const rawQuestionText = row.question || row['question'] || '';
                const rawOptions = [
                    row.option1 || row['option1'] || '',
                    row.option2 || row['option2'] || '',
                    row.option3 || row['option3'] || '',
                    row.option4 || row['option4'] || ''
                ];

                // Parse numeric fields safely (use base 10 and handle NaN)
                const rawCorrect = (row.correct_option || row['correct_option']);
                const parsedCorrect = Number.parseInt(rawCorrect, 10);
                const rawPoints = (row.points || row['points']);
                const parsedPoints = Number.parseInt(rawPoints, 10);
                const rawTime = (row.time_limit || row['time_limit']);
                const parsedTime = Number.parseInt(rawTime, 10);

                // Build question object with sane defaults; do NOT assign possible NaN values
                const question = {
                    event: event,
                    question_text: rawQuestionText.trim(),
                    options: rawOptions.map(o => (o || '').trim()),
                    correct_option: 0, // will set below after validation
                    explanation: (row.explanation || row['explanation'] || '').trim(),
                    difficulty: row.difficulty || 'medium',
                    category: row.category || '',
                    points: Number.isFinite(parsedPoints) ? parsedPoints : 10,
                    time_limit: Number.isFinite(parsedTime) ? parsedTime : 30
                };

                // Validate required fields
                if (!question.question_text || question.options.some(opt => !opt)) {
                    console.warn('⚠️ Skipping invalid question:', question.question_text || '[no text]');
                    return;
                }

                // CSV correct_option expected as 1-4; convert to 0-3
                if (Number.isFinite(parsedCorrect) && parsedCorrect >= 1 && parsedCorrect <= 4) {
                    question.correct_option = parsedCorrect - 1;
                } else {
                    console.warn('⚠️ Invalid or missing correct_option, defaulting to 0 for question:', question.question_text.substring(0, 50));
                    question.correct_option = 0;
                }

                questions.push(question);
                console.log('✅ Added question:', question.question_text.substring(0, 50) + '...');
            })
            .on('end', async () => {
                // Clean up file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                console.log(`📊 Processed ${questions.length} questions`);

                if (questions.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid questions found in CSV file'
                    });
                }

                try {
                    // Insert questions into database
                    const result = await Question.insertMany(questions);
                    
                    res.json({
                        success: true,
                        message: `Successfully uploaded ${result.length} questions for ${event}`,
                        data: {
                            count: result.length,
                            event: event,
                            sample: result[0] // Return first question as sample
                        }
                    });
                } catch (dbError) {
                    console.error('Database insert error:', dbError);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to save questions to database',
                        error: dbError.message
                    });
                }
            })
            .on('error', (error) => {
                // Clean up file on error
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                console.error('CSV stream error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to process CSV file',
                    error: error.message
                });
            });

    } catch (error) {
        console.error('CSV upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload questions',
            error: error.message
        });
    }
});

// ==================== MANUAL QUESTION ADDITION ====================

// Add a single question manually
router.post('/add-question', async (req, res) => {
    try {
        const {
            event,
            question_text,
            options,
            correct_option,
            difficulty,
            category,
            points,
            time_limit,
            explanation
        } = req.body;

        // Validation
        if (!event || !question_text || !Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. Event, question_text, and 4 options are required.'
            });
        }

        if (correct_option === undefined || correct_option < 0 || correct_option > 3) {
            return res.status(400).json({
                success: false,
                message: 'correct_option must be between 0 and 3'
            });
        }

        // Create question object
        const newQuestion = {
            event: event,
            question_text: question_text.trim(),
            options: options.map(opt => opt.trim()),
            correct_option: parseInt(correct_option),
            difficulty: difficulty || 'medium',
            category: category || '',
            points: parseInt(points) || 10,
            time_limit: parseInt(time_limit) || 30,
            explanation: explanation || '',
            is_active: true,
            created_at: new Date()
        };

        // Save to database
        const result = await Question.create(newQuestion);

        console.log(`✅ Question added manually | Event: ${event} | Question: ${question_text.substring(0, 50)}...`);

        return res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: {
                count: 1,
                event: event,
                sample: result
            }
        });

    } catch (error) {
        console.error('❌ Add question error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add question',
            error: error.message
        });
    }
});

// ==================== QUESTIONS MANAGEMENT ====================

// Get all questions for admin
router.get('/questions', async (req, res) => {
    try {
        const { event, page = 1, limit = 20, difficulty, category } = req.query;
        
        // Build query
        const query = {};
        if (event && event !== 'All') query.event = event;
        if (difficulty) query.difficulty = difficulty;
        if (category) query.category = category;
        
        const questions = await Question.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ created_at: -1 });

        const total = await Question.countDocuments(query);

        res.json({
            success: true,
            data: questions,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get question by ID
router.get('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await Question.findById(id);
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            data: question
        });
        
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update question
router.put('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const question = await Question.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Question updated successfully',
            data: question
        });
        
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update question'
        });
    }
});

// Delete question by ID
router.delete('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const question = await Question.findByIdAndDelete(id);
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete question'
        });
    }
});

// ==================== PARTICIPANTS MANAGEMENT ====================

// Get all participants with quiz results
router.get('/participants', async (req, res) => {
    try {
        const { event, page = 1, limit = 50, hasQuiz } = req.query;
        
        // Build query
        const query = {};
        if (event && event !== 'All') query.event = event;
        if (hasQuiz === 'true') query.quiz_taken = true;
        if (hasQuiz === 'false') query.quiz_taken = false;
        
        const participants = await Participant.find(query)
            .select('team_code team_name event team_lead_name college_name email phone_number quiz_score quiz_taken registration_date')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ 
                quiz_score: -1, // Sort by score (highest first)
                registration_date: -1 
            });

        const total = await Participant.countDocuments(query);

        res.json({
            success: true,
            data: participants,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch participants'
        });
    }
});

// Get participant by ID
router.get('/participants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const participant = await Participant.findById(id)
            .select('-__v'); // Exclude version field
        
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }
        
        res.json({
            success: true,
            data: participant
        });
        
    } catch (error) {
        console.error('Get participant error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== EXPORT DATA ====================

// Export participants data as CSV
router.get('/export/participants', async (req, res) => {
    try {
        const { event } = req.query;
        
        const query = event && event !== 'All' ? { event } : {};
        const participants = await Participant.find(query)
            .select('team_code team_name event team_lead_name college_name email phone_number quiz_score quiz_taken registration_date')
            .sort({ event: 1, quiz_score: -1 });

        // Create CSV content
        const headers = [
            'Team Code',
            'Team Name',
            'Event',
            'Team Lead',
            'College',
            'Email',
            'Phone',
            'Quiz Score',
            'Quiz Taken',
            'Registration Date'
        ];

        const rows = participants.map(p => [
            p.team_code,
            `"${p.team_name}"`,
            p.event,
            `"${p.team_lead_name}"`,
            `"${p.college_name}"`,
            p.email,
            p.phone_number,
            p.quiz_score || 'Not taken',
            p.quiz_taken ? 'Yes' : 'No',
            new Date(p.registration_date).toLocaleDateString()
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Set headers for file download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=participants_${event || 'all'}_${Date.now()}.csv`);
        
        res.send(csvContent);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export data'
        });
    }
});

// Export questions as CSV
router.get('/export/questions', async (req, res) => {
    try {
        const { event } = req.query;
        
        const query = event && event !== 'All' ? { event } : {};
        const questions = await Question.find(query)
            .sort({ event: 1, category: 1 });

        // Create CSV content
        const headers = [
            'question',
            'option1',
            'option2',
            'option3',
            'option4',
            'correct_option',
            'explanation',
            'difficulty',
            'category',
            'points',
            'time_limit'
        ];

        const rows = questions.map(q => [
            `"${q.question_text}"`,
            `"${q.options[0]}"`,
            `"${q.options[1]}"`,
            `"${q.options[2]}"`,
            `"${q.options[3]}"`,
            q.correct_option + 1, // Convert back to 1-4 for CSV
            `"${q.explanation || ''}"`,
            q.difficulty,
            q.category,
            q.points,
            q.time_limit
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        // Set headers for file download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=questions_${event || 'all'}_${Date.now()}.csv`);
        
        res.send(csvContent);

    } catch (error) {
        console.error('Export questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export questions'
        });
    }
});

// ==================== SYSTEM HEALTH ====================

// Get system health and statistics
router.get('/system-health', async (req, res) => {
    try {
        // Get database stats
        const participantCount = await Participant.countDocuments();
        const questionCount = await Question.countDocuments();
        const quizTakenCount = await Participant.countDocuments({ quiz_taken: true });
        
        // Get recent activity
        const recentParticipants = await Participant.find()
            .sort({ registration_date: -1 })
            .limit(5)
            .select('team_code team_name event registration_date');
            
        const recentQuestions = await Question.find()
            .sort({ created_at: -1 })
            .limit(5)
            .select('question_text event created_at');
        
        res.json({
            success: true,
            data: {
                database: {
                    participants: participantCount,
                    questions: questionCount,
                    quizTaken: quizTakenCount
                },
                recentActivity: {
                    participants: recentParticipants,
                    questions: recentQuestions
                },
                server: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system health'
        });
    }
});

// ==================== QUIZ RESULTS ====================

// Get all quiz results for admin
router.get('/quiz-results', async (req, res) => {
    try {
        const { event, page = 1, limit = 50 } = req.query;
        
        // Build query
        const query = {};
        if (event && event !== 'All') query.event = event;
        
        const results = await Participant.find(query)
            .select('team_code team_name team_lead_name event email quiz_score quiz_taken quiz_start_time quiz_end_time quiz_answers college_name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ quiz_end_time: -1 });
        
        const total = await Participant.countDocuments(query);
        
        res.json({
            success: true,
            data: results,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get quiz results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz results'
        });
    }
});

// Get specific participant quiz details
router.get('/quiz-results/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        
        const participant = await Participant.findById(participantId)
            .select('team_code team_name team_lead_name event email quiz_score quiz_taken quiz_start_time quiz_end_time quiz_answers college_name');
        
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }
        
        // Get detailed answer information with questions
        let detailedAnswers = [];
        if (participant.quiz_answers && participant.quiz_answers.length > 0) {
            detailedAnswers = await Promise.all(
                participant.quiz_answers.map(async (answer) => {
                    const question = await Question.findById(answer.question_id);
                    return {
                        ...answer,
                        question_text: question?.question_text,
                        correct_option: question?.correct_option,
                        all_options: question?.options
                    };
                })
            );
        }
        
        res.json({
            success: true,
            data: {
                ...participant.toObject(),
                quiz_answers_detailed: detailedAnswers
            }
        });
    } catch (error) {
        console.error('Get participant quiz details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch participant quiz details'
        });
    }
});

module.exports = router;