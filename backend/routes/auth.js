// routes/auth.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const Participant = require('../models/Participant');

// Check if email exists in database
router.post('/verify-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        // Case-insensitive search
        const participant = await Participant.findOne({ 
            email: { $regex: new RegExp('^' + email + '$', 'i') }
        });

        if (!participant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found. Please register for the event first.' 
            });
        }

        if (participant.quiz_taken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quiz already taken for this registration.' 
            });
        }

        // Return participant info (excluding sensitive data)
        const participantInfo = {
            team_code: participant.team_code,
            team_name: participant.team_name,
            team_lead_name: participant.team_lead_name,
            event: participant.event,
            college_name: participant.college_name,
            email: participant.email,
            teammates: [
                participant.teammate1_name,
                participant.teammate2_name,
                participant.teammate3_name,
                participant.teammate4_name
            ].filter(name => name && name.trim() !== '')
        };

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: participantInfo
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get all participants (for admin dashboard)
router.get('/participants', async (req, res) => {
    try {
        const { event, hasQuiz, page = 1, limit = 100 } = req.query;
        
        // Build query
        const query = {};
        if (event && event !== 'All') query.event = event;
        if (hasQuiz === 'true') query.quiz_taken = true;
        if (hasQuiz === 'false') query.quiz_taken = false;
        
        const participants = await Participant.find(query)
            .select('team_code team_name event team_lead_name college_name email phone_number quiz_score quiz_taken registration_date')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ registration_date: -1 });

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

// Get participant by team code
router.get('/participant/:team_code', async (req, res) => {
    try {
        const { team_code } = req.params;
        
        const participant = await Participant.findOne({ team_code })
            .select('-__v');
        
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

// Update participant quiz status
router.put('/participant/:id/quiz-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { quiz_score, quiz_taken } = req.body;
        
        const updateData = {};
        if (quiz_score !== undefined) updateData.quiz_score = quiz_score;
        if (quiz_taken !== undefined) updateData.quiz_taken = quiz_taken;
        
        const participant = await Participant.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('team_code team_name event quiz_score quiz_taken');
        
        if (!participant) {
            return res.status(404).json({ 
                success: false, 
                message: 'Participant not found' 
            });
        }

        res.json({
            success: true,
            message: 'Quiz status updated successfully',
            data: participant
        });

    } catch (error) {
        console.error('Update quiz status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update quiz status' 
        });
    }
});

module.exports = router;