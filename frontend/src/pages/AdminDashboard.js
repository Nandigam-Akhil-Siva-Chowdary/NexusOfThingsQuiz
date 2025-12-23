// frontend/src/pages/AdminDashboard.js - COMPLETE FIXED VERSION
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

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';

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
    totalQuestions: 0,
    loading: true
  });
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [questionsByEvent, setQuestionsByEvent] = useState([]);

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
      setError('Failed to load data from server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard-stats`);
      if (response.data.success) {
        setStats({
          ...response.data.data,
          loading: false
        });
        setQuestionsByEvent(response.data.data.questionsByEvent || []);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/participants`, {
        params: { 
          event: selectedEvent === 'All' ? null : selectedEvent,
          page: 1,
          limit: 100
        }
      });
      if (response.data.success) {
        setParticipants(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      setParticipants([]);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/questions`, {
        params: { limit: 50 }
      });
      if (response.data.success) {
        setQuestions(response.data.data || []);
      }
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
      
      // Refresh data
      await loadQuestions();
      await loadStats();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || 'Failed to upload questions. Check CSV format.');
      setUploadResult({ 
        success: false, 
        message: error.response?.data?.message || 'Upload failed' 
      });
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
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      setError('No participants to export');
      return;
    }

    try {
      // Create CSV content
      const headers = [
        'Team Code',
        'Team Name',
        'Event',
        'Team Lead',
        'College',
        'Email',
        'Phone',
        'Quiz Score',
        'Quiz Taken',
        'Registration Date'
      ];

      const rows = participants.map(p => [
        p.team_code || '',
        `"${p.team_name || ''}"`,
        p.event || '',
        `"${p.team_lead_name || ''}"`,
        `"${p.college_name || ''}"`,
        p.email || '',
        p.phone_number || '',
        p.quiz_score || 'Not taken',
        p.quiz_taken ? 'Yes' : 'No',
        p.registration_date ? new Date(p.registration_date).toLocaleDateString() : ''
      ]);

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz_results_${selectedEvent}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export CSV');
    }
  };

  const handleViewParticipant = (participant) => {
    // Implement view participant details
    console.log('View participant:', participant);
    alert(`View details for ${participant.team_name}`);
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
        <Typography variant="h4" fontWeight="bold" color="primary">
          Quiz Administration Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
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
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5">{stats.totalParticipants}</Typography>
              <Typography color="textSecondary">Total Registrations</Typography>
              <Typography variant="caption" color="textSecondary">
                Across all events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <BarChart sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5">{stats.averageScore}%</Typography>
              <Typography color="textSecondary">Average Score</Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageScore} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color={
                  stats.averageScore >= 70 ? 'success' :
                  stats.averageScore >= 50 ? 'warning' : 'error'
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>{stats.topScore}%</Typography>
              <Typography color="textSecondary">Top Score</Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.topScore} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Filter and CSV Upload */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterList sx={{ mr: 1 }} /> Filter by Event
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Event</InputLabel>
              <Select
                value={selectedEvent}
                onChange={handleEventChange}
                label="Select Event"
                size="small"
              >
                <MenuItem value="All">All Events</MenuItem>
                <MenuItem value="InnovWEB">InnovWEB</MenuItem>
                <MenuItem value="SensorShowDown">SensorShowDown</MenuItem>
                <MenuItem value="IdeaArena">IdeaArena</MenuItem>
                <MenuItem value="Error Erase">Error Erase</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Showing {participants.length} participants for {selectedEvent === 'All' ? 'all events' : selectedEvent}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
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
                    disabled={uploading}
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
              <Typography variant="body2" color="textSecondary" gutterBottom>
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
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Participants & Scores ({participants.length})
          </Typography>
          <Chip 
            label={`${selectedEvent === 'All' ? 'All Events' : selectedEvent}`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>
        
        {participants.length === 0 ? (
          <Alert severity="info">
            No participants found for the selected event. Try selecting "All Events".
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Team Code</strong></TableCell>
                  <TableCell><strong>Team Name</strong></TableCell>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>Team Lead</strong></TableCell>
                  <TableCell><strong>College</strong></TableCell>
                  <TableCell><strong>Quiz Score</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow 
                    key={participant._id || index}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover' 
                      } 
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                        {participant.team_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
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
                        variant="outlined"
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
                              sx={{ width: 80, mr: 2, height: 6, borderRadius: 3 }}
                              color={
                                participant.quiz_score >= 80 ? 'success' :
                                participant.quiz_score >= 60 ? 'warning' : 'error'
                              }
                            />
                            <Typography variant="body2" fontWeight="medium">
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
                          variant="filled"
                          sx={{ fontWeight: 'medium' }}
                        />
                      ) : (
                        <Chip 
                          label="Pending" 
                          color="warning" 
                          size="small" 
                          variant="filled"
                          sx={{ fontWeight: 'medium' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="text"
                        color="primary"
                        onClick={() => handleViewParticipant(participant)}
                        sx={{ textTransform: 'none' }}
                      >
                        Details
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
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quiz Questions Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Total Questions</Typography>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stats.totalQuestions}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Across all events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Questions by Event:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {questionsByEvent.map((eventData, index) => (
                <Chip 
                  key={index}
                  label={`${eventData._id || 'Unknown'}: ${eventData.count}`}
                  variant="outlined"
                  size="medium"
                  color={
                    eventData._id === 'InnovWEB' ? 'primary' :
                    eventData._id === 'SensorShowDown' ? 'secondary' :
                    eventData._id === 'IdeaArena' ? 'success' : 'warning'
                  }
                />
              ))}
              {questionsByEvent.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No questions data available
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Upload Result Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {uploadResult?.success ? '✅ Upload Successful' : '❌ Upload Failed'}
        </DialogTitle>
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
              <Typography variant="subtitle2" gutterBottom>
                <strong>Upload Details:</strong>
              </Typography>
              <Typography variant="body2">
                • Questions Uploaded: <strong>{uploadResult.data.count}</strong>
              </Typography>
              <Typography variant="body2">
                • Event: <strong>{uploadResult.data.event}</strong>
              </Typography>
              {uploadResult.data.sample && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    <strong>Sample Question:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {uploadResult.data.sample.question_text?.substring(0, 80)}...
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;