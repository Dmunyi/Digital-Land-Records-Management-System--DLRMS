/**
 * Records List Page
 * Display all land records with search and filter
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recordsAPI } from '../services/api';
import './RecordsList.css';

function RecordsListPage({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [limit] = useState(20);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await recordsAPI.getAllRecords({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      });
      setRecords(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDeleteRecord = async (recordId) => {
    const confirmed = window.confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(recordId);
    try {
      await recordsAPI.deleteRecord(recordId);
      await fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      window.alert(error.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeletingId('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  return (
    <div className="container mt">
      <div className="records-header">
        <h1>📋 Land Records</h1>
        {(user?.role === 'OFFICER' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
          <Link to="/records/create" className="btn btn-success">
            + New Record
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by reference number, title, or owner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" className="btn btn-primary">
            🔍 Search
          </button>
        </form>
      </div>

      {/* Records Table */}
      <div className="card mt">
        {loading ? (
          <div className="loading">Loading records...</div>
        ) : records.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Reference#</th>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td><strong>{record.referenceNumber}</strong></td>
                    <td>{record.title}</td>
                    <td>{record.ownerInformation?.ownerName || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${record.priority.toLowerCase()}`}>
                        {record.priority}
                      </span>
                    </td>
                    <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/records/${record._id}`} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                        View
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link
                            to={`/records/${record._id}/edit`}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', marginLeft: '5px' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteRecord(record._id)}
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px', marginLeft: '5px' }}
                            disabled={deletingId === record._id}
                          >
                            {deletingId === record._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </td>
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
          <p className="text-center">No records found. {user?.role !== 'VIEWER' && <Link to="/records/create">Create a new one</Link>}</p>
        )}
      </div>
    </div>
  );
}

export default RecordsListPage;
