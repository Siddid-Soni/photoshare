import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, fieldErrors } from '../api/client.js';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function pick(f) {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setErrors({ image: 'That file is not an image — JPG, PNG or WebP only.' }); return; }
    if (f.size > 5 * 1024 * 1024) { setErrors({ image: 'Too heavy for the shelf (max 5MB).' }); return; }
    setErrors({});
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function addTag(raw) {
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
    if (!parts.length) return;
    setTags((prev) => [...new Set([...prev, ...parts])].slice(0, 20));
    setTagInput('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) { setErrors({ image: 'Choose a negative to print.' }); return; }
    if (tags.length < 1) { setErrors({ tags: 'File at least one tag — it is how people find you.' }); return; }
    setSaving(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('description', description);
      fd.append('is_private', isPrivate ? 'true' : 'false');
      tags.forEach((t) => fd.append('tags', t));
      const created = await api.createPhoto(fd);
      navigate(`/photo/${created.id}`);
    } catch (err) {
      setErrors(fieldErrors(err.data));
      if (!Object.keys(fieldErrors(err.data || {})).length) setErrors({ detail: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="crumbrow">
        <Link className="btn btn-ghost btn-sm" to="/">← Index</Link>
        <span className="sep">/</span>
        <span className="mono-label">New entry</span>
      </div>
      <div className="panel">
        <div className="kicker" style={{ fontSize: 10 }}>Print room</div>
        <h2 style={{ marginTop: 10, fontSize: 30 }}>Hang a new frame</h2>
        <p className="sub">JPG, PNG or WebP · max 5MB · filed under your handle</p>
        <div className="divider" />
        <form onSubmit={submit}>
          <div
            className={`dropzone${dragOver ? ' over' : ''}`}
            onClick={() => document.getElementById('file-input').click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
          >
            <div className="dz-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{file ? file.name : 'Drop your negative here'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>or click to browse — {(file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'nothing loaded yet')}</div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
          </div>
          {preview && <div className="preview"><img src={preview} alt="preview" /></div>}
          {errors.image && <div className="field-error">{errors.image}</div>}

          <div className="field" style={{ marginTop: 18 }}>
            <label className="label">Caption</label>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where were you standing? What did the light do?" required />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="field">
            <label className="label">Filing tags</label>
            <input
              className="input" value={tagInput}
              onChange={(e) => { if (e.target.value.endsWith(',')) addTag(e.target.value); else setTagInput(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
              placeholder="portrait + Enter, film + Enter…"
            />
            <div className="chips">
              {tags.map((t) => (
                <span key={t} className="chip">#{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button></span>
              ))}
            </div>
            {errors.tags && <div className="field-error">{errors.tags}</div>}
          </div>

          <label className="switch" style={{ marginBottom: 18 }}>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Proof only — keep private
          </label>

          {errors.detail && <div className="alert alert-error">{errors.detail}</div>}
          <button className="btn btn-accent" disabled={saving} style={{ width: '100%' }}>{saving ? 'Printing…' : 'Publish to the wall'}</button>
        </form>
      </div>
    </div>
  );
}
