import React from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        background: 'var(--bg-primary)',
      }}>
        {children}
      </main>
    </div>
  );
}
