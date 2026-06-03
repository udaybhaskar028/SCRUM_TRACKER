import React, { useState, useEffect } from 'react';
import { sprintApi } from '../services/api';

export default function SprintSetup() {
  const [sprints, setSprints] = useState([]);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', totalStoryPoints: '', hoursPerStoryPoint: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchSprints = () => sprintApi.getAll().then(r => setSprints(r.data));
  useEffect(() => { fetchSprints(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await sprintApi.create({ ...form, totalStoryPoints: Number(form.totalStoryPoints), hoursPerStoryPoint: Number(form.hoursPerStoryPoint) });
      setSuccess('Sprint created!');
      setForm({ name: '', startDate: '', endDate: '', totalStoryPoints: '', hoursPerStoryPoint: '' });
      fetchSprints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sprint');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    await sprintApi.updateStatus(id, status);
    fetchSprints();
  };

  const statusColor = { ACTIVE: 'var(--accent-green)', COMPLETED: 'var(--text-muted)', UPCOMING: 'var(--accent-blue)' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sprint Setup</div>
        <div className="page-subtitle">Configure sprint cycles and story point baselines</div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Create Sprint */}
        <div className="card">
          <div className="section-title">New Sprint</div>

          {success && (
            <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-green)', fontSize: 13, marginBottom: '1rem' }}>
              ✓ {success}
            </div>
          )}
          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-red)', fontSize: 13, marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Sprint Name</label>
              <input className="form-input" placeholder="e.g. Sprint 12 — Auth Module" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Total Story Points</label>
                <input className="form-input" type="number" min="1" placeholder="e.g. 40" value={form.totalStoryPoints} onChange={e => setForm({ ...form, totalStoryPoints: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Hours / Story Point</label>
                <input className="form-input" type="number" step="0.5" min="0.5" placeholder="e.g. 4" value={form.hoursPerStoryPoint} onChange={e => setForm({ ...form, hoursPerStoryPoint: e.target.value })} required />
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem', fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Capacity preview:</strong>{' '}
              {form.totalStoryPoints && form.hoursPerStoryPoint
                ? `${form.totalStoryPoints} SP × ${form.hoursPerStoryPoint}h = ${(form.totalStoryPoints * form.hoursPerStoryPoint).toFixed(0)} total team hours`
                : 'Fill in story points and hours to see capacity'}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Creating...' : '+ Create Sprint'}
            </button>
          </form>
        </div>

        {/* Sprint list */}
        <div className="card">
          <div className="section-title">All Sprints</div>
          {sprints.length === 0 ? (
            <div className="empty-state"><div className="empty-state-text">No sprints yet</div></div>
          ) : sprints.map(s => (
            <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div className="flex justify-between items-center">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {s.startDate} → {s.endDate} · {s.totalStoryPoints} SP · {s.hoursPerStoryPoint}h/SP
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: statusColor[s.status], fontWeight: 700 }}>{s.status}</span>
                  <select className="form-select" style={{ fontSize: 12, padding: '3px 6px', width: 'auto' }}
                    value={s.status} onChange={e => handleStatusChange(s.id, e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="UPCOMING">Upcoming</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
