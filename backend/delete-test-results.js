// Script to delete test quiz results
const mongoose = require('mongoose');
const Participant = require('./models/Participant');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nexus:nexus%40123@nexus.iw24gsi.mongodb.net/nexus_db?retryWrites=true&w=majority';

async function deleteTestResults() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Emails of test data we created
        const testEmails = [
            'mehulagarwal11111@gmail.com',
            'narendrareddygangireddy3@gmail.com',
            'pabbasaipavan123@gmail.com',
            'bhanunagateja@gmail.com'
        ];

        for (const email of testEmails) {
            const result = await Participant.findOneAndUpdate(
                { email: email },
                {
                    quiz_taken: false,
                    quiz_score: null,
                    quiz_start_time: null,
                    quiz_end_time: null,
                    quiz_answers: []
                },
                { new: true }
            );
            if (result) {
                console.log(`✅ Deleted test data for ${result.team_name}`);
            }
        }

        console.log('\n🗑️  All test data deleted successfully!');
        console.log('Quiz results are now empty. Ready for real participant submissions.');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteTestResults();
