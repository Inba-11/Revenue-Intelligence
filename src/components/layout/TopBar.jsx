import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

export default function TopBar() {
  const { setNavOpen, navOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get('q') || '');

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    const queryString = params.toString();
    navigate(`/inbox${queryString ? `?${queryString}` : ''}`);
  }

  return (
    <header className="topbar">
      <button className="btn sm menu-btn" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation" aria-expanded={navOpen}>
        <span aria-hidden="true">☰</span><span className="menu-label">Menu</span>
      </button>
      <form className="top-search" role="search" onSubmit={submitSearch}>
        <input
          className="input"
          type="search"
          placeholder="Search records, people, or transcript text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search records"
        />
        <button className="btn sm" type="submit">Search</button>
      </form>
      <span className="spacer" />
      <button className="btn sm" onClick={() => navigate('/imports')}>Import data</button>
      <div className="avatar" title="Manager workspace" aria-label="Manager workspace">M</div>
    </header>
  );
}
