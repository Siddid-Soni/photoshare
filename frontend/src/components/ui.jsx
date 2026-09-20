import { Link } from 'react-router-dom';

export function TagBadge({ name, slug, to }) {
  const href = to || `/?tag=${encodeURIComponent(slug || name)}`;
  return <Link className="tag" to={href}>#{name}</Link>;
}

export function PhotoCard({ photo, index = 0 }) {
  const src = photo.image_url;
  return (
    <Link className="card" to={`/photo/${photo.id}`} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <span className="card-imgwrap">
        <img className="photo" src={src} alt={photo.description?.slice(0, 80) || `Photo ${photo.id}`} loading="lazy" />
      </span>
      <span className="card-foot">
        {photo.author_avatar
          ? <img className="avatar" src={photo.author_avatar} alt="" style={{ width: 26, height: 26 }} />
          : <span className="avatar fallback" style={{ width: 26, height: 26 }}>{(photo.author || '?')[0].toUpperCase()}</span>}
        <span className="who">
          <strong>@{photo.author || 'unknown'}</strong>
          <span>{(photo.tags || []).slice(0, 2).map((t) => `#${t}`).join('  ·  ') || `Frame ${String(photo.id).padStart(3, '0')}`}</span>
        </span>
        {photo.is_private
          ? <span className="private-pill">Private</span>
          : <span className="card-num">№ {String(photo.id).padStart(3, '0')}</span>}
      </span>
    </Link>
  );
}

export function Skeletons({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 200 + ((i * 67) % 180) }} />
      ))}
    </div>
  );
}

function EmptyArt() {
  return (
    <span className="empty-icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5.5 17.5 4.5-4.5 3 3 2.5-2.5 3 3" />
      </svg>
    </span>
  );
}

export function Empty({ title = 'Nothing filed yet', hint = 'Try a different search — or be the first to publish to this shelf.', action }) {
  return (
    <div className="empty">
      <EmptyArt />
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
