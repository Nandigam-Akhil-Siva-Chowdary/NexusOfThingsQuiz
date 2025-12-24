// frontend/src/pages/QuizResults.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import { EmojiEvents, Score, CheckCircle } from '@mui/icons-material';

function QuizResults() {
  const navigate = useNavigate();
  const results = JSON.parse(sessionStorage.getItem('quizResults') || '{}');
  const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo') || '{}');

  const scorePercentage = results.percentage_score || 0;

  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'success.main';
    if (scorePercentage >= 60) return 'warning.main';
    return 'error.main';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 80) return 'Excellent!';
    if (scorePercentage >= 60) return 'Good Job!';
    if (scorePercentage >= 40) return 'Keep Practicing!';
    return 'Try Again Next Time!';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {scorePercentage >= 60 && <Confetti />}
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmojiEvents sx={{ fontSize: 60, color: getScoreColor(), mb: 2 }} />
          <Typography variant="h3" color={getScoreColor()} gutterBottom>
            {getScoreMessage()}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Quiz Completed Successfully
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Score sx={{ mr: 1 }} /> Score Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h2" color="primary" align="center">
                  {results.score}/{results.total_possible_score}
                </Typography>
                <Typography align="center" color="textSecondary">
                  Total Score
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={scorePercentage} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
                color={
                  scorePercentage >= 80 ? 'success' :
                  scorePercentage >= 60 ? 'warning' : 'error'
                }
              />
              <Typography align="center" color="textSecondary">
                {scorePercentage.toFixed(1)}% Correct
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1 }} /> Performance Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Correct Answers:</Typography>
                <Typography fontWeight="bold" color="success.main">
                  {results.correct_answers}/{results.total_questions}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Time Taken:</Typography>
                <Typography fontWeight="bold">
                  {Math.floor(results.time_taken / 60)}:{(results.time_taken % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Team:</Typography>
                <Typography fontWeight="bold">{participantInfo.team_name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Event:</Typography>
                <Typography fontWeight="bold" color="primary">
                  {participantInfo.event}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ bgcolor: 'info.light', p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            <strong>What's Next?</strong>
          </Typography>
          <Typography variant="body2">
            • Your score has been recorded in our system
          </Typography>
          <Typography variant="body2">
            • Results will be announced during the event
          </Typography>
          <Typography variant="body2">
            • Winners will be contacted via email
          </Typography>
          <Typography variant="body2">
            • Certificate of participation will be provided
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/verify-email')}
          >
            Take Another Quiz
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
          >
            Print Result
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default QuizResults;