import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Empty, PhotoCard, Skeletons } from '../components/ui.jsx';

export default function UserPhotos() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.listPhotos({ page: p, username });
      setData(res);
      setPage(p);
    } catch { /* show empty */ } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { load(1); }, [load]);

  const results = data?.results || [];
  const firstAvatar = results.find((p) => p.author_avatar)?.author_avatar;

  return (
    <>
      <div className="profile-head">
        {firstAvatar
          ? <img src={firstAvatar} alt={username} />
          : <span className="avatar fallback" style={{ width: 76, height: 76, fontSize: 30 }}>{(username || '?')[0].toUpperCase()}</span>}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="mono-label">Artist wall</div>
          <h2 style={{ margin: '6px 0 2px' }}>@{username}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{data?.count ?? '—'} frames on public view</div>
        </div>
        <Link className="btn btn-ghost btn-sm" to="/">← Index</Link>
      </div>
      {loading ? <Skeletons /> : results.length === 0 ? (
        <Empty title={`@${username} keeps this wall bare`} hint="Anything marked private stays in their drawer — invisible to the rest of us." />
      ) : (
        <>
          <div className="masonry">{results.map((p, i) => <PhotoCard key={p.id} photo={p} index={i} />)}</div>
          <div className="pager">
            {data.previous && <button className="btn btn-ghost btn-sm" onClick={() => load(page - 1)}>← Prev</button>}
            <span className="page-no">— {String(page).padStart(2, '0')} —</span>
            {data.next && <button className="btn btn-ghost btn-sm" onClick={() => load(page + 1)}>Next →</button>}
          </div>
        </>
      )}
    </>
  );
}
