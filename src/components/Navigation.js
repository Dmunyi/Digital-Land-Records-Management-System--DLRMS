/**
 * Navigation Component
 * Top navigation bar with user menu and logout
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Navigation.css';

function Navigation({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-logo">
            🏛️ DLRMS
          </Link>
          <span className="brand-name">Digital Land Records</span>
        </div>

        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/records" className="nav-link">
              Records
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <Link to="/reports" className="nav-link">
                Reports
              </Link>
            </li>
          )}
          {user && (user.role === 'MANAGER' || user.role === 'ADMIN') && (
            <li>
              <Link to="/audit-logs" className="nav-link">
                Audit Logs
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-user">
          <span className="user-info">
            👤 {user?.fullName} (<span className="role-badge">{user?.role}</span>)
          </span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
