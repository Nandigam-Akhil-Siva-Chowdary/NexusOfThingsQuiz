// frontend/src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdminPanelSettings, LockOpen } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the actual backend login endpoint
      const response = await axios.post(`${API_URL}/admin/login`, {
        username,
        password
      });
      
      if (response.data.success) {
        // Store authentication token and user info
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify(response.data.user));
        sessionStorage.setItem('adminLoginTime', new Date().toISOString());
        
        // Navigate to dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.message || 'Invalid credentials');
      } else if (err.request) {
        // No response received
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        // Other errors
        setError('Login failed. Please try again.');
      }
      
      // Fallback to local authentication if server is down
      console.log('Falling back to local authentication...');
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'administrator' }));
        sessionStorage.setItem('adminLoginTime', new Date().toISOString());
        navigate('/admin/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement password reset functionality
    setError('Please contact system administrator for password reset.');
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/health`);
      alert(`✅ Server is running!\nStatus: ${response.data.status}\nMongoDB: ${response.data.mongodb}`);
    } catch (err) {
      alert(`❌ Cannot connect to server at ${API_URL}\nPlease make sure backend is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2 
          }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            <LockOpen sx={{ fontSize: 48, color: 'secondary.main' }} />
          </Box>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            Nexus Quiz Admin
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Administrator Login Portal
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 3 }}
            disabled={loading}
            autoComplete="username"
            autoFocus
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={loading}
            autoComplete="current-password"
          />

          <Box sx={{ mb: 3, textAlign: 'right' }}>
            <Button
              size="small"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading || !username || !password}
            sx={{ 
              py: 1.5,
              mb: 2
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleTestConnection}
            disabled={loading}
            sx={{ mb: 1 }}
          >
            Test Server Connection
          </Button>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Default Credentials:</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div">
            Username: admin
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div">
            Password: admin123
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              <strong>Note:</strong> For security reasons, change these credentials in production.
            </Typography>
          </Box>
        </Box>

        {/* Server Status Indicator */}
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'success.main',
              mr: 1,
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography variant="caption" color="textSecondary">
            Server: localhost:10000
          </Typography>
        </Box>
      </Paper>

      {/* Instructions Box */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📋 Administrator Instructions:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          1. Upload quiz questions for each event via CSV
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          2. Monitor participant quiz scores and completion rates
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          3. Export data for reporting and analysis
        </Typography>
        <Typography variant="body2">
          4. Manage quiz content and system settings
        </Typography>
      </Paper>

      <style jsx="true">{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Container>
  );
}

export default AdminLogin;