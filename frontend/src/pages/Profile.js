import React, { useState, useEffect } from 'react';
import { profileApi, teamApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [joinCode, setJoinCode] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [joinMsg, setJoinMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const flash = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    profileApi.get().then(r => {
      setProfile(r.data);
      setEditForm({ fullName: r.data.fullName, email: r.data.email });
    });
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await profileApi.update(editForm);
      setProfile(r.data);
      flash(setMsg, 'success', 'Profile updated successfully!');
    } catch (err) {
      flash(setMsg, 'error', err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      flash(setPwMsg, 'error', 'New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      flash(setPwMsg, 'error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await profileApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      flash(setPwMsg, 'success', 'Password changed successfully!');
    } catch (err) {
      flash(setPwMsg, 'error', err.response?.data?.message || 'Incorrect current password');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      await teamApi.joinByCode({ inviteCode: joinCode });
      setJoinCode('');
      profileApi.get().then(r => setProfile(r.data));
      flash(setJoinMsg, 'success', 'Joined team successfully!');
    } catch (err) {
      flash(setJoinMsg, 'error', err.response?.data?.message || 'Invalid invite code');
    }
  };

  const alert = (msg) => msg.text ? (
    <div style={{
      background: msg.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
      border: `1px solid ${msg.type === 'success' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
      borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem',
      color: msg.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
      fontSize: 13, marginBottom: '1rem',
    }}>{msg.text}</div>
  ) : null;

  const roleColor = { MANAGER: 'var(--accent-purple)', USER: 'var(--accent-blue)', SUPERADMIN: 'var(--accent-orange)' };

  if (!profile) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Profile</div>
        <div className="page-subtitle">Manage your account settings and team memberships</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Profile card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--gradient-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 22, flexShrink: 0,
              }}>
                {profile.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.fullName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{profile.username}</div>
                <span className="badge" style={{
                  marginTop: 4, fontSize: 11,
                  background: `${roleColor[profile.role]}20`,
                  color: roleColor[profile.role],
                }}>{profile.role}</span>
              </div>
            </div>

            <div className="section-title">Edit Profile</div>
            {alert(msg)}
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.fullName}
                  onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={profile.username} disabled
                  style={{ opacity: 0.5 }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Team memberships */}
          <div className="card">
            <div className="section-title">My Teams</div>
            {profile.teamNames?.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                You are not part of any team yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {profile.teamNames?.map((name, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
                    padding: '0.5rem 0.75rem', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span>👥</span> {name}
                  </div>
                ))}
              </div>
            )}

            {/* Join team by code */}
            {user?.role === 'USER' && (
              <>
                <hr className="divider" />
                <div className="section-title">Join a Team</div>
                {alert(joinMsg)}
                <form onSubmit={handleJoinTeam} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input className="form-input" placeholder="Enter invite code (e.g. AB12CD34)"
                    value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    Join
                  </button>
                </form>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Ask your manager for the team invite code
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Change password */}
          <div className="card">
            <div className="section-title">Change Password</div>
            {alert(pwMsg)}
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="At least 6 characters"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Change Password</button>
            </form>
          </div>

          {/* Account info */}
          <div className="card">
            <div className="section-title">Account Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Member since', new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
                ['Role', profile.role],
                ['Teams', profile.teamNames?.length || 0],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
