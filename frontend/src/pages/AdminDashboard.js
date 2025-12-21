// AdminDashboard.js - FIXED VERSION WITH REAL DATA
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Upload, BarChart, People, Quiz, Refresh, Download, FilterList } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    quizTaken: 0,
    averageScore: 0,
    topScore: 0,
    loading: true
  });
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadParticipants(),
        loadQuestions()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get participants with quiz scores
      const response = await axios.get(`${API_URL}/auth/participants`);
      const allParticipants = response.data.data || [];
      
      // Calculate stats
      const participantsWithQuiz = allParticipants.filter(p => p.quiz_score !== undefined && p.quiz_score !== null);
      const scores = participantsWithQuiz.map(p => p.quiz_score);
      
      const statsData = {
        totalParticipants: allParticipants.length,
        quizTaken: participantsWithQuiz.length,
        averageScore: scores.length > 0 ? 
          Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        topScore: scores.length > 0 ? Math.max(...scores) : 0,
        loading: false
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/participants`);
      const allParticipants = response.data.data || [];
      
      // Filter based on selected event
      const filtered = selectedEvent === 'All' 
        ? allParticipants 
        : allParticipants.filter(p => p.event === selectedEvent);
      
      // Sort by quiz score (highest first)
      const sorted = [...filtered].sort((a, b) => {
        const scoreA = a.quiz_score || 0;
        const scoreB = b.quiz_score || 0;
        return scoreB - scoreA;
      });
      
      setParticipants(sorted);
    } catch (error) {
      console.error('Failed to load participants:', error);
      setParticipants([]);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/questions`);
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestions([]);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('event', selectedEvent === 'All' ? 'InnovWEB' : selectedEvent);

    try {
      const response = await axios.post(`${API_URL}/admin/upload-questions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadResult(response.data);
      setOpenDialog(true);
      setCsvFile(null);
      
      // Refresh questions list
      loadQuestions();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || 'Failed to upload questions');
      setUploadResult({ success: false, message: 'Upload failed' });
      setOpenDialog(true);
    } finally {
      setUploading(false);
    }
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
    // Reload participants for selected event
    setTimeout(() => loadParticipants(), 100);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const handleExportCSV = () => {
    // Convert participants data to CSV
    const csvContent = [
      ['Team Code', 'Team Name', 'Event', 'Team Lead', 'College', 'Email', 'Phone', 'Quiz Score', 'Quiz Taken', 'Registration Date'].join(','),
      ...participants.map(p => [
        p.team_code,
        `"${p.team_name}"`,
        p.event,
        `"${p.team_lead_name}"`,
        `"${p.college_name}"`,
        p.email,
        p.phone_number,
        p.quiz_score || 'Not taken',
        p.quiz_taken ? 'Yes' : 'No',
        new Date(p.registration_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${selectedEvent}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Quiz Administration Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={handleExportCSV}
            disabled={participants.length === 0}
          >
            Export CSV
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5">{stats.totalParticipants}</Typography>
              <Typography color="textSecondary">Total Registrations</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Quiz sx={{ fontSize: 40, color: stats.quizTaken > 0 ? 'success.main' : 'text.disabled', mb: 2 }} />
              <Typography variant="h5">{stats.quizTaken}</Typography>
              <Typography color="textSecondary">Quiz Attempted</Typography>
              <Typography variant="caption" color="textSecondary">
                {stats.totalParticipants > 0 ? 
                  `${Math.round((stats.quizTaken / stats.totalParticipants) * 100)}% completion` : 
                  'No participants'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <BarChart sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5">{stats.averageScore}%</Typography>
              <Typography color="textSecondary">Average Score</Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageScore} 
                sx={{ mt: 1, height: 6 }}
                color={
                  stats.averageScore >= 70 ? 'success' :
                  stats.averageScore >= 50 ? 'warning' : 'error'
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>{stats.topScore}%</Typography>
              <Typography color="textSecondary">Top Score</Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.topScore} 
                sx={{ mt: 2, height: 8 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Filter and CSV Upload */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterList sx={{ mr: 1 }} /> Filter by Event
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Event</InputLabel>
              <Select
                value={selectedEvent}
                onChange={handleEventChange}
                label="Select Event"
              >
                <MenuItem value="All">All Events</MenuItem>
                <MenuItem value="InnovWEB">InnovWEB</MenuItem>
                <MenuItem value="SensorShowDown">SensorShowDown</MenuItem>
                <MenuItem value="IdeaArena">IdeaArena</MenuItem>
                <MenuItem value="Error Erase">Error Erase</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Showing {participants.length} participants for {selectedEvent}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Upload sx={{ mr: 1 }} /> Upload Quiz Questions
            </Typography>
            
            <form onSubmit={handleFileUpload}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {csvFile ? csvFile.name : 'Choose CSV File'}
                    <input
                      type="file"
                      hidden
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!csvFile || uploading}
                    startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
                  >
                    {uploading ? 'Uploading...' : 'Upload Questions'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box sx={{ mt: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>CSV Format Required:</strong>
              </Typography>
              <Typography variant="caption" color="textSecondary" component="div">
                question,option1,option2,option3,option4,correct_option,explanation,difficulty,category,points,time_limit
              </Typography>
              <Typography variant="caption" color="textSecondary" component="div">
                <strong>Note:</strong> correct_option should be 1-4 (1=first option)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Participants Table */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Participants & Scores ({participants.length})
          </Typography>
          <Chip 
            label={`${selectedEvent === 'All' ? 'All Events' : selectedEvent}`} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        {participants.length === 0 ? (
          <Alert severity="info">
            No participants found for the selected event. Try selecting "All Events".
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Code</TableCell>
                  <TableCell>Team Name</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Team Lead</TableCell>
                  <TableCell>College</TableCell>
                  <TableCell>Quiz Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={participant._id || index}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {participant.team_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {participant.team_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={participant.event} 
                        size="small" 
                        color={
                          participant.event === 'InnovWEB' ? 'primary' :
                          participant.event === 'SensorShowDown' ? 'secondary' :
                          participant.event === 'IdeaArena' ? 'success' : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>{participant.team_lead_name}</TableCell>
                    <TableCell>{participant.college_name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {participant.quiz_score !== undefined && participant.quiz_score !== null ? (
                          <>
                            <LinearProgress 
                              variant="determinate" 
                              value={participant.quiz_score} 
                              sx={{ width: 100, mr: 2, height: 8 }}
                              color={
                                participant.quiz_score >= 80 ? 'success' :
                                participant.quiz_score >= 60 ? 'warning' : 'error'
                              }
                            />
                            <Typography fontWeight="medium">
                              {participant.quiz_score}%
                            </Typography>
                          </>
                        ) : (
                          <Typography color="textSecondary" variant="body2">
                            Not taken
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {participant.quiz_taken ? (
                        <Chip 
                          label="Completed" 
                          color="success" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Pending" 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          // View details - you can implement this
                          console.log('View details:', participant);
                        }}
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
      </Paper>

      {/* Questions Summary */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quiz Questions Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Total Questions</Typography>
                <Typography variant="h3" color="primary">
                  {questions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="textSecondary">
              Questions by Event:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {['InnovWEB', 'SensorShowDown', 'IdeaArena', 'Error Erase'].map(event => {
                const count = questions.filter(q => q.event === event).length;
                return (
                  <Chip 
                    key={event}
                    label={`${event}: ${count}`}
                    variant="outlined"
                    size="small"
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Upload Result Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Upload Result</DialogTitle>
        <DialogContent>
          {uploadResult?.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {uploadResult.message}
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadResult?.message || 'Upload failed'}
            </Alert>
          )}
          {uploadResult?.data && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Details:</strong>
              </Typography>
              <Typography variant="body2">
                • Uploaded: {uploadResult.data.count} questions
              </Typography>
              <Typography variant="body2">
                • Event: {uploadResult.data.event}
              </Typography>
              {uploadResult.data.sample && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Sample Question:</strong> {uploadResult.data.sample.question_text.substring(0, 50)}...
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;