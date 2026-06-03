import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(form);
      login({ username: data.username, fullName: data.fullName, role: data.role, userId: data.userId }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(31,111,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(63,185,80,0.05) 0%, transparent 60%)',
    }}>
      <div style={{ width: 380 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '-0.02em' }}>
            SCRUM<span style={{ color: 'var(--accent-green)' }}>TRACK</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Daily standup tracker for dev teams</div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Sign in</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem', color: 'var(--accent-red)', fontSize: 13, marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="your_username"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: 13 }}>
            No account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
