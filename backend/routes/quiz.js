// backend/routes/quiz.js
const express = require('express');
const router = express.Router();

const Participant = require('../models/Participant');
const Question = require('../models/Question');
const QuizSession = require('../models/QuizSession');

/**
 * ======================================================
 * START QUIZ
 * POST /api/quiz/start
 * ======================================================
 */
router.post('/start', async (req, res) => {
  try {
    console.log('🔍 Quiz start request received:', req.body);

    const { email, event } = req.body;

    // Validation
    if (!email || !event) {
      return res.status(400).json({
        success: false,
        message: 'Email and event are required'
      });
    }

    // Find participant
    const participant = await Participant.findOne({
      email: email.toLowerCase().trim()
    });

    console.log('Participant found:', participant); 

    if (!participant) {
      return res.status(404).json({
        success: false,
        participant_name: participant.team_lead_name,
        message: 'Participant not found. Please register first.'
      });
    }

    // Prevent reattempt
    if (participant.quiz_taken) {
      return res.status(400).json({
        success: false,
        message: 'Quiz already taken for this participant.'
      });
    }

    // Fetch random questions
    const questions = await Question.aggregate([
      { $match: { event: event, is_active: true } },
      { $sample: { size: 10 } },
      {
        $project: {
          question_text: 1,
          options: 1,
          difficulty: 1,
          category: 1,
          points: 1,
          time_limit: 1
        }
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz questions available for this event'
      });
    }

    // Create session
    const quizSession = new QuizSession({
      participant_id: participant._id,
      event: event,
      total_questions: questions.length,
      start_time: new Date(),
      status: 'in_progress'
    });

    await quizSession.save();

    console.log(
      `✅ Quiz started | Participant: ${participant.email} | Session: ${quizSession._id}`
    );

    return res.status(200).json({
      success: true,
      session_id: quizSession._id,
      participant_name: participant.team_lead_name,
      questions: questions,
      total_questions: questions.length,
      total_time: 600 // seconds (10 minutes)
    });

  } catch (error) {
    console.error('❌ Quiz start error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error starting quiz',
      error: error.message
    });
  }
});

/**
 * ======================================================
 * SUBMIT QUIZ
 * POST /api/quiz/submit
 * ======================================================
 */
router.post('/submit', async (req, res) => {
  try {
    console.log('📝 Quiz submit request received');
    console.log('🔍 Answers received:', JSON.stringify(answers, null, 2));

    const { session_id, answers } = req.body;

    if (!session_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and answers are required'
      });
    }

    const session = await QuizSession.findById(session_id)
      .populate('participant_id');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz already submitted'
      });
    }

    let score = 0;
    let totalPossibleScore = 0;
    let correctAnswers = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = await Question.findById(answer.question_id);

      if (!question) continue;

      const points = question.points || 10;
      totalPossibleScore += points;

      // Compare the selected option index with the correct option index
      const isCorrect = parseInt(answer.selected_option) === parseInt(question.correct_option);

      console.log(`❓ Q: ${question._id} | Selected: ${answer.selected_option} | Correct: ${question.correct_option} | Match: ${isCorrect}`);

      if (isCorrect) {
        score += points;
        correctAnswers++;
      }

      detailedAnswers.push({
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        is_correct: isCorrect,
        time_spent: answer.time_spent || 0
      });
    }

    const percentageScore = totalPossibleScore > 0 
      ? Math.round((score / totalPossibleScore) * 100)
      : 0;

    // Update session
    session.end_time = new Date();
    session.questions_attempted = answers.length;
    session.correct_answers = correctAnswers;
    session.score = score;
    session.time_taken = Math.floor(
      (session.end_time - session.start_time) / 1000
    );
    session.status = 'completed';
    session.answers = detailedAnswers;

    await session.save();

    // Update participant
    await Participant.findByIdAndUpdate(session.participant_id._id, {
      quiz_taken: true,
      quiz_score: percentageScore,
      quiz_start_time: session.start_time,
      quiz_end_time: session.end_time,
      quiz_answers: detailedAnswers
    });

    console.log(
      `✅ Quiz submitted | Session: ${session_id} | Score: ${score}/${totalPossibleScore} (${percentageScore}%)`
    );

    return res.status(200).json({
      success: true,
      score: score,
      total_possible_score: totalPossibleScore,
      percentage_score: percentageScore,
      total_questions: session.total_questions,
      questions_attempted: answers.length,
      correct_answers: correctAnswers,
      time_taken: session.time_taken,
      message: 'Quiz submitted successfully'
    });

  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting quiz',
      error: error.message
    });
  }
});

/**
 * ======================================================
 * GET QUIZ SESSION
 * GET /api/quiz/session/:id
 * ======================================================
 */
router.get('/session/:id', async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.id)
      .populate('participant_id')
      .populate('answers.question_id');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('❌ Get session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
