export default function EmptyState({ title, text, action }) {
  return <div className="empty"><h3>{title}</h3><p>{text}</p>{action && <div style={{ marginTop: 12 }}>{action}</div>}</div>;
}
