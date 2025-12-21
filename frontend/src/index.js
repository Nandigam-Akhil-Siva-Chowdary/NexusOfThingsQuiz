// src/index.js - COMPLETE VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Add performance monitoring
// const reportWebVitals = (metric) => {
//   console.log(metric);
// };
// reportWebVitals();