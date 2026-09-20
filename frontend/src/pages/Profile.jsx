import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fieldErrors } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { Skeletons } from '../components/ui.jsx';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ username: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile()
      .then((p) => setForm({ username: p.username || '', email: p.email || '' }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErrors({});
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('email', form.email);
      if (avatarFile) fd.append('image', avatarFile);
      await api.updateProfile(fd);
      await refresh();
      setMsg('Card re-printed. Your shelf is up to date.');
    } catch (err) {
      setErrors(fieldErrors(err.data));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeletons count={2} />;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="profile-head">
        {avatarPreview || user?.avatar
          ? <img src={avatarPreview || user?.avatar} alt="avatar" />
          : <span className="avatar fallback" style={{ width: 76, height: 76, fontSize: 28 }}>{(user?.username || '?')[0].toUpperCase()}</span>}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="mono-label">Member card</div>
          <h2 style={{ margin: '6px 0 2px' }}>@{user?.username}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{user?.email}</div>
          <div className="stat-row">
            <span><b>{user?.photos_count ?? '—'}</b>Frames</span>
            <span><b>{user ? 'MEMBER' : '—'}</b>Status</span>
          </div>
        </div>
        {user && <Link className="btn btn-ghost btn-sm" to={`/u/${user.username}`}>View wall →</Link>}
      </div>
      <div className="panel">
        <div className="kicker" style={{ fontSize: 10 }}>Settings</div>
        <h2 style={{ marginTop: 10 }}>Retouch your card</h2>
        <p className="sub">Handle, contact email and portrait.</p>
        <div className="divider" />
        {msg && <div className="alert alert-ok">{msg}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Handle</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label className="label">Portrait</label>
            <input
              className="input" type="file" accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; setAvatarFile(f || null); setAvatarPreview(f ? URL.createObjectURL(f) : ''); }}
            />
            {errors.image && <div className="field-error">{errors.image}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Printing…' : 'Save changes'}</button>
            {user && <Link className="btn btn-ghost" to={`/u/${user.username}`}>View my wall</Link>}
          </div>
        </form>
      </div>
    </div>
  );
}
