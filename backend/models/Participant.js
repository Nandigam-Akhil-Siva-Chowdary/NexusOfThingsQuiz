// models/Participant.js - UPDATED FOR DJANGO COLLECTION
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    id: Number,  // Django's auto-increment ID
    event: {
        type: String,
        required: true,
        enum: ['InnovWEB', 'SensorShowDown', 'IdeaArena', 'Error Erase']
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
    // Quiz fields (will be added by Node.js)
    quiz_taken: {
        type: Boolean,
        default: false
    },
    quiz_score: {
        type: Number,
        min: 0,
        max: 100
    },
    quiz_start_time: Date,
    quiz_end_time: Date,
    quiz_answers: [{
        question_id: mongoose.Schema.Types.ObjectId,
        selected_option: Number,
        is_correct: Boolean,
        time_taken: Number
    }]
}, {
    collection: 'events_participant', // Use Django's collection
    timestamps: true
});

// Create indexes
participantSchema.index({ email: 1 }, { unique: true });
participantSchema.index({ team_code: 1 }, { unique: true });
participantSchema.index({ event: 1 });
participantSchema.index({ quiz_taken: 1 });
participantSchema.index({ quiz_score: -1 });

module.exports = mongoose.model(
  "Participant",              // ✅ Model name (used in ref/populate)
  participantSchema,
  "events_participant"        // ✅ Django collection name
);
