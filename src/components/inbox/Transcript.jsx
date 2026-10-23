export default function Transcript({ lines }) {
  if (!lines || lines.length === 0) {
    return <p className="muted small">No transcript turns available.</p>;
  }

  return (
    <div className="stack transcript-list">
      {lines.map((l, i) => (
        <article
          className="transcript-turn"
          key={i}
        >
          <div className="transcript-turn-head">
            {l.turnNumber && <span className="turn-number">Turn {l.turnNumber}</span>}
            <b>{l.speaker}</b>
            {l.time && <span className="small muted">{l.time}</span>}
          </div>
          <p>{l.text}</p>
        </article>
      ))}
    </div>
  );
}
