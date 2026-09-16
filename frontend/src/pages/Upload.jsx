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
    if (!f.type.startsWith('image/')) { setErrors({ image: 'Please choose an image file.' }); return; }
    if (f.size > 5 * 1024 * 1024) { setErrors({ image: 'Image too large (max 5MB).' }); return; }
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
    if (!file) { setErrors({ image: 'Choose an image to upload.' }); return; }
    if (tags.length < 1) { setErrors({ tags: 'Add at least one tag.' }); return; }
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
      <Link className="btn btn-ghost btn-sm" to="/" style={{ marginBottom: 16 }}>← Gallery</Link>
      <div className="panel">
        <h2 style={{ marginBottom: 4 }}>Upload a photo</h2>
        <p className="sub">JPG, PNG or WebP up to 5MB. Add descriptive tags so others can discover your work.</p>
        <form onSubmit={submit}>
          <div
            className={`dropzone${dragOver ? ' over' : ''}`}
            onClick={() => document.getElementById('file-input').click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
          >
            <div style={{ fontSize: 32 }}>📤</div>
            <div style={{ fontWeight: 700 }}>{file ? file.name : 'Drag & drop your image here'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>or click to browse files</div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
          </div>
          {preview && <div className="preview"><img src={preview} alt="preview" /></div>}
          {errors.image && <div className="field-error">{errors.image}</div>}

          <div className="field" style={{ marginTop: 16 }}>
            <label className="label">Description</label>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the story behind this shot…" required />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="field">
            <label className="label">Tags</label>
            <input
              className="input" value={tagInput}
              onChange={(e) => { if (e.target.value.endsWith(',')) addTag(e.target.value); else setTagInput(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
              placeholder="Type a tag and press Enter (e.g. sunset)"
            />
            <div className="chips">
              {tags.map((t) => (
                <span key={t} className="chip">#{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button></span>
              ))}
            </div>
            {errors.tags && <div className="field-error">{errors.tags}</div>}
          </div>

          <label className="switch" style={{ marginBottom: 16 }}>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} /> Keep this photo private
          </label>

          {errors.detail && <div className="alert alert-error">{errors.detail}</div>}
          <button className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>{saving ? 'Uploading…' : 'Publish photo'}</button>
        </form>
      </div>
    </div>
  );
}
