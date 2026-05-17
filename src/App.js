/**
 * App Component
 * Main application component with routing
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import './styles/global.css';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecordsListPage from './pages/RecordsListPage';
import RecordDetailPage from './pages/RecordDetailPage';
import CreateRecordPage from './pages/CreateRecordPage';
import AuditLogsPage from './pages/AuditLogsPage';
import RecordReportsPage from './pages/RecordReportsPage';

// Import Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      {user && <Navigation user={user} setUser={setUser} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/records" element={<RecordsListPage user={user} />} />
          <Route path="/records/:id" element={<RecordDetailPage user={user} />} />
          <Route path="/records/create" element={<CreateRecordPage user={user} />} />
          <Route
            path="/records/:id/edit"
            element={user?.role === 'ADMIN' ? <CreateRecordPage user={user} /> : <Navigate to="/records" replace />}
          />
          <Route path="/audit-logs" element={<AuditLogsPage user={user} />} />
          <Route
            path="/reports"
            element={user?.role === 'ADMIN' ? <RecordReportsPage user={user} /> : <Navigate to="/dashboard" replace />}
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
