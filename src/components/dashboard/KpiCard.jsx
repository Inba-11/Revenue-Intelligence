export default function KpiCard({ label, value, note }) {
  return <div className="card kpi"><div className="label">{label}</div><div className="num">{value}</div><div className="delta">{note}</div></div>;
}
