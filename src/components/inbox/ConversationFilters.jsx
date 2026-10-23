import { ROUTES, STATUSES, PRIORITIES } from '../../context/AppContext.jsx';

export default function ConversationFilters({ filters, people = [], onChange, onClear }) {
  const set = (k) => (e) => onChange({
    ...filters,
    [k]: e.target.value,
    ...(k === 'source_type' ? { person: '' } : {}),
  });
  const sel = (k, label, opts) => (
    <select className="select" value={filters[k]} onChange={set(k)} aria-label={label}>
      <option value="">{label}</option>
      {opts.map((o) => (
        <option key={o} value={o}>{o === 'call' ? 'Calls' : o === 'meeting' ? 'Meetings' : o}</option>
      ))}
    </select>
  );

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
      <input
        className="input"
        style={{ minWidth: 220 }}
        placeholder="Search reference, person, summary, or transcript"
        value={filters.q}
        onChange={set('q')}
        aria-label="Search"
      />
      {sel('source_type', 'All sources', ['call', 'meeting'])}
      <select className="select" value={filters.person} onChange={set('person')} aria-label="Filter by person">
        <option value="">All people</option>
        {people.map((person) => <option key={person} value={person}>{person}</option>)}
      </select>
      {sel('transcriptState', 'All transcript coverage', ['Has transcript', 'No speech / Unusable'])}
      {sel('route', 'All routes', ROUTES)}
      {sel('status', 'All statuses', STATUSES)}
      {sel('priority', 'All priorities', PRIORITIES)}
      {Object.values(filters).some(Boolean) && (
        <button className="btn quiet" type="button" onClick={onClear}>Clear filters</button>
      )}
    </div>
  );
}
