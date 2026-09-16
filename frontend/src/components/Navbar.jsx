import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">◈</span>
          <span>PhotoShare<small>Studio gallery</small></span>
        </Link>
        <nav className={`nav-links${open ? ' open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Explore</NavLink>
          {user && (
            <NavLink to={`/u/${user.username}`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>My work</NavLink>
          )}
          <NavLink to="/upload" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Upload</NavLink>
          {user ? (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Profile</NavLink>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Log in</NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Sign up</NavLink>
            </>
          )}
        </nav>
        <div className="nav-spend" />
        <div className="nav-user">
          {user ? (
            <>
              {user.avatar && <img className="avatar" src={user.avatar} alt={user.username} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>@{user.username}</span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <Link className="btn btn-primary btn-sm" to="/register">Get started</Link>
          )}
          <button className="btn btn-ghost btn-sm mobile-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  );
}
