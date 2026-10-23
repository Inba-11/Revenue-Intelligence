import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import { formatLocalDate, formatSourceDuration } from '../../lib/dateFormat.js';

export default function ConversationTable({ rows }) {
  return (
    <div className="table-wrap">
      <table className="conversation-table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Conversation / Person</th>
            <th>Source</th>
            <th>Usable Text</th>
            <th>Effective Route</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.key || c.id}>
              <td>
                <Link className={`record-ref ${c.source_type}`} to={`/inbox/${encodeURIComponent(c.key || c.id)}`}>
                  {c.record_ref || c.source_id.slice(0, 6)}
                </Link>
              </td>
              <td className="wrap">
                <Link className="record-title" to={`/inbox/${encodeURIComponent(c.key || c.id)}`}>{c.title}</Link>
                {c.analysisStale && (
                  <span className="inline-state state-warning" title="Analysis needs review after a later source update">
                    Needs review
                  </span>
                )}
                {c.isOverridden && (
                  <span className="inline-state state-override" title="Route manually overridden">
                    Manager override
                  </span>
                )}
                <div className="small muted">
                  {c.person ? `${c.source_type === 'call' ? 'Rep listed' : 'Organiser'}: ${c.person}` : ''}
                  {formatSourceDuration(c.durationSeconds) ? ` · ${formatSourceDuration(c.durationSeconds)}` : ''}
                  {c.date ? ` · ${formatLocalDate(c.date)}` : ''}
                  {c.revision > 1 ? ` · Rev ${c.revision}` : ''}
                </div>
              </td>
              <td>
                <Badge tone={c.source_type === 'meeting' ? 'teal' : undefined}>
                  {c.source_type}
                </Badge>
              </td>
              <td>
                {c.hasTranscript ? (
                  <span style={{ color: '#059669', fontSize: 13, fontWeight: 500 }}>
                    ✓ {c.source_type === 'meeting' ? `${c.transcript.length} turns` : 'Supplied call text'}
                  </span>
                ) : (
                  <span className="small muted">No usable speech</span>
                )}
              </td>
              <td>
                <Badge tone={c.isOverridden ? 'purple' : (c.route === 'Support escalation' ? 'warning' : 'teal')}>
                  {c.route}
                </Badge>
              </td>
              <td>
                <Badge tone={c.status === 'Routed' ? 'teal' : undefined}>
                  {c.status}
                </Badge>
              </td>
              <td>
                <Badge tone={c.priority === 'High' ? 'danger' : undefined}>
                  {c.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
