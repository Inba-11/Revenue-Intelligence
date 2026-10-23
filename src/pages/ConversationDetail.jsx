import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import useDialog from '../hooks/useDialog.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Transcript from '../components/inbox/Transcript.jsx';
import RouteOverrideDialog from '../components/inbox/RouteOverrideDialog.jsx';
import { formatLocalDateTime, formatSourceDuration } from '../lib/dateFormat.js';

export default function ConversationDetail() {
  const { id: rawId } = useParams();
  const id = decodeURIComponent(rawId || '');
  const {
    conversations, overrides, actionChecks, overrideRoute, resetRouteOverride,
    toggleAction, updateStatus, notify,
  } = useApp();
  const dialog = useDialog();

  // Find record by key (source_type::source_id), source_id, or record_ref
  const c = conversations.find(
    (x) => x.id === id || x.key === id || x.source_id === id || x.record_ref === id
  );

  if (!c) {
    return (
      <EmptyState
        title="Conversation not found"
        text="The requested record has not been imported yet or the reference is invalid."
        action={<Link className="btn" to="/inbox">Back to Inbox</Link>}
      />
    );
  }

  const isOverridden = !!(overrides[c.key]?.route);
  const overrideInfo = overrides[c.key];

  const statusBtnLabel = c.status === 'Routed' ? 'Reopen for Review' : 'Mark as Routed';
  const nextStatus = c.status === 'Routed' ? 'In review' : 'Routed';

  return (
    <>
      <PageHeader
        title={c.title}
        crumb={<Link className="crumb" to="/inbox">← Back to Inbox</Link>}
        subtitle={[
          c.record_ref ? `Ref: ${c.record_ref}` : null,
          c.source_type === 'call' ? `Rep: ${c.person}` : `Organiser: ${c.person}`,
          c.source_type,
          formatSourceDuration(c.durationSeconds),
          c.date ? formatLocalDateTime(c.date) : null,
        ].filter(Boolean).join(' · ')}
        actions={
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <Badge tone={c.source_type === 'meeting' ? 'teal' : undefined}>{c.source_type}</Badge>
            <Badge tone={c.status === 'Routed' ? 'teal' : undefined}>{c.status}</Badge>
            <Badge tone={c.priority === 'High' ? 'danger' : undefined}>{c.priority}</Badge>
            {c.analysisStale && (
              <Badge tone="warning">⚠️ Analysis Stale</Badge>
            )}
            <button
              className="btn primary"
              onClick={() => {
                updateStatus(c.key, nextStatus);
                notify(`Status updated to "${nextStatus}"`);
              }}
            >
              {statusBtnLabel}
            </button>
          </div>
        }
      />

      {/* Stale Warning Banner */}
      {c.analysisStale && (
        <div className="notice notice-warning" role="status">
          <div>
            <strong>Analysis needs review after a source update.</strong>
            <span>The current transcript arrived in revision {c.revision}. The pre-generated summary and route may not reflect every detail; inspect the updated text before relying on them.</span>
          </div>
        </div>
      )}

      {c.dataWarnings?.length > 0 && (
        <div className="notice notice-info" role="note">
          <div>
            <strong>Source data needs attention</strong>
            {c.dataWarnings.map((warning) => <span key={warning}>{warning}</span>)}
          </div>
        </div>
      )}

      <div className="grid detail">
        {/* Left Column: Analysis, Citations, Issues, Transcript */}
        <div className="stack">
          {/* Summary */}
          <Card title="What Happened &amp; Why It Matters">
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
              {c.summary}
            </p>
            <div className="small muted" style={{ marginTop: 12 }}>
              Record Ref: <strong>{c.record_ref || 'N/A'}</strong> · Applied Revision: <strong>{c.revision}</strong> · Source ID: <code>{c.source_id}</code>
            </div>
          </Card>

          {/* Citations & Evidence */}
          <Card title="Transcript evidence" subtitle="Meeting turns use source turn numbers; call evidence uses exact text quotes.">
            {c.evidence && c.evidence.length > 0 ? (
              <div className="stack" style={{ gap: 8 }}>
                {c.evidence.map((quote, idx) => (
                  <div
                    key={idx}
                    className="quote"
                    style={{
                      background: 'var(--surface-soft)',
                      borderLeft: '3px solid #0284c7',
                      padding: '8px 12px',
                      fontSize: 13,
                      lineHeight: 1.5,
                      borderRadius: 4,
                    }}
                  >
                    {quote}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small">
                {c.hasTranscript ? 'No specific quotes flagged.' : 'No conversation text was supplied in source data.'}
              </p>
            )}
          </Card>

          {/* What Evidence Does NOT Establish */}
          {c.unestablished && (
            <Card title="What The Evidence Does NOT Establish">
              <div
                style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 6,
                  borderLeft: '3px solid #64748b',
                  fontSize: 13,
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                ℹ️ {c.unestablished}
              </div>
            </Card>
          )}

          {/* Multi-Issue Modeling (Specially for M07) */}
          {c.issues && c.issues.length > 0 && (
            <Card
              title="Reported customer issues"
              subtitle="These reports are not independently verified root causes."
            >
              <div className="stack" style={{ gap: 10 }}>
                {c.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="card card-body"
                    style={{
                      padding: '10px 14px',
                      background: issue.status.includes('Workaround') ? 'var(--green-soft)' : 'var(--amber-soft)',
                      borderLeft: `4px solid ${issue.status.includes('Workaround') ? 'var(--green)' : 'var(--amber)'}`,
                    }}
                  >
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{issue.id}: {issue.title}</strong>
                      <Badge tone={issue.status.includes('Workaround') ? 'green' : 'warning'}>
                        {issue.status}
                      </Badge>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                      {issue.details}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Transcript Viewer */}
          <Card
            title={c.source_type === 'meeting' ? `Meeting transcript (${c.transcript.length} turns)` : 'Supplied call text'}
            actions={
              c.hasTranscript ? <Badge tone="teal">Usable text</Badge> : <Badge tone="warning">No text</Badge>
            }
          >
            {c.hasTranscript ? (
              <Transcript lines={c.transcript} />
            ) : (
              <div className="stack" style={{ textAlign: 'center', padding: '24px 0' }}>
                <p className="muted" style={{ margin: 0 }}>
                  No usable conversation text was supplied for this {c.source_type}. That does not confirm whether the interaction took place.
                </p>
                <div className="small muted source-status-note">
                  Source-reported status: <code>{c.observedOutcome}</code>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Route, Actions, Metadata */}
        <div className="stack">
          {/* Effective Route */}
          <Card title="Route decision" actions={<button className="btn sm" type="button" onClick={dialog.show}>Change route</button>}>
            <div className="stack" style={{ gap: 8 }}>
              <div className="route-current">
                <span className="small muted">Current route</span>
                <Badge tone={isOverridden ? 'purple' : (c.route === 'Support escalation' ? 'warning' : 'teal')}>{c.route}</Badge>
                {isOverridden && <span className="small muted">Manager override</span>}
              </div>
              <div className="route-suggestion">
                <span className="small muted">Suggested route</span>
                <strong>{c.routingSuggestion?.route || c.route}</strong>
              </div>
              <p className="small muted" style={{ margin: '4px 0 0', lineHeight: 1.5 }}>
                <strong>Suggestion basis:</strong> {c.routingSuggestion?.reason || c.routingReason}
              </p>
              {isOverridden && (
                <div className="override-note">
                  <div className="small muted">Manager decision{overrideInfo?.changedAt ? ` · ${formatLocalDateTime(overrideInfo.changedAt)}` : ''}</div>
                  {overrideInfo?.reason ? <p>{overrideInfo.reason}</p> : <p className="muted">No reason was added.</p>}
                  <button className="btn sm quiet" type="button" onClick={() => resetRouteOverride(c.key)}>Restore suggestion</button>
                </div>
              )}
            </div>
          </Card>

          {/* Next Actions */}
          <Card title="Supported Next Actions">
            {c.nextActions && c.nextActions.length > 0 ? (
              <div className="stack action-list">
                {c.nextActions.map((actionText, idx) => (
                  <label className={`check action-check ${actionChecks[c.key]?.[actionText] ? 'done' : ''}`} key={idx}>
                    <input
                      type="checkbox"
                      checked={!!actionChecks[c.key]?.[actionText]}
                      onChange={() => toggleAction(c.key, actionText)}
                      aria-label={`Mark action complete: ${actionText}`}
                    />
                    <span>{actionText}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="muted small">No next actions established in this conversation.</p>
            )}
          </Card>

          {/* Provenance & Source Metadata */}
          <Card title="Source Provenance">
            <div className="stack small muted" style={{ gap: 6 }}>
              <div><strong>Record Ref:</strong> {c.record_ref || 'None'}</div>
              <div><strong>Source Type:</strong> {c.source_type}</div>
              <div><strong>Source ID:</strong> <code>{c.source_id}</code></div>
              <div><strong>Applied Revision:</strong> {c.revision}</div>
              <div><strong>{c.source_type === 'call' ? 'Rep listed in source' : 'Meeting organiser'}:</strong> {c.person}</div>
              <div><strong>Delivery Batch:</strong> {c.batchId}</div>
              <div><strong>Source time:</strong> {c.date ? formatLocalDateTime(c.date) : 'Not recorded'}</div>
              {c.durationSeconds > 0 && <div><strong>Source duration:</strong> {formatSourceDuration(c.durationSeconds)}{c.source_type === 'meeting' ? ' (not verified attendance time)' : ''}</div>}
              <div><strong>Source-reported status:</strong> {c.observedOutcome}</div>
            </div>
          </Card>
        </div>
      </div>

      <RouteOverrideDialog
        key={String(dialog.open) + c.route}
        open={dialog.open}
        current={c.route}
        onClose={dialog.hide}
        onSave={(newRoute, reason) => {
          overrideRoute(c.key, newRoute, reason);
          dialog.hide();
          notify(`Route manually set to "${newRoute}"`);
        }}
      />
    </>
  );
}
