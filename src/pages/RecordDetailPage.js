/**
 * Record Detail Page
 * View and manage a specific land record
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recordsAPI, filesAPI } from '../services/api';
import './RecordDetail.css';

function RecordDetailPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  

  const fetchRecord = useCallback(async () => {
    try {
      const response = await recordsAPI.getRecordById(id);
      setRecord(response.data.record);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch record data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    setError('');

    try {
      await recordsAPI.updateRecord(id, { status: newStatus });
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    setError('');

    try {
      await filesAPI.uploadDocument(id, file);
      await fetchRecord();
      e.target.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await filesAPI.deleteDocument(id, docId);
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      const response = await filesAPI.downloadDocument(id, docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download document');
    }
  };

  const handleDeleteRecord = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingRecord(true);
    setError('');

    try {
      await recordsAPI.deleteRecord(id);
      navigate('/records');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeletingRecord(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading record details...</div>;
  }

  if (!record) {
    return (
      <div className="container mt">
        <div className="alert alert-danger">Record not found</div>
      </div>
    );
  }

  return (
    <div className="container mt">
      <div className="record-header">
        <button onClick={() => navigate('/records')} className="btn btn-secondary">
          ← Back to Records
        </button>
        <h1>{record.referenceNumber}</h1>
        <span className={`badge badge-${record.status.toLowerCase()}`}>{record.status}</span>
        {user?.role === 'ADMIN' && (
          <div className="record-admin-actions">
            <button onClick={() => navigate(`/records/${id}/edit`)} className="btn btn-primary">
              Edit Record
            </button>
            <button onClick={handleDeleteRecord} className="btn btn-danger" disabled={deletingRecord}>
              {deletingRecord ? 'Deleting...' : 'Delete Record'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="record-grid">
        {/* Left Column */}
        <div className="record-main">
          {/* Record Information */}
          <div className="card">
            <div className="card-header">Record Information</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Title</label>
                <p>{record.title}</p>
              </div>
              <div className="info-item">
                <label>Description</label>
                <p>{record.description || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Priority</label>
                <span className={`badge badge-${record.priority.toLowerCase()}`}>{record.priority}</span>
              </div>
              <div className="info-item">
                <label>Created Date</label>
                <p>{new Date(record.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="card mt">
            <div className="card-header">Owner Information</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Owner Name</label>
                <p>{record.ownerInformation?.ownerName || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{record.ownerInformation?.ownerEmail || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{record.ownerInformation?.ownerPhone || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>ID Number</label>
                <p>{record.ownerInformation?.idNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="card mt">
            <div className="card-header">Property Details</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Plot Number</label>
                <p>{record.propertyDetails?.plotNumber || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Area Size</label>
                <p>{record.propertyDetails?.areaSize ? `${record.propertyDetails.areaSize} ${record.propertyDetails.areaUnit}` : 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Location</label>
                <p>
                  {record.propertyDetails?.location?.province && `${record.propertyDetails.location.province}, `}
                  {record.propertyDetails?.location?.district && `${record.propertyDetails.location.district}, `}
                  {record.propertyDetails?.location?.ward || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card mt">
            <div className="card-header">Documents</div>

            {(user?.role === 'OFFICER' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
              <div className="upload-section">
                <input type="file" id="file-upload" onChange={handleFileUpload} disabled={uploadingFile} />
                <label htmlFor="file-upload" className="btn btn-primary">
                  {uploadingFile ? 'Uploading...' : '📎 Upload Document'}
                </label>
              </div>
            )}

            {record.documents && record.documents.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {record.documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>{doc.fileName}</td>
                      <td>{doc.fileType?.toUpperCase()}</td>
                      <td>{((doc.fileSize || 0) / 1024).toFixed(2)} KB</td>
                      <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDownloadDocument(doc._id, doc.fileName)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          ⬇ Download
                        </button>
                        {(user?.role === 'OFFICER' || user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                          <button onClick={() => handleDeleteDocument(doc._id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px', marginLeft: '5px' }}>
                            🗑 Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="record-sidebar">
          {/* Status Actions */}
          <div className="card">
            <div className="card-header">Status Management</div>
            <div className="status-buttons">
              <button
                onClick={() => handleUpdateStatus('PENDING')}
                className="btn btn-secondary"
                disabled={updating || record.status === 'PENDING'}
              >
                ⏳ Pending
              </button>
              <button
                onClick={() => handleUpdateStatus('PROCESSING')}
                className="btn btn-secondary"
                disabled={updating || record.status === 'PROCESSING'}
              >
                ⚙️ Processing
              </button>
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                className="btn btn-success"
                disabled={updating || record.status === 'COMPLETED'}
              >
                ✅ Completed
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="card mt">
            <div className="card-header">Quick Info</div>
            <div className="quick-info">
              <div className="info-line">
                <span>Created by:</span>
                <strong>{record.createdBy?.fullName || 'System'}</strong>
              </div>
              <div className="info-line">
                <span>Assigned to:</span>
                <strong>{record.assignedTo?.fullName || 'Unassigned'}</strong>
              </div>
              <div className="info-line">
                <span>Physical Location:</span>
                <strong>{record.currentPhysicalLocation}</strong>
              </div>
              <div className="info-line">
                <span>Documents:</span>
                <strong>{record.documents?.length || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordDetailPage;
