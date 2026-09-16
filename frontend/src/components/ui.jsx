import { Link } from 'react-router-dom';

export function TagBadge({ name, slug, to }) {
  const href = to || `/?tag=${encodeURIComponent(slug || name)}`;
  return <Link className="tag" to={href}>#{name}</Link>;
}

export function PhotoCard({ photo }) {
  const src = photo.image_url;
  return (
    <Link className="card" to={`/photo/${photo.id}`}>
      <img src={src} alt={photo.description?.slice(0, 80) || 'Photo'} loading="lazy" />
      <span className="card-overlay">
        <span className="card-meta">
          {photo.author_avatar && <img className="avatar" src={photo.author_avatar} alt="" style={{ width: 26, height: 26 }} />}
          <span>@{photo.author || 'unknown'}</span>
        </span>
        {photo.is_private && <span className="private-pill">Private</span>}
      </span>
    </Link>
  );
}

export function Skeletons({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 180 + ((i * 53) % 160) }} />
      ))}
    </div>
  );
}

export function Empty({ icon = '🖼️', title = 'Nothing here yet', hint = 'Try a different search or be the first to upload.', action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{hint}</p>
      {action}
    </div>
  );
}

export function Protected({ user, loading, children, fallback }) {
  if (loading) return <Skeletons count={4} />;
  if (!user) return fallback;
  return children;
}
