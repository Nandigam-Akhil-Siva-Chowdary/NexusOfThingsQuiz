// backend/models/QuizSession.js
const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
    participant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
        required: true
    },
    event: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: Date,
    total_questions: Number,
    questions_attempted: Number,
    correct_answers: Number,
    score: Number,
    time_taken: Number, // in seconds
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    answers: [{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selected_option: Number,
        is_correct: Boolean,
        time_spent: Number
    }]
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);