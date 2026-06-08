import React, { useState, useEffect } from 'react';
import { teamApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Teams() {
  const { isManager } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetch = isManager()
      ? teamApi.getMyTeams()
      : teamApi.getMemberships();

    fetch.then(r => {
      setTeams(r.data);
      if (r.data.length > 0) setSelectedTeam(r.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      teamApi.getMembers(selectedTeam.id).then(r =>
        setMembers(r.data.filter(m => m.status === 'ACTIVE'))
      );
    }
  }, [selectedTeam]);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Teams</div>
        <div className="page-subtitle">
          {isManager() ? 'Teams you manage' : 'Teams you are a member of'}
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">You are not in any team yet</div>
          <div className="empty-state-subtext">
            {isManager()
              ? 'Go to Team Setup to create your first team'
              : 'Ask your manager for an invite code and enter it in your Profile page'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>

          {/* Team list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {teams.map(t => (
              <div key={t.id} onClick={() => setSelectedTeam(t)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: selectedTeam?.id === t.id ? 'rgba(88,166,255,0.1)' : 'var(--bg-card)',
                  border: `1px solid ${selectedTeam?.id === t.id ? 'var(--accent-blue)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.memberCount} member{t.memberCount !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Manager: {t.managerName}
                </div>
              </div>
            ))}
          </div>

          {/* Team detail */}
          {selectedTeam && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Header card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedTeam.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                      Managed by {selectedTeam.managerName}
                    </div>
                  </div>
                  {isManager() && (
                    <div style={{
                      background: 'rgba(63,185,80,0.1)',
                      border: '1px solid rgba(63,185,80,0.3)',
                      borderRadius: 'var(--radius)',
                      padding: '0.4rem 0.75rem',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.15em' }}>
                        {selectedTeam.inviteCode}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>INVITE CODE</div>
                    </div>
                  )}
                </div>

                <div className="grid-3" style={{ marginTop: '1.25rem' }}>
                  {[
                    ['Members', selectedTeam.memberCount, 'var(--accent-blue)'],
                    ['Created', new Date(selectedTeam.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 'var(--accent-green)'],
                    ['Status', 'Active', 'var(--accent-orange)'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="stat-card" style={{ padding: '0.75rem' }}>
                      <div className="stat-label">{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members list */}
              <div className="card">
                <div className="section-title">Team Members</div>
                {members.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-text">No active members yet</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {members.map(m => (
                      <div key={m.id} style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--gradient-blue)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {m.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.fullName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            @{m.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
