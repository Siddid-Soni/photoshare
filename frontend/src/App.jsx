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
  if (loading) return <div className="container"><p className="mono-label">Loading archive…</p></div>;
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
              <h3>Frame not found.</h3>
              <p>The page you asked for was never filed in this archive.</p>
              <div style={{ marginTop: 16 }}><Link className="btn btn-primary" to="/">Back to index</Link></div>
            </div>
          } />
        </Routes>
        <footer className="footer">
          <span className="footer-brand">PHOTOSHARE — DARKROOM № 01</span>
          <span>
            <a href="/legacy/">Legacy UI</a>
            <a href="/admin/">Admin</a>
            <a href="/api/photos/">API</a>
          </span>
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
