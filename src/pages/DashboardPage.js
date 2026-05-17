/**
 * Dashboard Page
 * Main dashboard showing overview and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recordsAPI } from '../services/api';
import './Dashboard.css';

function DashboardPage({ user }) {
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingRecords: 0,
    completedRecords: 0,
    processingRecords: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all records
        const response = await recordsAPI.getAllRecords({ limit: 1000 });
        const records = response.data.data;

        // Calculate statistics
        const pendingRecords = records.filter(r => r.status === 'PENDING').length;
        const processingRecords = records.filter(r => r.status === 'PROCESSING').length;
        const completedRecords = records.filter(r => r.status === 'COMPLETED').length;

        setStats({
          totalRecords: records.length,
          pendingRecords,
          processingRecords,
          completedRecords,
        });

        // Get recent records
        setRecentRecords(records.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container mt">
      <h1>🏠 Dashboard</h1>
      <p className="subtitle">Welcome back, {user?.fullName}!</p>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalRecords}</h3>
            <p>Total Records</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRecords}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>{stats.processingRecords}</h3>
            <p>Processing</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedRecords}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt">
        <div className="card-header">Quick Actions</div>
        <div className="action-buttons">
          <Link to="/records" className="btn btn-primary">
            View All Records
          </Link>
          {(user?.role === 'OFFICER' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <Link to="/records/create" className="btn btn-success">
              + Create New Record
            </Link>
          )}
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <Link to="/audit-logs" className="btn btn-secondary">
              View Audit Logs
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/reports" className="btn btn-secondary">
              Generate Reports
            </Link>
          )}
        </div>
      </div>

      {/* Recent Records */}
      <div className="card mt">
        <div className="card-header">Recent Records</div>
        {recentRecords.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Reference Number</th>
                <th>Title</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record._id}>
                  <td><strong>{record.referenceNumber}</strong></td>
                  <td>{record.title}</td>
                  <td>
                    <span className={`badge badge-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.ownerInformation?.ownerName || 'N/A'}</td>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/records/${record._id}`} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No records found. <Link to="/records/create">Create one now</Link></p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
