// backend/models/Participant.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    event: {
        type: String,
        enum: ['InnovWEB', 'SensorShowDown', 'IdeaArena', 'Error Erase'],
        required: true
    },
    team_code: {
        type: String,
        unique: true,
        required: true
    },
    team_name: {
        type: String,
        required: true
    },
    team_lead_name: {
        type: String,
        required: true
    },
    college_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    teammate1_name: String,
    teammate2_name: String,
    teammate3_name: String,
    teammate4_name: String,
    registration_date: {
        type: Date,
        default: Date.now
    },
    idea_description: String,
    idea_file_url: String,
    quiz_taken: {
        type: Boolean,
        default: false
    },
    quiz_score: Number,
    quiz_start_time: Date,
    quiz_end_time: Date,
    quiz_answers: [{
        question_id: mongoose.Schema.Types.ObjectId,
        selected_option: Number,
        is_correct: Boolean,
        time_taken: Number // in seconds
    }]
});

module.exports = mongoose.model('Participant', participantSchema);