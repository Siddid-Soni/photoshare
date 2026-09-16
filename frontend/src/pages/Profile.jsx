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
      setMsg('Profile updated.');
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
        <img src={avatarPreview || user?.avatar || '/images/default.jpg'} alt="avatar" />
        <div>
          <h2 style={{ margin: 0 }}>@{user?.username}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email}</div>
          <div className="stat-row"><span><b>{user?.photos_count ?? '—'}</b>photos</span></div>
        </div>
      </div>
      <div className="panel">
        <h2 style={{ marginBottom: 4 }}>Profile settings</h2>
        <p className="sub">Update your display name, email and avatar.</p>
        {msg && <div className="alert alert-ok">{msg}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label className="label">Avatar</label>
            <input
              className="input" type="file" accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; setAvatarFile(f || null); setAvatarPreview(f ? URL.createObjectURL(f) : ''); }}
            />
            {errors.image && <div className="field-error">{errors.image}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            {user && <Link className="btn btn-ghost" to={`/u/${user.username}`}>View my photos</Link>}
          </div>
        </form>
      </div>
    </div>
  );
}
