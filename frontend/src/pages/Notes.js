import React, { useState, useEffect } from 'react';
import { noteApi } from '../services/api';

const COLORS = {
  YELLOW:  { bg: '#2d2a00', border: '#d29922', text: '#f0c84a', label: 'Yellow' },
  BLUE:    { bg: '#001630', border: '#58a6ff', text: '#79b8ff', label: 'Blue' },
  GREEN:   { bg: '#002910', border: '#3fb950', text: '#56d364', label: 'Green' },
  PINK:    { bg: '#2d0028', border: '#f778ba', text: '#f778ba', label: 'Pink' },
  PURPLE:  { bg: '#1a0030', border: '#bc8cff', text: '#bc8cff', label: 'Purple' },
  ORANGE:  { bg: '#2d1200', border: '#f0883e', text: '#f0883e', label: 'Orange' },
};

function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const col = COLORS[note.color] || COLORS.YELLOW;
  return (
    <div style={{
      background: col.bg,
      border: `1px solid ${col.border}`,
      borderRadius: 12,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      position: 'relative',
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'default',
      minHeight: 160,
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Pin badge */}
      {note.pinned && (
        <div style={{
          position: 'absolute', top: -8, right: 12,
          fontSize: 18, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
        }}>📌</div>
      )}

      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: 14, color: col.text, paddingRight: 20 }}>
        {note.title}
      </div>

      {/* Content */}
      <div style={{
        fontSize: 13, color: 'var(--text-secondary)',
        flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        lineHeight: 1.6,
      }}>
        {note.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No content</span>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => onTogglePin(note)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: note.pinned ? 1 : 0.4 }}
            title={note.pinned ? 'Unpin' : 'Pin'}>📌</button>
          <button onClick={() => onEdit(note)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.7 }}
            title="Edit">✏️</button>
          <button onClick={() => onDelete(note.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.7 }}
            title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({ note, onSave, onClose }) {
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    color: note?.color || 'YELLOW',
    pinned: note?.pinned || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: '1.25rem' }}>
          {note ? 'Edit Note' : '+ New Note'}
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" placeholder="Note title..."
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea className="form-textarea" placeholder="Write your note here..."
            style={{ minHeight: 140 }}
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>

        {/* Color picker */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(COLORS).map(([key, val]) => (
              <button key={key} onClick={() => setForm({ ...form, color: key })}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: val.bg, border: `2px solid ${val.border}`,
                  cursor: 'pointer',
                  outline: form.color === key ? `3px solid ${val.border}` : 'none',
                  outlineOffset: 2,
                  transition: 'outline 0.1s',
                }}
                title={val.label} />
            ))}
          </div>
        </div>

        {/* Pin toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input type="checkbox" id="pinned" checked={form.pinned}
            onChange={e => setForm({ ...form, pinned: e.target.checked })}
            style={{ width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="pinned" style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
            📌 Pin this note (appears first)
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filterColor, setFilterColor] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchNotes = () => {
    setLoading(true);
    noteApi.getAll().then(r => setNotes(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async (form) => {
    if (editingNote) {
      await noteApi.update(editingNote.id, form);
    } else {
      await noteApi.create(form);
    }
    setShowModal(false);
    setEditingNote(null);
    fetchNotes();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      await noteApi.delete(id);
      fetchNotes();
    }
  };

  const handleTogglePin = async (note) => {
    await noteApi.update(note.id, { pinned: !note.pinned });
    fetchNotes();
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const filtered = notes.filter(n => {
    const matchColor = filterColor === 'ALL' || n.color === filterColor;
    const matchSearch = search === '' ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(search.toLowerCase());
    return matchColor && matchSearch;
  });

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <div>
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">My Notes</div>
          <div className="page-subtitle">Personal sticky notes — only visible to you</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingNote(null); setShowModal(true); }}>
          + New Note
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" placeholder="🔍 Search notes..."
          style={{ maxWidth: 240 }}
          value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterColor('ALL')}
            className={`btn ${filterColor === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '4px 12px', fontSize: 12 }}>All</button>
          {Object.entries(COLORS).map(([key, val]) => (
            <button key={key} onClick={() => setFilterColor(key)}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: val.bg, border: `2px solid ${filterColor === key ? val.border : 'transparent'}`,
                cursor: 'pointer', outline: filterColor === key ? `2px solid ${val.border}` : 'none',
                outlineOffset: 2,
              }}
              title={val.label} />
          ))}
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 'auto' }}>
          {filtered.length} note{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? <div className="spinner" /> : notes.length === 0 ? (
        <div className="card empty-state" style={{ marginTop: '2rem' }}>
          <div className="empty-state-icon">📌</div>
          <div className="empty-state-text">No notes yet</div>
          <div className="empty-state-subtext">Click "+ New Note" to create your first sticky note</div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => { setEditingNote(null); setShowModal(true); }}>
            + Create Note
          </button>
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <>
              <div className="section-title">📌 Pinned</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem', marginBottom: '1.5rem',
              }}>
                {pinned.map(n => (
                  <NoteCard key={n.id} note={n}
                    onEdit={handleEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                ))}
              </div>
            </>
          )}

          {/* Other notes */}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <div className="section-title">All Notes</div>}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
              }}>
                {unpinned.map(n => (
                  <NoteCard key={n.id} note={n}
                    onEdit={handleEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                ))}
              </div>
            </>
          )}

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No notes match your filter</div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <NoteModal note={editingNote} onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingNote(null); }} />
      )}
    </div>
  );
}
