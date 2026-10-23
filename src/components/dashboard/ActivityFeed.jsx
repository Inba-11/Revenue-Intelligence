export default function ActivityFeed({ items }) {
  return <ul className="timeline">{items.map((a) => <li key={a.id}>{a.text}<div className="small muted">{a.time}</div></li>)}</ul>;
}
