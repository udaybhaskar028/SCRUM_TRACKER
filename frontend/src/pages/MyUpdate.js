import React, { useState, useEffect } from 'react';
import { sprintApi, updateApi } from '../services/api';
import { format } from 'date-fns';

export default function MyUpdate() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [form, setForm] = useState({ sprintId: '', todayWork: '', tomorrowPlan: '', blockers: '', storyPointsLogged: 0, hoursWorked: 0, privateNotes: '' });
  const [todayUpdate, setTodayUpdate] = useState(null);
  const [myUpdates, setMyUpdates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    sprintApi.getActive().then(r => {
      setSprints(r.data);
      if (r.data.length > 0) setSelectedSprint(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedSprint) return;
    setForm(f => ({ ...f, sprintId: selectedSprint.id }));
    updateApi.getMyToday(selectedSprint.id).then(r => {
      if (r.status === 200 && r.data) {
        setTodayUpdate(r.data);
        setForm({ sprintId: selectedSprint.id, todayWork: r.data.todayWork || '', tomorrowPlan: r.data.tomorrowPlan || '', blockers: r.data.blockers || '', storyPointsLogged: r.data.storyPointsLogged || 0, hoursWorked: r.data.hoursWorked || 0, privateNotes: r.data.privateNotes || '' });
      }
    }).catch(() => {});
    updateApi.getMyUpdates(selectedSprint.id).then(r => setMyUpdates(r.data));
    updateApi.getSprintSummary(selectedSprint.id).then(r => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const mine = r.data.find(s => s.userId === storedUser?.userId);
      setSummary(mine);
    }).catch(() => {});
  }, [selectedSprint]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApi.save(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      updateApi.getMyUpdates(selectedSprint.id).then(r => setMyUpdates(r.data));
    } finally {
      setSaving(false);
    }
  };

  const remaining = summary ? summary.remainingStoryPoints : selectedSprint?.totalStoryPoints;
  const utilization = summary ? summary.utilizationPercent : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Daily Standup</div>
        <div className="page-subtitle">{format(new Date(), 'EEEE, MMMM d yyyy')}</div>
      </div>

      {/* Sprint selector */}
      <div className="form-group" style={{ maxWidth: 300, marginBottom: '1.5rem' }}>
        <label className="form-label">Active Sprint</label>
        <select className="form-select" value={selectedSprint?.id || ''}
          onChange={e => setSelectedSprint(sprints.find(s => s.id === Number(e.target.value)))}>
          {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {selectedSprint && (
        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Left: Update Form */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Today's Update</div>

              {saved && (
                <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-green)', fontSize: 13, marginBottom: '1rem' }}>
                  ✓ Standup saved successfully!
                </div>
              )}

              <div className="form-group">
                <label className="form-label">✅ What did you work on today?</label>
                <textarea className="form-textarea" style={{ minHeight: 90 }} placeholder="Completed the login API, reviewed PR #45, fixed the date bug..."
                  value={form.todayWork} onChange={e => setForm({ ...form, todayWork: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">📅 What's planned for tomorrow?</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Start on dashboard component, write unit tests for auth service..."
                  value={form.tomorrowPlan} onChange={e => setForm({ ...form, tomorrowPlan: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">⛔ Any blockers?</label>
                <textarea className="form-textarea" style={{ minHeight: 60 }} placeholder="Waiting on design mockups from UI team..."
                  value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Story Points Logged</label>
                  <input className="form-input" type="number" step="0.5" min="0"
                    value={form.storyPointsLogged} onChange={e => setForm({ ...form, storyPointsLogged: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours Worked</label>
                  <input className="form-input" type="number" step="0.5" min="0"
                    value={form.hoursWorked} onChange={e => setForm({ ...form, hoursWorked: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <hr className="divider" />
              {/* Private notes section */}
              <div style={{ background: 'rgba(210,153,34,0.05)', border: '1px solid rgba(210,153,34,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-yellow)', marginBottom: '0.5rem' }}>
                  🔒 Private Notes (Only you can see this)
                </div>
                <textarea className="form-textarea" style={{ background: 'transparent', border: 'none', minHeight: 80, padding: '0.25rem 0' }}
                  placeholder="Personal reminders, context, thoughts you don't want to share..."
                  value={form.privateNotes} onChange={e => setForm({ ...form, privateNotes: e.target.value })} />
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : todayUpdate ? '↻ Update Standup' : '+ Submit Standup'}
              </button>
            </div>

            {/* Effort tracker */}
            {summary && (
              <div className="card">
                <div className="section-title">My Sprint Effort</div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>Story Points</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {summary.totalStoryPointsLogged.toFixed(1)} / {selectedSprint.totalStoryPoints} SP
                    </span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{
                      width: `${utilization}%`,
                      background: utilization > 90 ? 'var(--accent-red)' : utilization > 60 ? 'var(--accent-orange)' : 'var(--accent-green)',
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {remaining?.toFixed(1)} SP remaining · {utilization.toFixed(1)}% utilized
                  </div>
                </div>
                <div className="grid-2">
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div className="stat-label">Total Hours</div>
                    <div className="stat-value" style={{ fontSize: 22, color: 'var(--accent-blue)' }}>{summary.totalHoursWorked.toFixed(1)}h</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.75rem' }}>
                    <div className="stat-label">Updates</div>
                    <div className="stat-value" style={{ fontSize: 22, color: 'var(--accent-green)' }}>{summary.updatesCount}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="card">
            <div className="section-title">My Sprint History</div>
            {myUpdates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No updates yet this sprint</div>
              </div>
            ) : myUpdates.map(u => (
              <div key={u.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-blue)' }}>{u.updateDate}</span>
                  <div className="flex gap-1">
                    <span className="badge badge-blue">{u.storyPointsLogged} SP</span>
                    <span className="badge badge-green">{u.hoursWorked}h</span>
                  </div>
                </div>
                {u.todayWork && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{u.todayWork}</div>}
                {u.blockers && <div className="blockers-tag" style={{ fontSize: 12, padding: '3px 8px' }}>⛔ {u.blockers}</div>}
                {u.privateNotes && (
                  <div className="private-note-tag" style={{ fontSize: 12, padding: '3px 8px', marginTop: 4 }}>🔒 {u.privateNotes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
