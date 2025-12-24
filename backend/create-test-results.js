// Script to create test quiz results for development
const mongoose = require('mongoose');
const Participant = require('./models/Participant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nexus:nexus%40123@nexus.iw24gsi.mongodb.net/nexus_db?retryWrites=true&w=majority';

async function createTestResults() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update some participants with completed quiz data
        const updates = [
            {
                email: 'mehulagarwal11111@gmail.com',
                updates: {
                    quiz_taken: true,
                    quiz_score: 85,
                    quiz_start_time: new Date(Date.now() - 3600000),
                    quiz_end_time: new Date(Date.now() - 1800000),
                    quiz_answers: [
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 0, is_correct: true, time_taken: 15 },
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 1, is_correct: true, time_taken: 20 },
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 2, is_correct: false, time_taken: 10 }
                    ]
                }
            },
            {
                email: 'narendrareddygangireddy3@gmail.com',
                updates: {
                    quiz_taken: true,
                    quiz_score: 92,
                    quiz_start_time: new Date(Date.now() - 5400000),
                    quiz_end_time: new Date(Date.now() - 3600000),
                    quiz_answers: [
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 0, is_correct: true, time_taken: 12 },
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 1, is_correct: true, time_taken: 18 }
                    ]
                }
            },
            {
                email: 'pabbasaipavan123@gmail.com',
                updates: {
                    quiz_taken: true,
                    quiz_score: 78,
                    quiz_start_time: new Date(Date.now() - 7200000),
                    quiz_end_time: new Date(Date.now() - 5400000),
                    quiz_answers: [
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 0, is_correct: true, time_taken: 20 },
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 2, is_correct: false, time_taken: 25 }
                    ]
                }
            },
            {
                email: 'bhanunagateja@gmail.com',
                updates: {
                    quiz_taken: true,
                    quiz_score: 88,
                    quiz_start_time: new Date(Date.now() - 9000000),
                    quiz_end_time: new Date(Date.now() - 7200000),
                    quiz_answers: [
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 1, is_correct: true, time_taken: 18 },
                        { question_id: new mongoose.Types.ObjectId(), selected_option: 0, is_correct: true, time_taken: 22 }
                    ]
                }
            }
        ];

        for (const item of updates) {
            const result = await Participant.findOneAndUpdate(
                { email: item.email },
                item.updates,
                { new: true }
            );
            if (result) {
                console.log(`✅ Updated ${result.team_name}: Score ${result.quiz_score}%`);
            } else {
                console.log(`❌ Participant with email ${item.email} not found`);
            }
        }

        console.log('\n📊 Test results created successfully!');
        console.log('Visit http://localhost:3000/admin/results to view them');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestResults();
