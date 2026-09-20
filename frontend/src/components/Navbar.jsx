import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function ApertureMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" opacity="0.9" />
        <path d="M12 3v5.8M20.8 8.5l-5 2.9M20.8 15.5l-5-2.9M12 21v-5.8M3.2 15.5l5-2.9M3.2 8.5l5 2.9" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <>
      <div className="topline" />
      <header className="nav">
        <div className="nav-inner">
          <Link className="brand" to="/" onClick={() => setOpen(false)}>
            <ApertureMark />
            <span className="brand-word">
              <strong>PHOTOSHARE</strong>
              <small>COMMUNITY DARKROOM</small>
            </span>
          </Link>
          <nav className={`nav-links${open ? ' open' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Index</NavLink>
            {user && (
              <NavLink to={`/u/${user.username}`} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>My Archive</NavLink>
            )}
            <NavLink to="/upload" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Publish</NavLink>
            {user ? (
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Settings</NavLink>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Log in</NavLink>
                <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>Join</NavLink>
              </>
            )}
          </nav>
          <div className="nav-spend" />
          <div className="nav-user">
            {user ? (
              <>
                <span className="nav-handle">
                  {user.avatar
                    ? <img className="avatar" src={user.avatar} alt={user.username} />
                    : <span className="avatar fallback" style={{ width: 24, height: 24 }}>{(user.username || '?')[0].toUpperCase()}</span>}
                  <span>@{user.username}</span>
                </span>
                <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
              </>
            ) : (
              <Link className="btn btn-accent btn-sm" to="/register">
                Join the darkroom
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            )}
            <button className="btn btn-ghost btn-sm mobile-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
