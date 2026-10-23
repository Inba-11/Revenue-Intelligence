import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

const LINKS = [['/', 'Dashboard'], ['/inbox', 'Inbox'], ['/imports', 'Imports'], ['/exports', 'Exports']];

export default function Sidebar() {
  const { navOpen } = useApp();
  return (
    <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark">RI</span>Revenue Intelligence</div>
      <nav className="nav" aria-label="Main">
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
        ))}
      </nav>
    </aside>
  );
}
