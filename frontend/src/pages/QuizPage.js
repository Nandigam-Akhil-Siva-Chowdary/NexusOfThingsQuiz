import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Timer,
  ArrowBack,
  ArrowForward,
  Fullscreen,
  FullscreenExit,
  ExitToApp
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function QuizPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [sessionId, setSessionId] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantName, setParticipantName] = useState('');

  const timerRef = useRef(null);
  const startInitiatedRef = useRef(false); // 🔐 one-time guard

  /* ---------------- FULLSCREEN ---------------- */

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {
      console.warn('Fullscreen blocked');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch {}
  };

  /* ---------------- START QUIZ ---------------- */

  const startQuiz = async () => {
    if (startInitiatedRef.current) return; // ✅ BLOCK DUPLICATES
    startInitiatedRef.current = true;

    setLoading(true);

    try {
      const participantInfo = JSON.parse(
        sessionStorage.getItem('participantInfo') || '{}'
      );
      const email = sessionStorage.getItem('email');

      if (!email || !participantInfo.event) {
        throw new Error('Missing participant info');
      }

      const res = await axios.post(`${API_URL}/api/quiz/start`, {
        email: email.toLowerCase().trim(),
        event: participantInfo.event
      });

      setQuestions(res.data.questions || []);
      setSessionId(res.data.session_id);
      setParticipantName(res.data.participant_name || 'Participant');
      setTimeLeft(res.data.total_time || 600);
      setQuizStarted(true);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start quiz:', err);
      startInitiatedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmitQuiz = useCallback(async () => {
    setShowSubmitDialog(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const answers = Object.entries(selectedAnswers).map(([idx, opt]) => ({
      question_id: questions[idx]?._id,
      selected_option: opt,
      time_spent: 30
    }));

    await axios.post(`${API_URL}/api/quiz/submit`, {
      session_id: sessionId,
      answers
    });

    // Don't store results in session storage (so participants can't access them)
    // Results are already stored in the database for admins to view
    setQuizCompleted(true);

    setTimeout(async () => {
      await exitFullscreen();
      navigate('/quiz-success');
    }, 2000);
  }, [questions, selectedAnswers, sessionId, navigate]);

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // ❌ DO NOT reset startInitiatedRef here
    };
  }, []);

  /* ---------------- UI STATES ---------------- */

  if (!quizStarted && !loading) {
    return (
      <Container sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to Start Quiz?
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={async () => {
              await enterFullscreen(); // ✅ USER GESTURE
              startQuiz();
            }}
          >
            Start Quiz
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {quizCompleted && <Confetti />}

      {/* HEADER */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{participantName}</Typography>

          <Box display="flex" gap={2}>
            <IconButton onClick={isFullscreen ? exitFullscreen : enterFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

            <Box display="flex" alignItems="center">
              <Timer sx={{ mr: 1 }} />
              <Countdown date={Date.now() + timeLeft * 1000} />
            </Box>

            <IconButton color="error" onClick={() => navigate('/verify-email')}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Box>

        <LinearProgress value={progress} variant="determinate" sx={{ mt: 2 }} />
      </Paper>

      {/* QUESTION */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">{currentQ?.question_text}</Typography>

        <RadioGroup
          value={selectedAnswers[currentQuestion] ?? ''}
          onChange={(e) =>
            setSelectedAnswers(p => ({ ...p, [currentQuestion]: Number(e.target.value) }))
          }
        >
          {currentQ?.options.map((opt, idx) => (
            <FormControlLabel
              key={idx}
              value={idx}
              control={<Radio />}
              label={opt}
            />
          ))}
        </RadioGroup>
      </Paper>

      {/* NAV */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(p => p - 1)}
          startIcon={<ArrowBack />}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          onClick={
            currentQuestion === questions.length - 1
              ? () => setShowSubmitDialog(true)
              : () => setCurrentQuestion(p => p + 1)
          }
          endIcon={<ArrowForward />}
        >
          {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>

      {/* SUBMIT DIALOG */}
      <Dialog open={showSubmitDialog}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          Answered {answeredCount} / {questions.length}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitQuiz}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default QuizPage;
