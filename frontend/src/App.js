// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import EmailVerification from './pages/EmailVerification';
import TeamConfirmation from './pages/TeamConfirmation';
import QuizPage from './pages/QuizPage';
import QuizResults from './pages/QuizResults';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/verify-email" />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/confirm-team" element={<TeamConfirmation />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<QuizResults />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;