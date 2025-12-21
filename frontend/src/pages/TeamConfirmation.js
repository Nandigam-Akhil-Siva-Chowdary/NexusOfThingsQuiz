// frontend/src/pages/TeamConfirmation.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CheckCircle, Groups, Fullscreen } from '@mui/icons-material';

function TeamConfirmation() {
  const navigate = useNavigate();
  const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo') || '{}');
  const email = sessionStorage.getItem('email');
  const [fullscreenError, setFullscreenError] = useState(false);
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);

  useEffect(() => {
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreenChange = () => {
    // This is now a safe handler
    try {
      const isFullscreen = document.fullscreenElement || 
                          document.webkitFullscreenElement ||
                          document.mozFullScreenElement ||
                          document.msFullscreenElement;
      
      if (!isFullscreen) {
        console.log('User exited fullscreen mode');
      }
    } catch (error) {
      console.warn('Fullscreen change handler error:', error);
    }
  };

  const requestFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      // Remove any existing event listeners first
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Add safe event listeners
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Request fullscreen with proper error handling
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
      
      console.log('✅ Fullscreen requested successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Fullscreen request failed:', error);
      setFullscreenError(true);
      return false;
    }
  };

  const handleConfirm = async () => {
    // Show fullscreen warning dialog
    setShowFullscreenDialog(true);
  };

  const handleStartQuiz = async () => {
    setShowFullscreenDialog(false);
    
    try {
      // Try to enter fullscreen
      const fullscreenSuccess = await requestFullscreen();
      
      if (!fullscreenSuccess) {
        // If fullscreen fails, show warning but continue
        setFullscreenError(true);
        
        const continueAnyway = window.confirm(
          'Fullscreen mode failed to activate. You can still take the quiz, ' +
          'but it is recommended to allow fullscreen for the best experience.\n\n' +
          'Click OK to continue without fullscreen.'
        );
        
        if (!continueAnyway) {
          return; // User cancelled
        }
      }
      
      // Navigate to quiz after a short delay
      setTimeout(() => {
        navigate('/quiz');
      }, 500);
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      // Still navigate to quiz even if fullscreen fails
      navigate('/quiz');
    }
  };

  if (!participantInfo.team_code) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          No participant information found. Please verify your email first.
        </Alert>
        <Button onClick={() => navigate('/verify-email')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      {fullscreenError && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setFullscreenError(false)}>
          Fullscreen permission was denied or not supported. You can still take the quiz, but for the best experience, please allow fullscreen mode when prompted.
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CheckCircle color="success" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" color="primary">
            Email Verified Successfully!
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Please confirm your team details before starting the quiz
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Groups sx={{ mr: 1 }} /> Team Information
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Team Code" 
                secondary={participantInfo.team_code}
                secondaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Team Name" 
                secondary={participantInfo.team_name}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Team Lead" 
                secondary={participantInfo.team_lead_name}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Event" 
                secondary={participantInfo.event}
                secondaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="College" 
                secondary={participantInfo.college_name}
              />
            </ListItem>
            {participantInfo.teammates && participantInfo.teammates.length > 0 && (
              <>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Teammates" 
                    secondary={participantInfo.teammates.join(', ')}
                  />
                </ListItem>
              </>
            )}
          </List>
        </Box>

        <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="body2" color="warning.contrastText">
            <strong>Important Instructions:</strong>
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            1. The quiz will attempt to go fullscreen automatically
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            2. Allow fullscreen when prompted for best experience
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            3. Each question has a time limit
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            4. You can only take the quiz once
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            5. Do not refresh the page during the quiz
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            6. Ensure you have a stable internet connection
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/verify-email')}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleConfirm}
            sx={{ px: 4 }}
            startIcon={<Fullscreen />}
          >
            Start Quiz
          </Button>
        </Box>
      </Paper>

      {/* Fullscreen Confirmation Dialog */}
      <Dialog open={showFullscreenDialog} onClose={() => setShowFullscreenDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fullscreen />
            Fullscreen Mode Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The quiz requires fullscreen mode to ensure a fair and secure testing environment.
          </Typography>
          <Typography paragraph>
            When you click "Continue", your browser will ask for permission to enter fullscreen mode.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> If you deny fullscreen, you can still take the quiz, but some features may be limited.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullscreenDialog(false)}>Cancel</Button>
          <Button onClick={handleStartQuiz} variant="contained" autoFocus>
            Continue to Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeamConfirmation;