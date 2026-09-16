import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fieldErrors } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { Skeletons, TagBadge } from '../components/ui.jsx';

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ description: '', tags: '', is_private: false });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getPhoto(id)
      .then((p) => {
        setPhoto(p);
        setForm({ description: p.description || '', tags: (p.tags || []).join(', '), is_private: !!p.is_private });
      })
      .catch((e) => setError(e.status === 404 ? 'This photo does not exist or is private.' : e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onDelete() {
    if (!window.confirm('Delete this photo permanently?')) return;
    try {
      await api.deletePhoto(id);
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const updated = await api.updatePhoto(id, { description: form.description, tags, is_private: form.is_private });
      setPhoto(updated);
      setEditing(false);
    } catch (err) {
      const fe = fieldErrors(err.data);
      setFormError(fe.tags || fe.description || fe.detail || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeletons count={2} />;
  if (error) return <div className="alert alert-error">{error} <Link to="/" style={{ marginLeft: 8 }}>← Back to gallery</Link></div>;
  if (!photo) return null;

  const mine = user && photo.is_owner;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link className="btn btn-ghost btn-sm" to="/">← Gallery</Link>
        {photo.author && <Link className="btn btn-ghost btn-sm" to={`/u/${photo.author}`}>More from @{photo.author}</Link>}
      </div>
      <div className="detail">
        <div className="photo-frame">
          <img src={photo.image_url} alt={photo.description} />
        </div>
        <aside className="panel">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Photo #{photo.id}</h2>
            {photo.is_private && <span className="private-pill">Private</span>}
          </div>
          <div className="sub">{new Date(photo.date_posted).toLocaleString()} · {photo.is_private ? 'Only you can see this' : 'Public'}</div>
          <div className="author-row">
            {photo.author_avatar && <img className="avatar" src={photo.author_avatar} alt="" />}
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Shared by</div>
              {photo.author ? <Link to={`/u/${photo.author}`}>@{photo.author}</Link> : <span>unknown</span>}
            </div>
          </div>
          {!editing ? (
            <>
              <p className="desc">{photo.description}</p>
              <div className="tag-row">{(photo.tags || []).map((t) => <TagBadge key={t} name={t} />)}</div>
              {mine && (
                <>
                  <div className="divider" />
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={onSave}>
              <div className="field">
                <label className="label">Description</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="sunset, beach, travel" />
              </div>
              <label className="switch" style={{ marginBottom: 14 }}>
                <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} /> Private photo
              </label>
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="actions">
                <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
