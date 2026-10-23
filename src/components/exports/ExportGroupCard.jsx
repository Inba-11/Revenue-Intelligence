import Badge from '../ui/Badge.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function ExportGroupCard({ group }) {
  const { doDownloadGroup } = useApp();
  return (
    <div className="card card-body stack export-card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{group.route}</h3>
        <Badge tone={group.status === 'Needs review' ? 'warning' : 'green'}>{group.status}</Badge>
      </div>
      <div>
        <span style={{ fontSize: 22, fontWeight: 600 }}>{group.count}</span>{' '}
        <span className="muted">conversation{group.count !== 1 ? 's' : ''}</span>
      </div>
      <div className="small muted export-meta">
        <code>{group.outputPath}</code><br />Included in the complete ZIP export.
      </div>
      <button className="btn" type="button" onClick={() => doDownloadGroup(group)}>
        Download this JSON
      </button>
    </div>
  );
}
