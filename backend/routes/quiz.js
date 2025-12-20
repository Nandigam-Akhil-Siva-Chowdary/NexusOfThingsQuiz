// backend/routes/quiz.js
const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');

// Get quiz questions for specific event
router.post('/start', async (req, res) => {
    try {
        const { email, event } = req.body;
        
        const participant = await Participant.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (!participant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Participant not found' 
            });
        }

        // Get random questions for the event
        const questions = await Question.aggregate([
            { $match: { event: event, is_active: true } },
            { $sample: { size: 20 } }, // 20 questions per quiz
            { $project: { 
                question_text: 1,
                options: 1,
                difficulty: 1,
                category: 1,
                points: 1,
                time_limit: 1,
                _id: 1 
            }}
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No quiz available for this event' 
            });
        }

        // Create quiz session
        const quizSession = new QuizSession({
            participant_id: participant._id,
            event: event,
            total_questions: questions.length,
            status: 'in_progress'
        });

        await quizSession.save();

        res.json({
            success: true,
            session_id: quizSession._id,
            questions: questions,
            total_time: 1200, // 20 minutes in seconds
            participant_name: participant.team_lead_name
        });

    } catch (error) {
        console.error('Quiz start error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Submit quiz answers
router.post('/submit', async (req, res) => {
    try {
        const { session_id, answers } = req.body;
        
        const session = await QuizSession.findById(session_id)
            .populate('participant_id');

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        // Calculate score
        let score = 0;
        let correctAnswers = 0;
        const detailedAnswers = [];

        for (const answer of answers) {
            const question = await Question.findById(answer.question_id);
            
            if (question) {
                const isCorrect = question.correct_option === answer.selected_option;
                
                if (isCorrect) {
                    score += question.points;
                    correctAnswers++;
                }

                detailedAnswers.push({
                    question_id: answer.question_id,
                    selected_option: answer.selected_option,
                    is_correct: isCorrect,
                    time_spent: answer.time_spent
                });
            }
        }

        // Update session
        session.end_time = new Date();
        session.questions_attempted = answers.length;
        session.correct_answers = correctAnswers;
        session.score = score;
        session.time_taken = Math.floor((session.end_time - session.start_time) / 1000);
        session.status = 'completed';
        session.answers = detailedAnswers;

        await session.save();

        // Update participant
        await Participant.findByIdAndUpdate(session.participant_id._id, {
            quiz_taken: true,
            quiz_score: score,
            quiz_start_time: session.start_time,
            quiz_end_time: session.end_time
        });

        res.json({
            success: true,
            score: score,
            total_questions: session.total_questions,
            correct_answers: correctAnswers,
            time_taken: session.time_taken,
            message: 'Quiz submitted successfully'
        });

    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;