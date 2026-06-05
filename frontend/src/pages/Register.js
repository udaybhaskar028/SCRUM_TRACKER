import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    username: '', password: '', email: '', fullName: '', role: 'USER', inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.register(form);
      login({ username: data.username, fullName: data.fullName, role: data.role, userId: data.userId }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(31,111,235,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent-blue)' }}>
            SCRUM<span style={{ color: 'var(--accent-green)' }}>TRACK</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Create your account</div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Create account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Join your team's standup tracker</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-red)', fontSize: 13, marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Jane Doe"
                  value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" type="text" placeholder="jane_doe"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="jane@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="At least 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="USER">Team Member (User)</option>
                <option value="MANAGER">Scrum Master / Manager</option>
              </select>
            </div>

            {/* Invite code — optional */}
            <div style={{
              background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.2)',
              borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                🔗 Team Invite Code (optional)
              </div>
              <input className="form-input" placeholder="e.g. AB12CD34"
                value={form.inviteCode}
                onChange={e => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', background: 'var(--bg-primary)' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                If you have a team invite code from your manager, enter it here. You can also join a team later from your Profile page.
              </div>
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: 13 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
