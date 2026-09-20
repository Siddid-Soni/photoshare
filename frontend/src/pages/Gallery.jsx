import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Empty, PhotoCard, Skeletons } from '../components/ui.jsx';

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const initialSearch = params.get('search') || '';
  const tag = params.get('tag') || '';
  const [query, setQuery] = useState(initialSearch);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState([]);

  const search = useMemo(() => params.get('search') || '', [params]);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listPhotos({ page: p, search, tag });
      setData(res);
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.message || 'Could not load photos.');
    } finally {
      setLoading(false);
    }
  }, [search, tag]);

  useEffect(() => { load(1); }, [load]);
  useEffect(() => { api.listTags().then(setTags).catch(() => {}); }, []);

  function submitSearch(e) {
    e.preventDefault();
    const next = {};
    if (query.trim()) next.search = query.trim();
    if (tag) next.tag = tag;
    setParams(next);
  }

  function clearFilters() {
    setQuery('');
    setParams({});
  }

  const results = data?.results || [];
  const count = data?.count ?? 0;

  return (
    <>
      <section className="masthead">
        <div className="kicker">Vol. 01 — Open shelves, new arrivals daily</div>
        <div className="masthead-grid">
          <div>
            <h1 className="display">A quiet home<br />for <em>loud images.</em></h1>
            <p className="lede">
              PhotoShare is a community darkroom — publish finished work, keep sketches
              private, and file everything by tag so the right eyes find it.
            </p>
            <form className="search-row" onSubmit={submitSearch}>
              <div className="search-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <input className="input" placeholder="Search frames, tags, notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button className="btn btn-primary" type="submit">Search</button>
              {(search || tag) && <button className="btn btn-ghost" type="button" onClick={clearFilters}>Reset</button>}
            </form>
          </div>
          <div>
            <div className="hero-stats">
              <div><b>{count}</b><span>Frames filed</span></div>
              <div><b>{tags.length || '—'}</b><span>Active tags</span></div>
              <div><b>35mm</b><span>Native format</span></div>
            </div>
            <div className="popular">
              <span className="popular-label">On the shelf</span>
              {tags.slice(0, 6).map((t) => (
                <Link key={t.slug} className={`tag solid${tag === t.slug ? ' active' : ''}`} to={`/?tag=${encodeURIComponent(t.slug)}`}>#{t.name}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="filterbar">
        <span className="count"><b>{count}</b>&nbsp; {count === 1 ? 'frame' : 'frames'}</span>
        {tag && <span className="active-filter">#{tag}<button onClick={clearFilters} aria-label="Clear tag">×</button></span>}
        {search && <span className="active-filter">“{search}”<button onClick={clearFilters} aria-label="Clear search">×</button></span>}
        <span className="view-note">Contact sheet — Pg {page}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Skeletons /> : results.length === 0 ? (
        <Empty
          title={search || tag ? 'No frames on this shelf' : 'The walls are still bare'}
          hint={search || tag ? 'Loosen the query — fewer words find more photographs.' : 'Be the first to hang something. The darkroom is warm.'}
          action={<div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'center' }}><Link className="btn btn-accent" to="/upload">Publish a frame</Link>{(search || tag) && <button className="btn btn-ghost" onClick={clearFilters}>View everything</button>}</div>}
        />
      ) : (
        <>
          <div className="masonry">
            {results.map((p, i) => <PhotoCard key={p.id} photo={p} index={i} />)}
          </div>
          <div className="pager">
            {data.previous
              ? <button className="btn btn-ghost btn-sm" onClick={() => load(page - 1)}>← Prev</button>
              : <span />}
            <span className="page-no">— {String(page).padStart(2, '0')} —</span>
            {data.next && <button className="btn btn-ghost btn-sm" onClick={() => load(page + 1)}>Next →</button>}
          </div>
        </>
      )}
    </>
  );
}
