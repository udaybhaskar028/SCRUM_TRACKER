import React, { useState, useEffect, useCallback } from 'react';
import { sprintApi, updateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { isManager } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [standups, setStandups] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    sprintApi.getAll().then(r => {
      setSprints(r.data);
      const active = r.data.find(s => s.status === 'ACTIVE');
      if (active) setSelectedSprint(active);
    });
  }, []);

  const fetchDashboard = useCallback(() => {
    if (!selectedSprint) return;
    setLoading(true);
    Promise.all([
      updateApi.getDashboard(selectedSprint.id, date),
      updateApi.getSprintSummary(selectedSprint.id),
    ]).then(([standupRes, summaryRes]) => {
      setStandups(standupRes.data);
      setSummary(summaryRes.data);
    }).finally(() => setLoading(false));
  }, [selectedSprint, date]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleExport = async () => {
    const res = await updateApi.exportExcel(selectedSprint.id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint-${selectedSprint.name}-report.xlsx`;
    a.click();
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ todayWork: s.todayWork, tomorrowPlan: s.tomorrowPlan, blockers: s.blockers, storyPointsLogged: s.storyPointsLogged, hoursWorked: s.hoursWorked });
  };

  const saveEdit = async (id) => {
    await updateApi.managerEdit(id, editForm);
    setEditingId(null);
    fetchDashboard();
  };

  const chartData = summary.map(s => ({
    name: s.username,
    logged: s.totalStoryPointsLogged,
    remaining: s.remainingStoryPoints,
  }));

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">Team Dashboard</div>
          <div className="page-subtitle">Daily standups & sprint resource utilization</div>
        </div>
        {isManager() && selectedSprint && (
          <button className="btn btn-success" onClick={handleExport}>⬇ Export Excel</button>
        )}
      </div>

      {/* Sprint + Date selector */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label className="form-label">Sprint</label>
          <select className="form-select" value={selectedSprint?.id || ''}
            onChange={e => setSelectedSprint(sprints.find(s => s.id === Number(e.target.value)))}>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name} — {s.status}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {selectedSprint && (
        <>
          {/* Sprint info */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Story Points</div>
              <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{selectedSprint.totalStoryPoints}</div>
              <div className="stat-desc">Sprint baseline</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Hours / Story Point</div>
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{selectedSprint.hoursPerStoryPoint}h</div>
              <div className="stat-desc">Manager set</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Team Updates Today</div>
              <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{standups.length}</div>
              <div className="stat-desc">Members submitted</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sprint Period</div>
              <div className="stat-value" style={{ fontSize: 16, marginTop: 8 }}>{selectedSprint.startDate}</div>
              <div className="stat-desc">to {selectedSprint.endDate}</div>
            </div>
          </div>

          {/* Resource utilization */}
          {summary.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Resource Utilization — {selectedSprint.name}</div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <ResponsiveContainer width="50%" height={200} style={{ minWidth: 300 }}>
                  <BarChart data={chartData} barSize={24}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                    <Bar dataKey="logged" name="SP Logged" fill="var(--accent-blue)" radius={[4,4,0,0]} />
                    <Bar dataKey="remaining" name="Remaining" fill="rgba(88,166,255,0.2)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {summary.map(s => (
                    <div key={s.userId}>
                      <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{s.userFullName}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {s.totalStoryPointsLogged.toFixed(1)} / {(s.totalStoryPointsLogged + s.remainingStoryPoints).toFixed(1)} SP
                        </span>
                      </div>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar-fill" style={{
                          width: `${s.utilizationPercent}%`,
                          background: s.utilizationPercent > 90 ? 'var(--accent-red)' : s.utilizationPercent > 60 ? 'var(--accent-orange)' : 'var(--accent-green)',
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {s.utilizationPercent.toFixed(1)}% utilized · {s.totalHoursWorked.toFixed(1)}h logged
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Standups */}
          <div className="card">
            <div className="section-title">Standups for {date}</div>
            {loading ? <div className="spinner" /> : standups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">No updates yet for this date</div>
                <div className="empty-state-subtext">Team members' standups will appear here once submitted</div>
              </div>
            ) : standups.map(s => (
              <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                {editingId === s.id ? (
                  <div>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 700 }}>{s.userFullName}</div>
                      <div className="flex gap-1">
                        <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => saveEdit(s.id)}>Save</button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Today's Work</label>
                        <textarea className="form-textarea" value={editForm.todayWork || ''} onChange={e => setEditForm({ ...editForm, todayWork: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tomorrow's Plan</label>
                        <textarea className="form-textarea" value={editForm.tomorrowPlan || ''} onChange={e => setEditForm({ ...editForm, tomorrowPlan: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Story Points</label>
                        <input className="form-input" type="number" step="0.5" value={editForm.storyPointsLogged || 0} onChange={e => setEditForm({ ...editForm, storyPointsLogged: parseFloat(e.target.value) })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hours Worked</label>
                        <input className="form-input" type="number" step="0.5" value={editForm.hoursWorked || 0} onChange={e => setEditForm({ ...editForm, hoursWorked: parseFloat(e.target.value) })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blockers</label>
                      <textarea className="form-textarea" value={editForm.blockers || ''} onChange={e => setEditForm({ ...editForm, blockers: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                      <div className="flex items-center gap-1">
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                          {s.userFullName?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.userFullName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>@{s.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="badge badge-blue">{s.storyPointsLogged} SP</span>
                        <span className="badge badge-green">{s.hoursWorked}h</span>
                        {isManager() && (
                          <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => startEdit(s)}>Edit</button>
                        )}
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>✅ Today</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.todayWork || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>📅 Tomorrow</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.tomorrowPlan || '—'}</div>
                      </div>
                    </div>
                    {s.blockers && (
                      <div className="blockers-tag">⛔ {s.blockers}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
