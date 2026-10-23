import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConversationFilters from '../components/inbox/ConversationFilters.jsx';
import ConversationTable from '../components/inbox/ConversationTable.jsx';

const EMPTY = {
  q: '',
  source_type: '',
  person: '',
  transcriptState: '',
  route: '',
  status: '',
  priority: '',
};

function filtersFromSearch(search) {
  const params = new URLSearchParams(search);
  return {
    ...EMPTY,
    q: params.get('q') || '',
    source_type: params.get('source_type') || '',
    person: params.get('person') || '',
    transcriptState: params.get('transcriptState') || '',
    route: params.get('route') || '',
    status: params.get('status') || '',
    priority: params.get('priority') || '',
  };
}

export default function Inbox() {
  const { conversations, loadAllDemoData } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(() => filtersFromSearch(location.search));

  useEffect(() => {
    setFilters(filtersFromSearch(location.search));
  }, [location.search]);

  const people = useMemo(() => [...new Set(conversations
    .filter((record) => !filters.source_type || record.source_type === filters.source_type)
    .map((record) => record.person)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b)), [conversations, filters.source_type]);

  const rows = useMemo(() => {
    const q = filters.q.toLowerCase().trim();

    return conversations.filter((c) => {
      // Search term
      if (q) {
        const hay = [
          c.record_ref,
          c.title,
          c.person,
          c.source_id,
          c.source_type,
          c.summary,
          c.transcript?.map((turn) => turn.text).join(' '),
          c.evidence?.join(' '),
        ].filter(Boolean).join(' ').toLowerCase();

        if (!hay.includes(q)) return false;
      }

      // Source type
      if (filters.source_type && c.source_type !== filters.source_type) {
        return false;
      }

      if (filters.person && c.person !== filters.person) return false;

      // Usable transcript coverage
      if (filters.transcriptState) {
        if (filters.transcriptState === 'Has transcript' && !c.hasTranscript) return false;
        if (filters.transcriptState === 'No speech / Unusable' && c.hasTranscript) return false;
      }

      // Route
      if (filters.route && c.route !== filters.route) return false;

      // Status
      if (filters.status && c.status !== filters.status) return false;

      // Priority
      if (filters.priority && c.priority !== filters.priority) return false;

      return true;
    });
  }, [conversations, filters]);

  if (conversations.length === 0) {
    return (
      <>
        <PageHeader title="Inbox" subtitle="No conversations imported yet." />
        <EmptyState
          title="Inbox is empty"
          text="Upload an initial JSON export on the Imports page or load the demo dataset to get started."
          action={
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary" onClick={loadAllDemoData}>
                Load Demo Dataset
              </button>
              <Link className="btn" to="/imports">
                Go to Imports
              </Link>
            </div>
          }
        />
      </>
    );
  }

  const usableCount = rows.filter((r) => r.hasTranscript).length;

  return (
    <>
      <PageHeader
        title="Revenue Intelligence Inbox"
        subtitle={`Showing ${rows.length} of ${conversations.length} source records · ${usableCount} with usable text`}
      />
      <Card flush>
        <ConversationFilters
          filters={filters}
          people={people}
          onChange={setFilters}
          onClear={() => {
            setFilters(EMPTY);
            navigate('/inbox', { replace: true });
          }}
        />
        {rows.length > 0 ? (
          <ConversationTable rows={rows} />
        ) : (
          <EmptyState
            title="No conversations match your filters"
            text="Try adjusting or clearing your search criteria."
            action={
              <button className="btn" onClick={() => {
                setFilters(EMPTY);
                navigate('/inbox', { replace: true });
              }}>
                Reset filters
              </button>
            }
          />
        )}
      </Card>
    </>
  );
}
