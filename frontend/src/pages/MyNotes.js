import React, { useEffect, useState } from 'react';
import { sprintApi, updateApi } from '../services/api';

export default function MyNotes() {
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    sprintApi.getAll().then(r => {
      setSprints(r.data);
      if (r.data.length > 0) setSelectedSprint(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedSprint) return;
    updateApi.getMyUpdates(selectedSprint.id).then(r => setUpdates(r.data));
  }, [selectedSprint]);

  const notesOnly = updates.filter(u => u.privateNotes && u.privateNotes.trim());

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Private Notes</div>
        <div className="page-subtitle">Personal notes from your daily standups — only visible to you</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.3)', borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem', color: 'var(--accent-yellow)', fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          🔒 These notes are private and never shared with your manager or teammates
        </div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
          <select className="form-select" value={selectedSprint?.id || ''}
            onChange={e => setSelectedSprint(sprints.find(s => s.id === Number(e.target.value)))}>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {notesOnly.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📒</div>
          <div className="empty-state-text">No private notes for this sprint</div>
          <div className="empty-state-subtext">Add notes in your daily standup under the private notes section</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notesOnly.map(u => (
            <div key={u.id} className="card" style={{ borderLeft: '3px solid var(--accent-yellow)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-yellow)' }}>{u.updateDate}</span>
                <div className="flex gap-1">
                  <span className="badge badge-blue">{u.storyPointsLogged} SP</span>
                  <span className="badge badge-green">{u.hoursWorked}h</span>
                </div>
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{u.privateNotes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
