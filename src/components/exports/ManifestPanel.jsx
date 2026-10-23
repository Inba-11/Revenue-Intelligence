import Badge from '../ui/Badge.jsx';

export default function ManifestPanel({ groups }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Destination File</th>
            <th>Relative Export Path</th>
            <th>Route Category</th>
            <th>Assigned Records</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.file}>
              <td><strong>{g.file}</strong></td>
              <td><code>{g.outputPath || `exports/${g.file}`}</code></td>
              <td>{g.route}</td>
              <td><strong>{g.count}</strong> records</td>
              <td>
                <Badge tone={g.status === 'Needs review' ? 'warning' : 'teal'}>
                  {g.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
