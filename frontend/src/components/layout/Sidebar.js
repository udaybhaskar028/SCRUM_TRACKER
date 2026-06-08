import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦', roles: ['MANAGER', 'USER', 'SUPERADMIN'] },
  { path: '/my-update', label: 'My Standup', icon: '✏', roles: ['USER', 'MANAGER'] },
  { path: '/notes', label: 'My Notes', icon: '📌', roles: ['USER', 'MANAGER', 'SUPERADMIN'] },
  { path: '/sprints', label: 'Sprints', icon: '⚡', roles: ['MANAGER', 'USER', 'SUPERADMIN'] },
  { path: '/teams', label: 'My Teams', icon: '👥', roles: ['MANAGER', 'USER'] },
  { path: '/team-setup', label: 'Team Setup', icon: '⚙', roles: ['MANAGER'] },
  { path: '/sprint-setup', label: 'Sprint Setup', icon: '🗓', roles: ['MANAGER'] },
  { path: '/admin', label: 'Admin Overview', icon: '🛡', roles: ['SUPERADMIN'] },
  { path: '/profile', label: 'Profile', icon: '👤', roles: ['MANAGER', 'USER', 'SUPERADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor = {
    MANAGER: 'var(--accent-purple)',
    USER: 'var(--accent-blue)',
    SUPERADMIN: 'var(--accent-orange)',
  };

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.25rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent-blue)' }}>SCRUM</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>TRACKER</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost"
          style={{ padding: '4px 6px', minWidth: 28, fontSize: 13 }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--gradient-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName}
              </div>
              <span className="badge" style={{
                fontSize: 10, background: `${roleColor[user?.role]}20`,
                color: roleColor[user?.role]
              }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: collapsed ? '0.6rem 0' : '0.6rem 1rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(88,166,255,0.1)' : 'transparent',
                borderRight: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                textDecoration: 'none', fontSize: 14, transition: 'all 0.15s',
                fontWeight: isActive ? 600 : 400,
              })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn btn-ghost"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.5rem' }}>
          <span>⬡</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
