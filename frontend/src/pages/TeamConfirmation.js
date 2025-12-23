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
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);

  // Remove aria-hidden from root element
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement.hasAttribute('aria-hidden')) {
      rootElement.removeAttribute('aria-hidden');
    }
  }, []);

  const requestFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      }
      return true;
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      return false;
    }
  };

  const handleConfirm = () => {
    setShowFullscreenDialog(true);
  };

  const handleStartQuiz = async () => {
    setShowFullscreenDialog(false);
    
    try {
      await requestFullscreen();
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/quiz');
      }, 300);
    } catch (error) {
      console.error('Error:', error);
      // Still navigate even if fullscreen fails
      navigate('/quiz');
    }
  };

  if (!participantInfo.team_code) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          No participant information found.
        </Alert>
        <Button onClick={() => navigate('/verify-email')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
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
            1. The quiz will be in fullscreen mode
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            2. Each question has a time limit
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            3. You can only take the quiz once
          </Typography>
          <Typography variant="body2" color="warning.contrastText">
            4. Do not refresh the page during the quiz
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

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreenDialog} onClose={() => setShowFullscreenDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fullscreen />
            Fullscreen Mode
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The quiz requires fullscreen mode. Click Continue to enter fullscreen and start the quiz.
          </Typography>
          <Alert severity="info">
            If you deny fullscreen, you can still take the quiz.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFullscreenDialog(false)}>Cancel</Button>
          <Button onClick={handleStartQuiz} variant="contained" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeamConfirmation;