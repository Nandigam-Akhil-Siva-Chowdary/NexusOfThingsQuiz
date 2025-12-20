// backend/models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    event: {
        type: String,
        enum: ['InnovWEB', 'SensorShowDown', 'IdeaArena', 'Error Erase'],
        required: true
    },
    question_text: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correct_option: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    explanation: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    category: String,
    points: {
        type: Number,
        default: 10
    },
    time_limit: {
        type: Number, // in seconds
        default: 30
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Question', questionSchema);