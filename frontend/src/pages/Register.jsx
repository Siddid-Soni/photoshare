import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fieldErrors } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password1: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors(fieldErrors(err.data));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center">
      <div className="auth-card">
        <div className="kicker" style={{ fontSize: 10 }}>Membership — free</div>
        <h1>Take a shelf.</h1>
        <p>One account, unlimited frames. Pick a handle and hang your first print.</p>
        {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors}</div>}
        {errors.detail && <div className="alert alert-error">{errors.detail}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Handle</label>
            <input className="input" value={form.username} placeholder="e.g. agnes_varda" onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} placeholder="you@studio.com" onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password1} onChange={(e) => setForm({ ...form, password1: e.target.value })} autoComplete="new-password" required />
            {errors.password1 && <div className="field-error">{errors.password1}</div>}
          </div>
          <div className="field">
            <label className="label">Confirm password</label>
            <input className="input" type="password" value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} autoComplete="new-password" required />
            {errors.password2 && <div className="field-error">{errors.password2}</div>}
          </div>
          <button className="btn btn-accent" style={{ width: '100%' }} disabled={busy}>{busy ? 'Filing…' : 'Claim your handle'}</button>
        </form>
        <p style={{ marginTop: 18, marginBottom: 0 }}>Already filed? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
