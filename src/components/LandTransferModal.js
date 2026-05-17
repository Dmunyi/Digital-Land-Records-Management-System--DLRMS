/**
 * LandTransferModal Component
 * Allows land owners to transfer their land to persons of interest
 * 
 * Usage:
 * <LandTransferModal
 *   isOpen={showTransferModal}
 *   recordId={selectedRecord._id}
 *   currentOwner={selectedRecord.ownerInformation.ownerName}
 *   onClose={() => setShowTransferModal(false)}
 *   onSuccess={(transferResult) => handleTransferSuccess(transferResult)}
 * />
 */

import React, { useState, useEffect } from 'react';
import './LandTransferModal.css';
import { api } from '../../services/api';

const LandTransferModal = ({ isOpen, recordId, currentOwner, onClose, onSuccess }) => {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch eligible recipients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
      fetchTransferHistory();
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const fetchRecipients = async () => {
    try {
      // Get list of all verified users (potential recipients)
      const response = await api.get('/users/active'); // Adjust endpoint as per your API
      setRecipients(response.data.users || []);
    } catch (err) {
      setError('Failed to load recipients. Please try again.');
      console.error('Error fetching recipients:', err);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      // Get transfer history for this record
      const response = await api.get(`/records/${recordId}`);
      if (response.data.record && response.data.record.transferHistory) {
        setTransferHistory(response.data.record.transferHistory);
      }
    } catch (err) {
      console.error('Error fetching transfer history:', err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedRecipient) {
      setError('Please select a recipient');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the transfer');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(
        `/records/${recordId}/transfer-to-interest`,
        {
          newOwnerId: selectedRecipient,
          reason: reason.trim(),
        }
      );

      if (response.data.success) {
        setSuccess('Land transferred successfully!');
        
        // Reset form
        setSelectedRecipient('');
        setReason('');
        
        // Call parent callback
        if (onSuccess) {
          onSuccess(response.data.transfer);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Transfer failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Error transferring land. Please try again.'
      );
      console.error('Transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRecipientName = (userId) => {
    const recipient = recipients.find(r => r._id === userId);
    return recipient ? recipient.fullName : 'Unknown User';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="transfer-modal">
        <div className="modal-header">
          <h2>Transfer Land Ownership</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Current Owner Info */}
          <div className="info-section">
            <p><strong>Current Owner:</strong> {currentOwner}</p>
            <p className="info-text">
              You are about to transfer ownership of this land to another registered user.
            </p>
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Success Message */}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Transfer Form */}
          <form onSubmit={handleTransfer} className="transfer-form">
            <div className="form-group">
              <label htmlFor="recipient">
                Select New Owner <span className="required">*</span>
              </label>
              <select
                id="recipient"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                disabled={loading}
                className="form-input"
              >
                <option value="">-- Select a recipient --</option>
                {recipients.map((recipient) => (
                  <option key={recipient._id} value={recipient._id}>
                    {recipient.fullName} ({recipient.email})
                  </option>
                ))}
              </select>
              <small>Recipients must be registered and verified users</small>
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                Reason for Transfer <span className="required">*</span>
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="form-input"
              >
                <option value="">-- Select reason --</option>
                <option value="Transfer to family member">Transfer to family member</option>
                <option value="Gift to friend">Gift to friend</option>
                <option value="Inheritance">Inheritance</option>
                <option value="Sale">Sale</option>
                <option value="Trust arrangement">Trust arrangement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedRecipient}
                className="btn btn-primary"
              >
                {loading ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </form>

          {/* Transfer History */}
          <div className="history-section">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="btn-history-toggle"
            >
              {showHistory ? '▼' : '▶'} Transfer History ({transferHistory.length})
            </button>

            {showHistory && transferHistory.length > 0 && (
              <div className="transfer-history">
                {transferHistory.map((transfer, index) => (
                  <div key={index} className="history-item">
                    <div className="history-from">
                      <strong>From:</strong> {transfer.fromOwnerInfo.name}
                    </div>
                    <div className="history-to">
                      <strong>To:</strong> {transfer.toOwnerInfo.name}
                    </div>
                    <div className="history-date">
                      {formatDate(transfer.transferredAt)}
                    </div>
                    {transfer.reason && (
                      <div className="history-reason">
                        <strong>Reason:</strong> {transfer.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showHistory && transferHistory.length === 0 && (
              <p className="no-history">No transfer history for this land record</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandTransferModal;
