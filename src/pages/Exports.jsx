import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import ExportGroupCard from '../components/exports/ExportGroupCard.jsx';
import ManifestPanel from '../components/exports/ManifestPanel.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Link } from 'react-router-dom';

export default function Exports() {
  const { exportGroups, doGenerateAll, doDownloadManifest, conversations } = useApp();

  if (conversations.length === 0) {
    return (
      <>
        <PageHeader
          title="Exports &amp; Manifest"
          subtitle="Download the current source records and a machine-readable manifest after importing data."
        />
        <EmptyState
          title="No conversations to export"
          text="Import a source batch first. The supplied initial and update batches are ready on the Imports page."
          action={<Link className="btn primary" to="/imports">Go to Imports</Link>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Exports &amp; Machine-Readable Manifest"
        subtitle="A single ZIP contains one JSON file per active route and a manifest.json with a relative path for every record."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" type="button" onClick={doDownloadManifest}>
              Download manifest.json
            </button>
            <button className="btn primary" type="button" onClick={doGenerateAll}>
              Download complete export (.zip)
            </button>
          </div>
        }
      />

      {/* Export Group Cards */}
      <div className="grid kpis">
        {exportGroups.map((g) => (
          <ExportGroupCard key={g.route} group={g} />
        ))}
      </div>

      {/* Manifest Overview Panel */}
      <Card
        title="Export Manifest Overview"
        subtitle="Active route files and record counts that will be included in the next ZIP export"
        flush
      >
        <ManifestPanel groups={exportGroups} />
      </Card>
    </>
  );
}
