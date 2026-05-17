/**
 * Records Reports Page
 * Admin-only reporting view for generating summaries from land records
 */

import React, { useMemo, useState } from 'react';
import { recordsAPI } from '../services/api';
import './RecordReports.css';

function RecordReportsPage({ user }) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    province: '',
    district: '',
    startDate: '',
    endDate: '',
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summaryCards = useMemo(() => {
    if (!report?.summary) {
      return [];
    }

    const { summary } = report;
    const getStatusCount = (status) => summary.statusSummary?.find((item) => item.status === status)?.count || 0;
    const getPriorityCount = (priority) => summary.prioritySummary?.find((item) => item.priority === priority)?.count || 0;

    return [
      { label: 'Total Records', value: summary.totalRecords, tone: 'primary' },
      { label: 'Pending', value: getStatusCount('PENDING'), tone: 'warning' },
      { label: 'Processing', value: getStatusCount('PROCESSING'), tone: 'info' },
      { label: 'Completed', value: getStatusCount('COMPLETED'), tone: 'success' },
      { label: 'Archived', value: getStatusCount('ARCHIVED'), tone: 'muted' },
      { label: 'High Priority', value: getPriorityCount('HIGH'), tone: 'danger' },
    ];
  }, [report]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateReport = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await recordsAPI.getRecordReport({
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        province: filters.province || undefined,
        district: filters.district || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      setReport(response.data.data);
    } catch (reportError) {
      setError(reportError.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!report?.records?.length) {
      return;
    }

    const headers = [
      'Reference Number',
      'Title',
      'Owner',
      'Province',
      'District',
      'Status',
      'Priority',
      'Created Date',
    ];

    const rows = report.records.map((record) => [
      record.referenceNumber || '',
      record.title || '',
      record.ownerInformation?.ownerName || '',
      record.propertyDetails?.location?.province || '',
      record.propertyDetails?.location?.district || '',
      record.status || '',
      record.priority || '',
      record.createdAt ? new Date(record.createdAt).toLocaleString() : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `records-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mt">
        <div className="card report-guard">
          <h1>Access restricted</h1>
          <p>Only administrators can generate records reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt report-page">
      <div className="report-header">
        <div>
          <h1>📑 Records Reports</h1>
          <p className="subtitle">Generate admin reports from land record data using filters and exportable summaries.</p>
        </div>
        <button className="btn btn-secondary" onClick={downloadCsv} disabled={!report?.records?.length}>
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="card-header">Report Filters</div>
        <form className="report-filters" onSubmit={handleGenerateReport}>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Reference number, title, owner, or plot number"
            />
          </div>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                  <option value="">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
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
                  name="province"
                  value={filters.province}
                  onChange={handleFilterChange}
                  placeholder="Province"
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  value={filters.district}
                  onChange={handleFilterChange}
                  placeholder="District"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </div>
            </div>
          </div>
          <div className="report-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger mt">{error}</div>}

      {report && (
        <>
          <div className="report-summary-grid mt">
            {summaryCards.map((card) => (
              <div key={card.label} className={`report-summary-card report-summary-${card.tone}`}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>

          <div className="row mt">
            <div className="col">
              <div className="card">
                <div className="card-header">Status Breakdown</div>
                <div className="report-breakdown-list">
                  {report.summary.statusSummary?.map((item) => (
                    <div key={item.status} className="report-breakdown-row">
                      <span>{item.status}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card">
                <div className="card-header">Location Breakdown</div>
                <div className="report-breakdown-list">
                  {(report.summary.locationSummary?.provinces || []).slice(0, 5).map((item) => (
                    <div key={item.name} className="report-breakdown-row">
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card mt">
            <div className="card-header">Matching Records</div>
            {report.records.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Reference#</th>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Province</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.records.map((record) => (
                      <tr key={record._id}>
                        <td><strong>{record.referenceNumber}</strong></td>
                        <td>{record.title}</td>
                        <td>{record.ownerInformation?.ownerName || 'N/A'}</td>
                        <td>{record.propertyDetails?.location?.province || 'N/A'}</td>
                        <td>{record.propertyDetails?.location?.district || 'N/A'}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center">No records match the selected filters.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RecordReportsPage;