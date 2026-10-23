import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inbox from './pages/Inbox.jsx';
import ConversationDetail from './pages/ConversationDetail.jsx';
import Imports from './pages/Imports.jsx';
import Exports from './pages/Exports.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="inbox/:id" element={<ConversationDetail />} />
        <Route path="conversations/:id" element={<ConversationDetail />} />
        <Route path="imports" element={<Imports />} />
        <Route path="exports" element={<Exports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
