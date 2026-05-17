/**
 * Create/Edit Record Page
 * Form to create and edit land records
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recordsAPI } from '../services/api';
import './CreateRecord.css';

function CreateRecordPage({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    referenceNumber: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    ownerInformation: {
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      idNumber: '',
      idType: 'NATIONAL_ID',
    },
    propertyDetails: {
      plotNumber: '',
      areaSize: '',
      areaUnit: 'sq.m',
      location: {
        province: '',
        district: '',
        ward: '',
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  const fetchRecordForEdit = useCallback(async () => {
    if (!isEditMode) return;

    setPageLoading(true);
    setError('');

    try {
      const response = await recordsAPI.getRecordById(id);
      const record = response.data.record;
      setFormData({
        referenceNumber: record.referenceNumber || '',
        title: record.title || '',
        description: record.description || '',
        priority: record.priority || 'MEDIUM',
        ownerInformation: {
          ownerName: record.ownerInformation?.ownerName || '',
          ownerEmail: record.ownerInformation?.ownerEmail || '',
          ownerPhone: record.ownerInformation?.ownerPhone || '',
          idNumber: record.ownerInformation?.idNumber || '',
          idType: record.ownerInformation?.idType || 'NATIONAL_ID',
        },
        propertyDetails: {
          plotNumber: record.propertyDetails?.plotNumber || '',
          areaSize: record.propertyDetails?.areaSize || '',
          areaUnit: record.propertyDetails?.areaUnit || 'sq.m',
          location: {
            province: record.propertyDetails?.location?.province || '',
            district: record.propertyDetails?.location?.district || '',
            ward: record.propertyDetails?.location?.ward || '',
          },
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load record for editing.');
    } finally {
      setPageLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchRecordForEdit();
  }, [fetchRecordForEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    if (keys.length > 1) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: keys.length > 2 ? { ...prev[keys[0]][keys[1]], [keys[2]]: value } : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await recordsAPI.updateRecord(id, formData);
      } else {
        await recordsAPI.createRecord(formData);
      }
      navigate(isEditMode ? `/records/${id}` : '/records');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEditMode ? 'update' : 'create'} record. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && pageLoading) {
    return <div className="loading">Loading record for editing...</div>;
  }

  if (isEditMode && user?.role !== 'ADMIN') {
    return (
      <div className="container mt">
        <div className="alert alert-danger">Only admins can edit records.</div>
      </div>
    );
  }

  return (
    <div className="container mt">
      <h1>{isEditMode ? 'Edit Land Record' : 'Create New Land Record'}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="record-form">
        {/* Record Identification Section */}
        <div className="form-section">
          <h2>Record Information</h2>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Reference Number *</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="e.g., LR-2024-001"
                  required
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Land Plot 123 - Urban Area"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about the record..."
            />
          </div>
        </div>

        {/* Owner Information Section */}
        <div className="form-section">
          <h2>Owner Information</h2>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="ownerInformation.ownerName"
                  value={formData.ownerInformation.ownerName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="ownerInformation.ownerEmail"
                  value={formData.ownerInformation.ownerEmail}
                  onChange={handleChange}
                  placeholder="owner@example.com"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="ownerInformation.ownerPhone"
                  value={formData.ownerInformation.ownerPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>ID Type</label>
                <select name="ownerInformation.idType" value={formData.ownerInformation.idType} onChange={handleChange}>
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>ID Number</label>
            <input
              type="text"
              name="ownerInformation.idNumber"
              value={formData.ownerInformation.idNumber}
              onChange={handleChange}
              placeholder="Identification number"
            />
          </div>
        </div>

        {/* Property Details Section */}
        <div className="form-section">
          <h2>Property Details</h2>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Plot Number</label>
                <input
                  type="text"
                  name="propertyDetails.plotNumber"
                  value={formData.propertyDetails.plotNumber}
                  onChange={handleChange}
                  placeholder="e.g., PLOT-123"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>Area Size</label>
                <input
                  type="number"
                  name="propertyDetails.areaSize"
                  value={formData.propertyDetails.areaSize}
                  onChange={handleChange}
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>Area Unit</label>
                <select name="propertyDetails.areaUnit" value={formData.propertyDetails.areaUnit} onChange={handleChange}>
                  <option value="sq.m">Square Meters (sq.m)</option>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Province</label>
                <input
                  type="text"
                  name="propertyDetails.location.province"
                  value={formData.propertyDetails.location.province}
                  onChange={handleChange}
                  placeholder="Province/State"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  name="propertyDetails.location.district"
                  value={formData.propertyDetails.location.district}
                  onChange={handleChange}
                  placeholder="District/County"
                />
              </div>
            </div>

            <div className="col">
              <div className="form-group">
                <label>Ward</label>
                <input
                  type="text"
                  name="propertyDetails.location.ward"
                  value={formData.propertyDetails.location.ward}
                  onChange={handleChange}
                  placeholder="Ward"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Record')}
          </button>
          <button type="button" onClick={() => navigate(isEditMode ? `/records/${id}` : '/records')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRecordPage;
