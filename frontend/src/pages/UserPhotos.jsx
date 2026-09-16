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

  return (
    <>
      <div className="profile-head">
        <div style={{ width: 84, height: 84, borderRadius: 24, background: 'linear-gradient(135deg,var(--brand),var(--brand-2))', display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 800 }}>
          {(username || '?')[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>@{username}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{data?.count ?? ''} photos</div>
          <div style={{ marginTop: 10 }}><Link className="btn btn-ghost btn-sm" to="/">← Explore</Link></div>
        </div>
      </div>
      {loading ? <Skeletons /> : results.length === 0 ? (
        <Empty title={`@${username} hasn't shared visible photos`} hint="Photos they mark private are hidden from everyone else." />
      ) : (
        <>
          <div className="masonry">{results.map((p) => <PhotoCard key={p.id} photo={p} />)}</div>
          <div className="pager">
            {data.previous && <button className="btn btn-ghost btn-sm" onClick={() => load(page - 1)}>← Prev</button>}
            <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 13 }}>Page {page}</span>
            {data.next && <button className="btn btn-ghost btn-sm" onClick={() => load(page + 1)}>Next →</button>}
          </div>
        </>
      )}
    </>
  );
}
