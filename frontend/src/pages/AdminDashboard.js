import React, { useState, useEffect } from 'react';
import { teamApi, sprintApi, updateApi } from '../services/api';

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [standups, setStandups] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    Promise.all([
      teamApi.getAllTeams(),
      sprintApi.getAll(),
    ]).then(([teamsRes, sprintsRes]) => {
      setTeams(teamsRes.data);
      setSprints(sprintsRes.data);
      if (teamsRes.data.length > 0) setSelectedTeam(teamsRes.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      const teamSprints = sprints.filter(s => s.teamId === selectedTeam.id);
      if (teamSprints.length > 0) setSelectedSprint(teamSprints[0]);
      else setSelectedSprint(null);
    }
  }, [selectedTeam, sprints]);

  useEffect(() => {
    if (!selectedSprint) return;
    Promise.all([
      updateApi.getDashboard(selectedSprint.id, date),
      updateApi.getSprintSummary(selectedSprint.id),
    ]).then(([standupsRes, summaryRes]) => {
      setStandups(standupsRes.data);
      setSummary(summaryRes.data);
    });
  }, [selectedSprint, date]);

  if (loading) return <div className="spinner" />;

  const teamSprints = selectedTeam
    ? sprints.filter(s => s.teamId === selectedTeam.id)
    : [];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: 24 }}>🛡</span>
          <div>
            <div className="page-title">Super Admin Overview</div>
            <div className="page-subtitle">Global view across all teams, sprints and standups</div>
          </div>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          ['Total Teams', teams.length, 'var(--accent-blue)', '👥'],
          ['Total Sprints', sprints.length, 'var(--accent-green)', '⚡'],
          ['Active Sprints', sprints.filter(s => s.status === 'ACTIVE').length, 'var(--accent-orange)', '🔥'],
          ['Total Members', teams.reduce((a, t) => a + t.memberCount, 0), 'var(--accent-purple)', '👤'],
        ].map(([label, value, color, icon]) => (
          <div key={label} className="stat-card">
            <div style={{ fontSize: 24, marginBottom: '0.4rem' }}>{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: 28, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* All Teams overview */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">All Teams</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {teams.map(t => (
            <div key={t.id}
              onClick={() => setSelectedTeam(t)}
              style={{
                background: selectedTeam?.id === t.id ? 'rgba(88,166,255,0.1)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedTeam?.id === t.id ? 'var(--accent-blue)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Manager: {t.managerName}</div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{t.memberCount} members</span>
                <span className="badge badge-green">{sprints.filter(s => s.teamId === t.id && s.status === 'ACTIVE').length} active sprint{sprints.filter(s => s.teamId === t.id && s.status === 'ACTIVE').length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected team drill-down */}
      {selectedTeam && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              {selectedTeam.name} — Sprint Standups
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="form-select" style={{ width: 'auto' }}
                value={selectedSprint?.id || ''}
                onChange={e => setSelectedSprint(teamSprints.find(s => s.id === Number(e.target.value)))}>
                {teamSprints.length === 0
                  ? <option>No sprints for this team</option>
                  : teamSprints.map(s => <option key={s.id} value={s.id}>{s.name} — {s.status}</option>)
                }
              </select>
              <input className="form-input" type="date" value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: 'auto' }} />
            </div>
          </div>

          {selectedSprint ? (
            <>
              {/* Resource utilization */}
              {summary.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Resource Utilization
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {summary.map(s => (
                      <div key={s.userId}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{s.userFullName}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {s.totalStoryPointsLogged.toFixed(1)} SP · {s.totalHoursWorked.toFixed(1)}h
                          </span>
                        </div>
                        <div className="progress-bar-wrapper">
                          <div className="progress-bar-fill" style={{
                            width: `${s.utilizationPercent}%`,
                            background: s.utilizationPercent > 90 ? 'var(--accent-red)' : s.utilizationPercent > 60 ? 'var(--accent-orange)' : 'var(--accent-green)',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {s.utilizationPercent.toFixed(1)}% · {s.remainingStoryPoints.toFixed(1)} SP remaining
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr className="divider" />

              {/* Standups */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Standups for {date}
              </div>
              {standups.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-text">No standups submitted for this date</div>
                </div>
              ) : standups.map(s => (
                <div key={s.id} style={{
                  background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
                  padding: '0.75rem', marginBottom: '0.75rem',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12,
                      }}>{s.userFullName?.[0]}</div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.userFullName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className="badge badge-blue">{s.storyPointsLogged} SP</span>
                      <span className="badge badge-green">{s.hoursWorked}h</span>
                    </div>
                  </div>
                  <div className="grid-2" style={{ gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Today</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.todayWork || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Tomorrow</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.tomorrowPlan || '—'}</div>
                    </div>
                  </div>
                  {s.blockers && <div className="blockers-tag" style={{ marginTop: '0.5rem', fontSize: 12 }}>⛔ {s.blockers}</div>}
                </div>
              ))}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">No sprints found for this team</div>
            </div>
          )}
        </div>
      )}

      {/* All sprints table */}
      <div className="card">
        <div className="section-title">All Sprints Across All Teams</div>
        {sprints.length === 0 ? (
          <div className="empty-state"><div className="empty-state-text">No sprints yet</div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Sprint', 'Team', 'Manager', 'Dates', 'SP', 'Capacity', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sprints.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>{s.teamName}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>{s.createdByName}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: 12 }}>{s.startDate} → {s.endDate}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}><span className="badge badge-blue">{s.totalStoryPoints} SP</span></td>
                    <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.totalCapacityHours}h</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-green' : s.status === 'UPCOMING' ? 'badge-blue' : 'badge-orange'}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
