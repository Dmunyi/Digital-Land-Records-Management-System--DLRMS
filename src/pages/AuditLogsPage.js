/**
 * Audit Logs Page
 * View system audit trail and user actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { auditAPI, authAPI } from '../services/api';
import './AuditLogs.css';
import AuditChart from '../components/AuditChart';

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [action, setAction] = useState('');
  const [compareAction, setCompareAction] = useState('');
  const [limit] = useState(25);
  const [days, setDays] = useState(30);
  const [chartType, setChartType] = useState('bar');
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const selectedActions = [action, compareAction].filter(Boolean);
      const singleAction = selectedActions[0];
      const isCompareMode = selectedActions.length > 1;

      const response = await auditAPI.getAuditLogs({
        page,
        limit,
        action: !isCompareMode ? singleAction || undefined : undefined,
        actions: isCompareMode ? selectedActions.join(',') : undefined,
      });
      setLogs(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, action, compareAction]);

  useEffect(() => {
    if (action && compareAction && action === compareAction) {
      setCompareAction('');
    }
  }, [action, compareAction]);

  // Fetch current user to check admin role
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
    fetchCurrentUser();
  }, [fetchAuditLogs, fetchCurrentUser]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return '#27ae60';
      case 'UPDATE':
        return '#f39c12';
      case 'DELETE':
        return '#e74c3c';
      case 'VIEW':
        return '#3498db';
      case 'LOGIN':
        return '#9b59b6';
      case 'LOGOUT':
        return '#95a5a6';
      case 'UPLOAD':
        return '#16a085';
      default:
        return '#34495e';
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    setDeleteConfirm(null);
    setDeleting(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.deleteUser(userId);
      setMessage({ 
        type: 'success', 
        text: `User ${userName} has been successfully deleted.` 
      });
      // Refresh the audit logs
      setTimeout(() => {
        fetchAuditLogs();
      }, 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mt">
      <h1>📊 Audit Logs</h1>
      <p className="subtitle">System activity and user action tracking</p>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })} 
            style={{ float: 'right', cursor: 'pointer', border: 'none', background: 'none', fontSize: '20px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})?</p>
            <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '12px' }}>
              ⚠️ This action cannot be undone. All user data will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteUser(deleteConfirm.id, deleteConfirm.name)}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Activity Filters</h3>
        <div className="filter-group">
          <label htmlFor="action-filter">Filter by Action:</label>
          <select
            id="action-filter"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="UPLOAD">Upload</option>
            <option value="DOWNLOAD">Download</option>
          </select>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <div className="filter-group mt-12">
            <label htmlFor="compare-action-filter">Compare With:</label>
            <select
              id="compare-action-filter"
              value={compareAction}
              onChange={(e) => {
                setCompareAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">None</option>
              <option value="LOGIN" disabled={action === 'LOGIN'}>Login</option>
              <option value="LOGOUT" disabled={action === 'LOGOUT'}>Logout</option>
              <option value="CREATE" disabled={action === 'CREATE'}>Create</option>
              <option value="UPDATE" disabled={action === 'UPDATE'}>Update</option>
              <option value="DELETE" disabled={action === 'DELETE'}>Delete</option>
              <option value="VIEW" disabled={action === 'VIEW'}>View</option>
              <option value="UPLOAD" disabled={action === 'UPLOAD'}>Upload</option>
              <option value="DOWNLOAD" disabled={action === 'DOWNLOAD'}>Download</option>
            </select>
          </div>
        )}
      </div>

      {/* Chart Controls */}
      <div className="card mt">
        <div className="filter-group">
          <label htmlFor="chart-days">Graph period (days):</label>
          <select id="chart-days" value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
            <option value={7}>7</option>
            <option value={14}>14</option>
            <option value={30}>30</option>
            <option value={90}>90</option>
          </select>

          <label htmlFor="chart-type">Chart type:</label>
          <select id="chart-type" value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <AuditChart
            days={days}
            action={action}
            compareAction={currentUser?.role === 'ADMIN' ? compareAction : ''}
            chartType={chartType}
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card mt">
        {loading ? (
          <div className="loading">Loading audit logs...</div>
        ) : logs.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  {currentUser?.role === 'ADMIN' && <th>Admin Actions</th>}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <strong>{log.userId?.fullName || 'Unknown'}</strong>
                      <br />
                      <small style={{ color: '#7f8c8d' }}>{log.userId?.email}</small>
                    </td>
                    <td>{log.userId?.role}</td>
                    <td>
                      <span
                        className="action-badge"
                        style={{ backgroundColor: getActionColor(log.action) }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entityType}</td>
                    <td>{log.description || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td style={{ textAlign: 'center' }}>
                        {log.userId && log.userId._id ? (
                          <button
                            className="btn btn-danger"
                            onClick={() => setDeleteConfirm({
                              id: log.userId._id,
                              name: log.userId.fullName,
                              email: log.userId.email
                            })}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Delete User
                          </button>
                        ) : (
                          <span style={{ color: '#95a5a6' }}>-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-secondary">
                  ← Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn btn-secondary">
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center">No audit logs found.</p>
        )}
      </div>
    </div>
  );
}

export default AuditLogsPage;
