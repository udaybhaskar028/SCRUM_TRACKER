import React, { useState, useEffect } from 'react';
import { sprintApi, teamApi } from '../services/api';

const PRESETS = [
  { label: '🚀 Standard 2-week sprint', days: 14, sp: 40, hSP: 4, desc: '40 SP × 4h = 160 team hours' },
  { label: '⚡ Fast 1-week sprint', days: 7, sp: 20, hSP: 4, desc: '20 SP × 4h = 80 team hours' },
  { label: '🏗 Long 3-week sprint', days: 21, sp: 60, hSP: 4, desc: '60 SP × 4h = 240 team hours' },
  { label: '🎯 Lightweight sprint', days: 14, sp: 30, hSP: 3, desc: '30 SP × 3h = 90 team hours' },
];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const today = new Date().toISOString().split('T')[0];

export default function SprintSetup() {
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [form, setForm] = useState({
    name: '', startDate: today, endDate: addDays(today, 14),
    totalStoryPoints: 40, hoursPerStoryPoint: 4, goal: '', teamId: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    teamApi.getMyTeams().then(r => {
      setTeams(r.data);
      if (r.data.length > 0) setForm(f => ({ ...f, teamId: r.data[0].id }));
    });
    sprintApi.getAll().then(r => setSprints(r.data));
  }, []);

  const sprintDays = form.startDate && form.endDate
    ? Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const totalCapacity = (form.totalStoryPoints || 0) * (form.hoursPerStoryPoint || 0);
  const hoursPerDay = sprintDays > 0 ? (totalCapacity / sprintDays).toFixed(1) : 0;

  const applyPreset = (preset) => {
    const end = addDays(form.startDate || today, preset.days);
    setForm(f => ({
      ...f,
      endDate: end,
      totalStoryPoints: preset.sp,
      hoursPerStoryPoint: preset.hSP,
    }));
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      await sprintApi.create({
        ...form,
        totalStoryPoints: Number(form.totalStoryPoints),
        hoursPerStoryPoint: Number(form.hoursPerStoryPoint),
        teamId: Number(form.teamId),
      });
      setSuccess('Sprint created successfully!');
      setStep(1);
      setForm({ name: '', startDate: today, endDate: addDays(today, 14), totalStoryPoints: 40, hoursPerStoryPoint: 4, goal: '', teamId: teams[0]?.id || '' });
      sprintApi.getAll().then(r => setSprints(r.data));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sprint');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    await sprintApi.updateStatus(id, status);
    sprintApi.getAll().then(r => setSprints(r.data));
  };

  const stepValid = {
    1: form.name.trim() && form.teamId,
    2: form.startDate && form.endDate && sprintDays > 0,
    3: form.totalStoryPoints > 0 && form.hoursPerStoryPoint > 0,
  };

  const statusColors = { ACTIVE: 'var(--accent-green)', COMPLETED: 'var(--text-muted)', UPCOMING: 'var(--accent-blue)' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sprint Setup</div>
        <div className="page-subtitle">Configure sprint cycles with story point baselines for your teams</div>
      </div>

      {success && <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', color: 'var(--accent-green)', marginBottom: '1.5rem' }}>✓ {success}</div>}
      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', color: 'var(--accent-red)', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Wizard */}
        <div className="card">
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
            {[
              { n: 1, label: 'Name & Team' },
              { n: 2, label: 'Dates' },
              { n: 3, label: 'Effort Setup' },
              { n: 4, label: 'Review' },
            ].map((s, i) => (
              <div key={s.n} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div onClick={() => step > s.n && setStep(s.n)} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step === s.n ? 'var(--accent-blue)' : step > s.n ? 'var(--accent-green)' : 'var(--bg-secondary)',
                    border: `2px solid ${step >= s.n ? (step > s.n ? 'var(--accent-green)' : 'var(--accent-blue)') : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: step >= s.n ? 'white' : 'var(--text-muted)',
                    cursor: step > s.n ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <div style={{ fontSize: 11, color: step === s.n ? 'var(--accent-blue)' : 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
                    {s.label}
                  </div>
                </div>
                {i < 3 && <div style={{ height: 2, flex: 1, background: step > s.n ? 'var(--accent-green)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Name & Team */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.25rem', fontSize: 16, fontWeight: 700 }}>Step 1 — Name your sprint & select team</h3>
              <div className="form-group">
                <label className="form-label">Sprint Name *</label>
                <input className="form-input" placeholder="e.g. Sprint 12 — Authentication Module"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  💡 Tip: Include the sprint number and main focus area
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Team *</label>
                {teams.length === 0 ? (
                  <div style={{ color: 'var(--accent-orange)', fontSize: 13, padding: '0.6rem', background: 'rgba(240,136,62,0.1)', borderRadius: 'var(--radius)' }}>
                    ⚠ You need to create a team first in Team Setup
                  </div>
                ) : (
                  <select className="form-select" value={form.teamId} onChange={e => setForm({ ...form, teamId: e.target.value })}>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.memberCount} members)</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Sprint Goal (optional)</label>
                <textarea className="form-textarea" placeholder="What should the team achieve by the end of this sprint?&#10;e.g. Complete user authentication, implement dashboard, fix critical bugs"
                  value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: 16, fontWeight: 700 }}>Step 2 — Set sprint dates</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Use the calendar to pick your sprint start and end dates. Most sprints run for 1–3 weeks.
              </div>

              {/* Presets */}
              <div className="section-title">Quick Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)} className="btn btn-ghost"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.75rem', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.desc}</span>
                  </button>
                ))}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="form-input" type="date" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input className="form-input" type="date" value={form.endDate}
                    min={form.startDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>

              {sprintDays > 0 && (
                <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', fontSize: 13 }}>
                  📅 This sprint is <strong style={{ color: 'var(--accent-blue)' }}>{sprintDays} days</strong> long
                  {sprintDays < 5 && <span style={{ color: 'var(--accent-orange)' }}> — very short, consider at least 7 days</span>}
                  {sprintDays > 30 && <span style={{ color: 'var(--accent-orange)' }}> — very long, consider splitting into smaller sprints</span>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Effort */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: 16, fontWeight: 700 }}>Step 3 — Configure effort baseline</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Story Points measure task complexity. You set how many hours equal 1 SP for your team — this lets the app calculate remaining effort for each developer.
              </div>

              {/* Explanation box */}
              <div style={{ background: 'rgba(210,153,34,0.08)', border: '1px solid rgba(210,153,34,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-yellow)', marginBottom: '0.4rem' }}>📖 What is a Story Point?</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  A Story Point (SP) is a unit of <em>effort complexity</em>, not time. Your team decides:
                  <br />• 1 SP = a tiny task (fix a label, update a color)
                  <br />• 3 SP = a medium task (build a form, add an API)
                  <br />• 8 SP = a large task (full feature with tests)
                  <br /><br />
                  <strong>Hours per SP</strong> tells the app: "1 SP of work typically takes X hours in our team."
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Total Story Points *</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 40"
                    value={form.totalStoryPoints}
                    onChange={e => setForm({ ...form, totalStoryPoints: e.target.value })} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    How many SP is the team expected to complete this sprint?
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hours per Story Point *</label>
                  <input className="form-input" type="number" step="0.5" min="0.5" placeholder="e.g. 4"
                    value={form.hoursPerStoryPoint}
                    onChange={e => setForm({ ...form, hoursPerStoryPoint: e.target.value })} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    How many hours does 1 SP typically take your team?
                  </div>
                </div>
              </div>

              {/* Live capacity preview */}
              {form.totalStoryPoints > 0 && form.hoursPerStoryPoint > 0 && (
                <div style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: 'var(--radius)', padding: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-green)', marginBottom: '0.75rem' }}>
                    Sprint Capacity Preview
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                    {[
                      ['Total Hours', `${totalCapacity}h`, 'var(--accent-blue)'],
                      ['Sprint Days', `${sprintDays}d`, 'var(--accent-orange)'],
                      ['Hours/Day', `${hoursPerDay}h`, 'var(--accent-green)'],
                    ].map(([label, value, color]) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    {form.totalStoryPoints} SP × {form.hoursPerStoryPoint}h/SP = {totalCapacity} total team hours over {sprintDays} days
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: '1.25rem', fontSize: 16, fontWeight: 700 }}>Step 4 — Review & Create</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {[
                  ['Sprint Name', form.name],
                  ['Team', teams.find(t => t.id === Number(form.teamId))?.name || '—'],
                  ['Start Date', form.startDate],
                  ['End Date', form.endDate],
                  ['Duration', `${sprintDays} days`],
                  ['Total Story Points', form.totalStoryPoints],
                  ['Hours per Story Point', `${form.hoursPerStoryPoint}h`],
                  ['Total Capacity', `${totalCapacity}h`],
                  ['Goal', form.goal || '(none)'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : '🚀 Create Sprint'}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
              ← Back
            </button>
            {step < 4 && (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}
                disabled={!stepValid[step] || (step === 1 && teams.length === 0)}>
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Right: Existing sprints */}
        <div className="card">
          <div className="section-title">All Sprints</div>
          {sprints.length === 0 ? (
            <div className="empty-state"><div className="empty-state-text">No sprints yet</div></div>
          ) : sprints.map(s => (
            <div key={s.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {s.teamName} · {s.startDate} → {s.endDate}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{s.totalStoryPoints} SP</span>
                <span className="badge badge-green">{s.hoursPerStoryPoint}h/SP</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: statusColors[s.status], marginLeft: 'auto', fontWeight: 700 }}>{s.status}</span>
              </div>
              <select className="form-select" style={{ fontSize: 11, padding: '2px 6px', marginTop: 6, width: 'auto' }}
                value={s.status} onChange={e => handleStatusChange(s.id, e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
