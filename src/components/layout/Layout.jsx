import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function Layout() {
  const { toast, setNavOpen } = useApp();
  const { pathname } = useLocation();
  useEffect(() => setNavOpen(false), [pathname, setNavOpen]);
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <TopBar />
        <main className="content">
          <Outlet />
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
