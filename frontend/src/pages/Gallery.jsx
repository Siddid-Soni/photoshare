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

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listPhotos({ page: p, search, tag });
      setData(res);
      setPage(p);
      if (append) { /* paginated replace is fine; DRF pages */ }
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
      <section className="hero">
        <h1>Discover and share <span>extraordinary photos</span></h1>
        <p>Upload your best shots, tag them for discovery, and keep private work visible only to you. Search across descriptions and tags.</p>
        <form className="search-row" onSubmit={submitSearch}>
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input className="input" placeholder="Search photos, tags, descriptions…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Search</button>
          {(search || tag) && <button className="btn btn-ghost" type="button" onClick={clearFilters}>Clear</button>}
        </form>
        <div className="popular">
          <span>Popular:</span>
          {tags.slice(0, 8).map((t) => (
            <Link key={t.slug} className="tag solid" to={`/?tag=${encodeURIComponent(t.slug)}`}>#{t.name}</Link>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <span className="count">
          {tag ? <>Tagged <b>#{tag}</b> · </> : null}
          {search ? <>Results for <b>“{search}”</b> · </> : null}
          <b>{count}</b> {count === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Skeletons /> : results.length === 0 ? (
        <Empty
          title={search || tag ? 'No matches found' : 'No photos yet'}
          hint={search || tag ? 'Try fewer keywords or browse everything.' : 'Upload the first photo to start your gallery.'}
          action={<div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}><Link className="btn btn-primary" to="/upload">Upload a photo</Link>{(search || tag) && <button className="btn btn-ghost" onClick={clearFilters}>Show all</button>}</div>}
        />
      ) : (
        <>
          <div className="masonry">
            {results.map((p) => <PhotoCard key={p.id} photo={p} />)}
          </div>
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
