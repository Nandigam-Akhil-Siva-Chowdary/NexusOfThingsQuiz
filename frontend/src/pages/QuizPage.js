// frontend/src/pages/QuizPage.js - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Countdown from 'react-countdown';
import Confetti from 'react-confetti';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Timer, CheckCircle, ErrorOutline } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [sessionId, setSessionId] = useState('');
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Function to exit fullscreen safely
  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.warn('Error exiting fullscreen:', error);
    }
  };

  // Function to handle quiz submission
  const handleSubmitQuiz = async () => {
    try {
      // Prepare answers for submission
      const answers = Object.entries(selectedAnswers).map(([index, option]) => ({
        question_id: questions[parseInt(index)]._id,
        selected_option: option,
        time_spent: 30 // This should be calculated per question in real implementation
      }));

      const response = await axios.post(`${API_URL}/quiz/submit`, {
        session_id: sessionId,
        answers
      });

      if (response.data.success) {
        // Store results
        sessionStorage.setItem('quizResults', JSON.stringify(response.data));
        setQuizCompleted(true);
        
        // Exit fullscreen after delay
        setTimeout(() => {
          exitFullscreen();
          navigate('/results');
        }, 1000);
      }
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    }
  };

  // Function called when time is up
  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleSubmitQuiz();
  };

  const startQuiz = async () => {
    try {
      const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo') || '{}');
      const email = sessionStorage.getItem('email');

      const response = await axios.post(`${API_URL}/quiz/start`, {
        email,
        event: participantInfo.event
      });

      if (response.data.success) {
        setQuestions(response.data.questions);
        setSessionId(response.data.session_id);
        setQuizStarted(true);
        
        // Start timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleTimeUp();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startQuiz();
    
    // SAFE fullscreen change handler
    const handleFullscreenChange = () => {
      try {
        const isFullscreen = document.fullscreenElement || 
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement ||
                            document.msFullscreenElement;
        
        if (!isFullscreen && quizStarted && !quizCompleted) {
          console.log('User exited fullscreen during quiz');
          // Don't force re-enter fullscreen - just warn
          setError('You exited fullscreen mode. Please stay in fullscreen for best experience.');
        }
      } catch (error) {
        console.warn('Fullscreen change error:', error);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Exit fullscreen when component unmounts
      exitFullscreen();
    };
  }, [quizStarted, quizCompleted]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Quiz...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/verify-email')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Starting Quiz...</Typography>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {quizCompleted && <Confetti />}
      
      {/* Quiz Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" color="primary">
            Question {currentQuestion + 1} of {questions.length}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              <Countdown 
                date={Date.now() + timeLeft * 1000}
                renderer={({ minutes, seconds }) => (
                  <span>{minutes}:{seconds < 10 ? '0' : ''}{seconds}</span>
                )}
              />
            </Typography>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Question */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQ.question_text}
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%', mt: 3 }}>
          <RadioGroup
            value={selectedAnswers[currentQuestion] ?? ''}
            onChange={(e) => handleAnswerSelect(currentQuestion, parseInt(e.target.value))}
          >
            {currentQ.options.map((option, index) => (
              <Paper 
                key={index} 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 2,
                  border: selectedAnswers[currentQuestion] === index ? '2px solid' : '1px solid',
                  borderColor: selectedAnswers[currentQuestion] === index ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
              >
                <FormControlLabel
                  value={index.toString()}
                  control={<Radio />}
                  label={
                    <Typography variant="body1">
                      {String.fromCharCode(65 + index)}. {option}
                    </Typography>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Paper>
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowSubmitDialog(true)}
            sx={{ mr: 2 }}
          >
            Submit Quiz
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {currentQuestion === questions.length - 1 ? 'Review' : 'Next'}
          </Button>
        </Box>
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your quiz? You cannot change answers after submission.
          </Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Questions answered: {Object.keys(selectedAnswers).length}/{questions.length}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'warning.main' }}>
            Note: After submission, you will be redirected to results page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitQuiz} variant="contained" color="primary">
            Submit Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default QuizPage;