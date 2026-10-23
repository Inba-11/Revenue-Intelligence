import Badge from '../ui/Badge.jsx';

export default function ImportHistoryTable({ rows }) {
  return (
    <div className="table-wrap"><table>
      <thead><tr>
        <th>File / Batch</th>
        <th>Type</th>
        <th>Imported</th>
        <th>Records</th>
        <th>Added</th>
        <th>Updated</th>
        <th>Status</th>
      </tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.id}>
          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.name || r.batchId}</td>
          <td><Badge>{r.type}</Badge></td>
          <td>{r.date}</td>
          <td>{r.records}</td>
          <td style={{ color: 'var(--color-success, #16a34a)' }}>{r.added ?? '—'}</td>
          <td style={{ color: 'var(--color-warning-text, #d97706)' }}>{r.updated ?? '—'}</td>
          <td><Badge>{r.status}</Badge></td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}
