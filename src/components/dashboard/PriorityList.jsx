import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';

export default function PriorityList({ items }) {
  return (
    <ul className="list">
      {items.map((c) => (
        <li key={c.key || c.id}>
          <div>
            <Link to={`/inbox/${encodeURIComponent(c.key || c.id)}`}>
              <b>{c.title || c.source_id}</b>
            </Link>
            <div className="small muted">{c.account} · {c.route}</div>
          </div>
          <Badge>{c.priority}</Badge>
        </li>
      ))}
    </ul>
  );
}
