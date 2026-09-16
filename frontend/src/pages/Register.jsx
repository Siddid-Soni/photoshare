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
        <h1>Create your account</h1>
        <p>Join PhotoShare to start building your public portfolio.</p>
        {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors}</div>}
        {errors.detail && <div className="alert alert-error">{errors.detail}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
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
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        </form>
        <p style={{ marginTop: 16, marginBottom: 0 }}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
