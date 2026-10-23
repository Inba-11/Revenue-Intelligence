import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, ROUTES, STATUSES } from '../context/AppContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import BarList from '../components/dashboard/BarList.jsx';
import PriorityList from '../components/dashboard/PriorityList.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { computeMetrics } from '../lib/metrics.js';
import { MANAGER_BRIEF_2026_08_21 } from '../data/analysisData.js';

const LOCAL_DATE = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
});

function inboxUrl(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') query.set(key, value);
  });
  const queryString = query.toString();
  return `/inbox${queryString ? `?${queryString}` : ''}`;
}

function recordUrl(record) {
  return record ? `/inbox/${encodeURIComponent(record.key)}` : '/inbox';
}

function personLink(person, sourceType) {
  return inboxUrl({ source_type: sourceType, person });
}

function dayLabel(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? LOCAL_DATE.format(date) : 'Date unavailable';
}

export default function Dashboard() {
  const { conversations, records, overrides, activity } = useApp();
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [selectedSourceType, setSelectedSourceType] = useState('all');

  if (conversations.length === 0) {
    return (
      <>
        <PageHeader
          title="Manager dashboard"
          subtitle="Review selected customer activity, evidence, and follow-up priorities."
        />
        <EmptyState
          title="No source records loaded"
          text="Import a source batch to populate your dashboard. The supplied initial and update batches are ready on the Imports page."
          action={<Link className="btn primary" to="/imports">Open imports</Link>}
        />
      </>
    );
  }

  const people = [...new Set(conversations
    .filter((record) => selectedSourceType === 'all' || record.source_type === selectedSourceType)
    .map((record) => record.person)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const filteredConversations = conversations.filter((record) => (
    (selectedSourceType === 'all' || record.source_type === selectedSourceType)
    && (selectedPerson === 'all' || record.person === selectedPerson)
  ));

  const filteredRecords = Object.fromEntries(
    filteredConversations.map((record) => [record.key, records[record.key]]),
  );
  const viewMetrics = computeMetrics(filteredRecords, overrides);

  const hasFilters = selectedPerson !== 'all' || selectedSourceType !== 'all';
  const dayGroups = Object.values(filteredConversations.reduce((groups, record) => {
    const label = dayLabel(record.date);
    if (!groups[label]) groups[label] = { label, total: 0, call: 0, meeting: 0 };
    groups[label].total += 1;
    groups[label][record.source_type] = (groups[label][record.source_type] || 0) + 1;
    return groups;
  }, {})).sort((a, b) => a.label.localeCompare(b.label));

  const statusItems = STATUSES.map((status) => ({ label: status, count: viewMetrics.byStatus[status] || 0 }));
  const routeItems = ROUTES.map((route) => ({ label: route, count: viewMetrics.byRoute[route] || 0 }));
  const repList = Object.values(viewMetrics.callReps || {}).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const orgList = Object.values(viewMetrics.meetingOrganizers || {}).sort((a, b) => b.total - a.total || a.email.localeCompare(b.email));
  const priorityItems = filteredConversations.filter((record) => record.priority === 'High');

  return (
    <>
      <PageHeader
        title="Manager dashboard"
        subtitle="Selected source activity for 21 August 2026 · Asia/Kolkata"
        actions={(
          <div className="row">
            <Link className="btn" to="/imports">Manage imports</Link>
            <Link className="btn primary" to={inboxUrl({ source_type: selectedSourceType, person: selectedPerson })}>
              Open inbox <span className="btn-count">{filteredConversations.length}</span>
            </Link>
          </div>
        )}
      />

      <section className="dashboard-filters card" aria-label="Dashboard filters">
        <div className="filter-copy">
          <strong>Filter this view</strong>
          <span className="small muted">Counts and activity below update to match.</span>
        </div>
        <label className="filter-control">
          <span>Source</span>
          <select
            className="select"
            value={selectedSourceType}
            onChange={(event) => {
              setSelectedSourceType(event.target.value);
              setSelectedPerson('all');
            }}
          >
            <option value="all">All sources</option>
            <option value="call">Calls</option>
            <option value="meeting">Meetings</option>
          </select>
        </label>
        <label className="filter-control">
          <span>Person</span>
          <select className="select" value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
            <option value="all">All people</option>
            {people.map((person) => <option key={person} value={person}>{person}</option>)}
          </select>
        </label>
        {hasFilters && (
          <button className="btn quiet" onClick={() => { setSelectedSourceType('all'); setSelectedPerson('all'); }}>
            Clear filters
          </button>
        )}
      </section>

      <div className="grid kpis">
        <KpiCard
          label={hasFilters ? 'Selected records' : 'Total records'}
          value={viewMetrics.total}
          note={`${viewMetrics.bySourceType.call} calls · ${viewMetrics.bySourceType.meeting} meeting records`}
        />
        <KpiCard
          label="Usable text coverage"
          value={`${viewMetrics.usableCount} / ${viewMetrics.usableDenominator}`}
          note={`${viewMetrics.usablePct}% · ${viewMetrics.unusableText} without usable text`}
        />
        <KpiCard
          label="Needs review"
          value={viewMetrics.awaitingReview}
          note="New or in review; excludes records without usable text"
        />
        <KpiCard
          label="High priority"
          value={viewMetrics.highPriority}
          note="Selected records marked high priority"
        />
      </div>

      {viewMetrics.stale > 0 && (
        <div className="notice notice-warning" role="status">
          <div>
            <strong>{viewMetrics.stale} record{viewMetrics.stale === 1 ? '' : 's'} need analysis review.</strong>
            <span>The source text changed in a later delivery. Check the updated transcript before relying on its analysis.</span>
          </div>
          <Link className="btn sm" to={recordUrl(filteredConversations.find((record) => record.analysisStale))}>Review record</Link>
        </div>
      )}

      <div className="grid two dashboard-top-grid">
        <Card title="Activity by day" subtitle="Source timestamps grouped in Asia/Kolkata">
          {dayGroups.length ? (
            <div className="day-activity-list">
              {dayGroups.map((day) => {
                const max = Math.max(day.call, day.meeting, 1);
                return (
                  <div className="day-activity" key={day.label}>
                    <div className="day-heading">
                      <strong>{day.label}</strong>
                      <span>{day.total} selected records</span>
                    </div>
                    {['call', 'meeting'].map((sourceType) => (
                      <Link
                        className="day-source-row"
                        key={sourceType}
                        to={inboxUrl({ source_type: sourceType, person: selectedPerson })}
                      >
                        <span>{sourceType === 'call' ? 'Calls' : 'Meetings'}</span>
                        <span className="bar"><i style={{ width: `${(day[sourceType] / max) * 100}%` }} /></span>
                        <strong>{day[sourceType]}</strong>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : <p className="muted small">No dated records match the current filters.</p>}
        </Card>

        <Card title="Routing summary" subtitle="One active route is counted per source record">
          <BarList items={routeItems} />
          <p className="small muted chart-footnote">Route totals use the current filtered set and include the manager’s saved route overrides.</p>
        </Card>
      </div>

      <Card
        title={`Manager brief — ${MANAGER_BRIEF_2026_08_21.date} (${MANAGER_BRIEF_2026_08_21.timezone})`}
        subtitle="Pre-generated daily brief. It stays fixed while dashboard filters change."
        actions={<Badge tone="teal">Prepared from supplied records</Badge>}
      >
        <p className="brief-summary">{MANAGER_BRIEF_2026_08_21.summary}</p>
        <h3 className="section-label">Priority follow-ups</h3>
        <div className="stack brief-actions">
          {MANAGER_BRIEF_2026_08_21.priorityActionItems.map((item) => {
            const record = conversations.find((candidate) => candidate.record_ref === item.recordRef);
            return (
              <div key={item.recordRef} className={`brief-action urgency-${item.urgency.toLowerCase()}`}>
                <div className="brief-action-head">
                  {record ? <Link className="brief-target" to={recordUrl(record)}>{item.target}</Link> : <strong>{item.target}</strong>}
                  <Badge tone={item.urgency === 'Immediate' ? 'danger' : item.urgency === 'High' ? 'warning' : undefined}>{item.urgency}</Badge>
                  <span className="small muted brief-owner">Owner: <strong>{item.owner}</strong></span>
                </div>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>

        <h3 className="section-label">Coaching observations</h3>
        <div className="grid two coaching-grid">
          {MANAGER_BRIEF_2026_08_21.coachingInsights.map((item) => (
            <div className="coaching-card" key={item.rep}>
              <strong>{item.rep}</strong>
              <p>{item.insight}</p>
              <div className="row evidence-links" aria-label={`Supporting records for ${item.rep}`}>
                <span className="small muted">Records:</span>
                {item.recordRefs.map((ref) => {
                  const record = conversations.find((candidate) => candidate.record_ref === ref);
                  return <Link key={ref} to={recordUrl(record)}>{ref}</Link>;
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid two">
        {(selectedSourceType === 'all' || selectedSourceType === 'call') && (
          <Card title="Call rep activity" subtitle="Call records attributed to the source rep field; counts are not performance rankings">
            {repList.length ? (
              <div className="table-wrap"><table className="compact-table">
                <thead><tr><th>Rep</th><th>Calls</th><th>With text</th><th>Source outcomes</th></tr></thead>
                <tbody>{repList.map((rep) => (
                  <tr key={rep.name}>
                    <td><Link className="table-link" to={personLink(rep.name, 'call')}>{rep.name}</Link></td>
                    <td>{rep.total}</td>
                    <td>{rep.usable} / {rep.total}</td>
                    <td className="small muted">{Object.entries(rep.outcomes).map(([outcome, count]) => `${outcome}: ${count}`).join(' · ')}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : <p className="muted small">No call records match this person filter.</p>}
          </Card>
        )}

        {(selectedSourceType === 'all' || selectedSourceType === 'meeting') && (
          <Card title="Meeting organizer activity" subtitle="Organizer is source metadata, not a confirmed presenter or salesperson">
            {orgList.length ? (
              <div className="table-wrap"><table className="compact-table">
                <thead><tr><th>Organizer</th><th>Meeting records</th><th>With text</th></tr></thead>
                <tbody>{orgList.map((organizer) => (
                  <tr key={organizer.email}>
                    <td><Link className="table-link" to={personLink(organizer.email, 'meeting')}>{organizer.email}</Link></td>
                    <td>{organizer.total}</td>
                    <td>{organizer.usable} / {organizer.total}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : <p className="muted small">No meeting records match this person filter.</p>}
          </Card>
        )}
      </div>

      <div className="grid two">
        <Card title="Review states" subtitle="Each source record has one intake state">
          <BarList items={statusItems} />
        </Card>
        <Card title="High-priority records" actions={<Link className="small" to={inboxUrl({ source_type: selectedSourceType, person: selectedPerson, priority: 'High' })}>View in inbox</Link>}>
          <PriorityList items={priorityItems} />
        </Card>
        <Card title="Recent workspace activity">
          <ActivityFeed items={activity} />
        </Card>
      </div>
    </>
  );
}
