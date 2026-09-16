import { Link, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Gallery from './pages/Gallery.jsx';
import Login from './pages/Login.jsx';
import PhotoDetail from './pages/PhotoDetail.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import Upload from './pages/Upload.jsx';
import UserPhotos from './pages/UserPhotos.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container"><p style={{ color: 'var(--muted)' }}>Loading…</p></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function Shell() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/u/:username" element={<UserPhotos />} />
          <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>Page not found</h3>
              <p>The page you are looking for does not exist.</p>
              <div style={{ marginTop: 12 }}><Link className="btn btn-primary" to="/">Back to gallery</Link></div>
            </div>
          } />
        </Routes>
        <footer className="footer">
          PhotoShare · React + Django · <a href="/legacy/">Legacy UI</a> · <a href="/admin/">Admin</a>
        </footer>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
