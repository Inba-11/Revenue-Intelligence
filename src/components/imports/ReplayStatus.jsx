import Badge from '../ui/Badge.jsx';

export default function ReplayStatus({ steps }) {
  return (
    <ul className="timeline">
      {steps.map((s) => <li key={s.id}><div className="row"><b>{s.name}</b><Badge>{s.status}</Badge></div><div className="small muted">{s.records} records · {s.date}</div></li>)}
    </ul>
  );
}
