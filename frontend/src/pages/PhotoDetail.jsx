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
      .catch((e) => setError(e.status === 404 ? 'This frame is private, moved, or never existed.' : e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onDelete() {
    if (!window.confirm('Remove this frame from the archive permanently?')) return;
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
  if (error) return <div className="alert alert-error">{error} <Link to="/" style={{ marginLeft: 8 }}>← Back to index</Link></div>;
  if (!photo) return null;

  const mine = user && photo.is_owner;

  return (
    <div>
      <div className="crumbrow">
        <Link className="btn btn-ghost btn-sm" to="/">← Index</Link>
        <span className="sep">/</span>
        <span className="mono-label">Frame № {String(photo.id).padStart(3, '0')}</span>
        {photo.author && (
          <>
            <span className="sep">/</span>
            <Link className="btn btn-ghost btn-sm" to={`/u/${photo.author}`}>@{photo.author}</Link>
          </>
        )}
      </div>
      <div className="detail">
        <div className="photo-frame">
          <img src={photo.image_url} alt={photo.description} />
          <div className="framestrip">
            <span><i />{photo.is_private ? 'Private proof — only you' : 'On public view'}</span>
            <span>{new Date(photo.date_posted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <aside className="panel">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kicker" style={{ fontSize: 10 }}>Catalogue entry</span>
            {photo.is_private && <span className="private-pill">Private</span>}
          </div>
          <h2 style={{ marginTop: 10 }}>{photo.description?.split('\n')[0]?.slice(0, 60) || `Frame № ${photo.id}`}</h2>
          <div className="sub">{new Date(photo.date_posted).toLocaleString()}</div>
          <div className="exif">
            <div><span>Photographer</span><b>@{photo.author || 'unknown'}</b></div>
            <div><span>Visibility</span><b>{photo.is_private ? 'Private' : 'Public'}</b></div>
            <div><span>Frame</span><b>№ {String(photo.id).padStart(3, '0')}</b></div>
            <div><span>Tags</span><b>{(photo.tags || []).length}</b></div>
          </div>
          <div className="author-row">
            {photo.author_avatar
              ? <img className="avatar" src={photo.author_avatar} alt="" />
              : <span className="avatar fallback" style={{ width: 38, height: 38 }}>{(photo.author || '?')[0].toUpperCase()}</span>}
            <div>
              <div className="mono-label">Filed by</div>
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
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit entry</button>
                    <button className="btn btn-danger btn-sm" onClick={onDelete}>Remove</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <form onSubmit={onSave}>
              <div className="field">
                <label className="label">Caption</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Tags — comma separated</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="portrait, film, lisbon" />
              </div>
              <label className="switch" style={{ marginBottom: 14 }}>
                <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} /> Keep this frame private
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
