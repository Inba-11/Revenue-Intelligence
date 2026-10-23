export default function BarList({ items }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return items.map((i) => (
    <div className="bar-row" key={i.label}>
      <span>{i.label}</span><div className="bar"><i style={{ width: `${(i.count / max) * 100}%` }} /></div><b>{i.count}</b>
    </div>
  ));
}
