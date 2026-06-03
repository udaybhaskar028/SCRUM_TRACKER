import React, { useEffect, useState } from 'react';
import { sprintApi } from '../services/api';

export default function Sprints() {
  const [sprints, setSprints] = useState([]);

  useEffect(() => { sprintApi.getAll().then(r => setSprints(r.data)); }, []);

  const statusColors = { ACTIVE: 'badge-green', COMPLETED: 'badge-blue', UPCOMING: 'badge-orange' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sprints</div>
        <div className="page-subtitle">All sprint cycles and their configurations</div>
      </div>

      {sprints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-text">No sprints configured</div>
          <div className="empty-state-subtext">Ask your manager to set up a sprint</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sprints.map(s => (
            <div key={s.id} className="card">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {s.startDate} → {s.endDate} · Created by {s.createdByName}
                  </div>
                </div>
                <span className={`badge ${statusColors[s.status]}`}>{s.status}</span>
              </div>
              <hr className="divider" />
              <div className="grid-3">
                <div>
                  <div className="stat-label">Total Story Points</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-blue)' }}>{s.totalStoryPoints}</div>
                </div>
                <div>
                  <div className="stat-label">Hours / Story Point</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>{s.hoursPerStoryPoint}h</div>
                </div>
                <div>
                  <div className="stat-label">Total Capacity</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--accent-orange)' }}>
                    {(s.totalStoryPoints * s.hoursPerStoryPoint).toFixed(0)}h
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
