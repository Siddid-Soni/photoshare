import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fieldErrors } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username.trim(), form.password);
      navigate('/');
    } catch (err) {
      const fe = fieldErrors(err.data);
      setError(fe.detail || fe.non_field_errors || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center">
      <div className="auth-card">
        <div className="kicker" style={{ fontSize: 10 }}>Members entrance</div>
        <h1>Welcome back.</h1>
        <p>The enlarger is still warm. Sign in to keep filing.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Developing…' : 'Log in'}</button>
        </form>
        <p style={{ marginTop: 18, marginBottom: 0 }}>No card yet? <Link to="/register">Request membership</Link></p>
      </div>
    </div>
  );
}
