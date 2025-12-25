import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Chip,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  ArrowBack, 
  Download, 
  Visibility,
  CheckCircle,
  Close,
  Refresh
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'https://nexus-quiz-backend.onrender.com/api';

function AdminResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [participantDetails, setParticipantDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, [selectedEvent]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/quiz-results`, {
        params: {
          event: selectedEvent === 'All' ? null : selectedEvent,
          limit: 100
        }
      });
      if (response.data.success) {
        setResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantDetails = async (participantId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/quiz-results/${participantId}`);
      if (response.data.success) {
        setParticipantDetails(response.data.data);
        setDetailsDialog(true);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
      setParticipantDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const exportResults = () => {
    try {
      const headers = [
        'Team Code',
        'Team Name',
        'Lead Name',
        'Event',
        'Score',
        'Status',
        'Submission Time'
      ];

      const rows = results
        .filter(r => r.quiz_taken)
        .map(r => [
          r.team_code || '',
          r.team_name || '',
          r.team_lead_name || '',
          r.event || '',
          r.quiz_score || '0',
          'Completed',
          r.quiz_end_time ? new Date(r.quiz_end_time).toLocaleString() : ''
        ]);

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-results-${selectedEvent}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const completedCount = results.filter(r => r.quiz_taken).length;
  const averageScore = results.filter(r => r.quiz_taken)
    .reduce((sum, r) => sum + (r.quiz_score || 0), 0) / completedCount || 0;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      {/* AppBar */}
      <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Quiz Results - {selectedEvent}
          </Typography>
          <Button
            color="inherit"
            startIcon={<Refresh />}
            onClick={() => loadResults()}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            color="inherit"
            startIcon={<Download />}
            onClick={exportResults}
            disabled={completedCount === 0}
          >
            Export CSV
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="body2" opacity={0.9}>Total Results</Typography>
                <Typography variant="h3" fontWeight="bold">{results.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(67, 233, 123, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="body2" opacity={0.9}>Completed</Typography>
                <Typography variant="h3" fontWeight="bold">{completedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="body2" opacity={0.9}>Average Score</Typography>
                <Typography variant="h3" fontWeight="bold">{Math.round(averageScore)}%</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="body2" opacity={0.9}>Pending</Typography>
                <Typography variant="h3" fontWeight="bold">{results.length - completedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Event Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['All', 'InnovWEB', 'SensorShowDown', 'IdeaArena', 'Error Erase'].map(event => (
            <Button
              key={event}
              variant={selectedEvent === event ? 'contained' : 'outlined'}
              onClick={() => setSelectedEvent(event)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                ...(selectedEvent === event && {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                })
              }}
            >
              {event}
            </Button>
          ))}
        </Box>

        {/* Results Table */}
        <Card sx={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderRadius: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : completedCount === 0 ? (
            <CardContent>
              <Alert severity="info">No completed quizzes yet for {selectedEvent}</Alert>
            </CardContent>
          ) : (
            <TableContainer sx={{ maxHeight: 700 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }}>Team Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }}>Team Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }}>Lead</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#667eea' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results
                    .filter(r => r.quiz_taken)
                    .sort((a, b) => (b.quiz_score || 0) - (a.quiz_score || 0))
                    .map((result, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>
                          {result.team_code}
                        </TableCell>
                        <TableCell>{result.team_name}</TableCell>
                        <TableCell>{result.team_lead_name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={result.quiz_score || 0}
                              sx={{ width: 70, height: 6, borderRadius: 3 }}
                              color={
                                (result.quiz_score || 0) >= 80 ? 'success' :
                                (result.quiz_score || 0) >= 60 ? 'warning' : 'error'
                              }
                            />
                            <Typography fontWeight="bold">
                              {result.quiz_score || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircle />}
                            label="Completed"
                            color="success"
                            size="small"
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => loadParticipantDetails(result._id)}
                            sx={{ borderRadius: 1 }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Container>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Quiz Details - {participantDetails?.team_name}
          </Typography>
          <Button
            color="inherit"
            onClick={() => setDetailsDialog(false)}
            size="small"
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto' }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : participantDetails ? (
            <Box>
              {/* Header Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f7fa' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Team Code</Typography>
                    <Typography variant="body1" fontWeight="bold">{participantDetails.team_code}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Team Lead</Typography>
                    <Typography variant="body1" fontWeight="bold">{participantDetails.team_lead_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Event</Typography>
                    <Typography variant="body1" fontWeight="bold">{participantDetails.event}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Email</Typography>
                    <Typography variant="body1" fontWeight="bold">{participantDetails.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Score</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {participantDetails.quiz_score}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Submission Time</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {new Date(participantDetails.quiz_end_time).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Answers */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Answer Review
              </Typography>
              {participantDetails.quiz_answers_detailed?.map((answer, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${answer.is_correct ? '#43e97b' : '#f5576c'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Q{idx + 1}: {answer.question_text}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Options:
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {answer.all_options?.map((opt, optIdx) => (
                          <Typography
                            key={optIdx}
                            variant="body2"
                            sx={{
                              p: 0.5,
                              bgcolor: optIdx === answer.correct_option ? '#f0f4ff' : 'transparent',
                              borderRadius: 1,
                              fontWeight: optIdx === answer.correct_option ? 600 : 400,
                              color: optIdx === answer.correct_option ? '#667eea' : 'inherit'
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                            {optIdx === answer.correct_option && <span> ✓</span>}
                          </Typography>
                        ))}
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>User's Answer:</strong> {answer.all_options?.[answer.selected_option]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {answer.is_correct ? (
                        <Chip label="Correct" color="success" icon={<CheckCircle />} />
                      ) : (
                        <Chip label="Wrong" color="error" icon={<Close />} />
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AdminResults;
