import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CheckCircle, Email, Phone } from '@mui/icons-material';

function QuizSuccess() {
  const navigate = useNavigate();
  const participantInfo = JSON.parse(sessionStorage.getItem('participantInfo') || '{}');

  useEffect(() => {
    // Clear quiz results from storage so they can't be viewed
    sessionStorage.removeItem('quizResults');
  }, []);

  const handleBackHome = () => {
    // Clear session data
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('participantInfo');
    sessionStorage.removeItem('sessionId');
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 6, display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <CheckCircle 
              sx={{ 
                fontSize: 100, 
                color: '#43e97b',
                animation: 'pulse 2s infinite'
              }} 
            />
          </Box>

          {/* Main Message */}
          <Typography variant="h3" fontWeight="bold" color="#667eea" gutterBottom>
            Quiz Submitted Successfully!
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Details Card */}
          <Card sx={{ mb: 4, bgcolor: '#f5f7fa', border: '2px solid #667eea' }}>
            <CardContent sx={{ py: 3 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Team Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Team Name:</strong> {participantInfo.team_name || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Event:</strong> {participantInfo.event || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Team Lead:</strong> {participantInfo.team_lead_name || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Main Message */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f0f4ff', borderRadius: 2, borderLeft: '4px solid #667eea' }}>
            <Typography variant="h5" gutterBottom fontWeight="600">
              Thank you for submitting the quiz!
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Your responses have been recorded successfully. 
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              <strong>Our team will contact you soon with the results.</strong>
            </Typography>
          </Box>

          {/* Contact Info */}
          <Box sx={{ mb: 4, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              If you have any questions, please contact us:
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Email sx={{ color: '#667eea', mb: 1, fontSize: 28 }} />
                <Typography variant="caption" color="textSecondary" display="block">
                  Email
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  rvr.cseiot2024@gmail.com
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Phone sx={{ color: '#667eea', mb: 1, fontSize: 28 }} />
                <Typography variant="caption" color="textSecondary" display="block">
                  Phone
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  +91 7670855283
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Success Animation Style */}
          <style>{`
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>

          {/* Back Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleBackHome}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontSize: 16,
              fontWeight: 600,
              py: 1.5,
              px: 4,
              borderRadius: 2
            }}
          >
            Back to Home
          </Button>

          {/* Footer Info */}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 4, display: 'block' }}>
            Your quiz responses are secure and will only be viewed by the evaluation team.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default QuizSuccess;
