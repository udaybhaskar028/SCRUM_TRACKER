import React, { useState, useEffect } from 'react';
import { teamApi } from '../services/api';

export default function TeamSetup() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const flash = (type, text) => {
    if (type === 'success') { setMsg(text); setTimeout(() => setMsg(''), 3000); }
    else { setError(text); setTimeout(() => setError(''), 4000); }
  };

  const fetchTeams = () => teamApi.getMyTeams().then(r => { setTeams(r.data); if (r.data.length > 0 && !selectedTeam) setSelectedTeam(r.data[0]); });
  const fetchUnassigned = () => teamApi.getUnassigned().then(r => setUnassigned(r.data));

  useEffect(() => { fetchTeams(); fetchUnassigned(); }, []);

  useEffect(() => {
    if (selectedTeam) teamApi.getMembers(selectedTeam.id).then(r => setMembers(r.data));
  }, [selectedTeam]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      const r = await teamApi.create({ name: newTeamName });
      setNewTeamName('');
      await fetchTeams();
      setSelectedTeam(r.data);
      flash('success', 'Team created!');
    } catch (err) { flash('error', err.response?.data?.message || 'Failed'); }
  };

  const handleAddByEmail = async (e) => {
    e.preventDefault();
    try {
      await teamApi.addMemberByEmail({ email: emailInput, teamId: selectedTeam.id });
      setEmailInput('');
      teamApi.getMembers(selectedTeam.id).then(r => setMembers(r.data));
      fetchUnassigned();
      flash('success', 'Member added!');
    } catch (err) { flash('error', err.response?.data?.message || 'User not found'); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    await teamApi.removeMember(selectedTeam.id, userId);
    teamApi.getMembers(selectedTeam.id).then(r => setMembers(r.data));
    fetchUnassigned();
  };

  const handleAddUnassigned = async (email) => {
    try {
      await teamApi.addMemberByEmail({ email, teamId: selectedTeam.id });
      teamApi.getMembers(selectedTeam.id).then(r => setMembers(r.data));
      fetchUnassigned();
      flash('success', 'Member added!');
    } catch (err) { flash('error', err.response?.data?.message || 'Failed'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    flash('success', 'Invite code copied!');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Team Setup</div>
        <div className="page-subtitle">Create teams, manage members, and share invite codes</div>
      </div>

      {msg && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-green)', fontSize: 13, marginBottom: '1rem' }}>{msg}</div>}
      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-red)', fontSize: 13, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: Team list + create */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="section-title">Create New Team</div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input className="form-input" placeholder="e.g. Backend Squad"
                  value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                + Create Team
              </button>
            </form>
          </div>

          <div className="card">
            <div className="section-title">My Teams</div>
            {teams.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No teams yet</div>
            ) : teams.map(t => (
              <div key={t.id} onClick={() => setSelectedTeam(t)}
                style={{
                  padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)', cursor: 'pointer',
                  background: selectedTeam?.id === t.id ? 'rgba(88,166,255,0.1)' : 'transparent',
                  border: selectedTeam?.id === t.id ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  marginBottom: '0.4rem',
                }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.memberCount} members</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected team details */}
        {selectedTeam ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Invite code */}
            <div className="card" style={{ borderLeft: '3px solid var(--accent-green)' }}>
              <div className="section-title">Invite Code</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700,
                  letterSpacing: '0.2em', color: 'var(--accent-green)',
                  background: 'rgba(63,185,80,0.1)', padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)', flex: 1, textAlign: 'center',
                }}>
                  {selectedTeam.inviteCode}
                </div>
                <button className="btn btn-success" onClick={() => copyCode(selectedTeam.inviteCode)}>
                  📋 Copy
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Share this code with team members. They can enter it in their Profile page or during registration.
              </div>
            </div>

            {/* Add member by email */}
            <div className="card">
              <div className="section-title">Add Member by Email</div>
              <form onSubmit={handleAddByEmail} style={{ display: 'flex', gap: '0.75rem' }}>
                <input className="form-input" type="email" placeholder="member@company.com"
                  value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Add Member
                </button>
              </form>
            </div>

            {/* Current members */}
            <div className="card">
              <div className="section-title">Current Members ({members.filter(m => m.status === 'ACTIVE').length})</div>
              {members.filter(m => m.status === 'ACTIVE').length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No members yet — share the invite code!</div>
              ) : members.filter(m => m.status === 'ACTIVE').map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--gradient-blue)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12,
                    }}>{m.fullName?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{m.fullName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '3px 10px', fontSize: 12 }}
                    onClick={() => handleRemove(m.userId)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Unassigned users */}
            {unassigned.length > 0 && (
              <div className="card">
                <div className="section-title">⚠ Unassigned Users (not in any of your teams)</div>
                {unassigned.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{u.fullName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '3px 10px', fontSize: 12 }}
                      onClick={() => handleAddUnassigned(u.email)}>
                      + Add to {selectedTeam.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">Select or create a team</div>
          </div>
        )}
      </div>
    </div>
  );
}
