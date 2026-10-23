import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import ImportDropzone from '../components/imports/ImportDropzone.jsx';
import ImportHistoryTable from '../components/imports/ImportHistoryTable.jsx';
import ReplayStatus from '../components/imports/ReplayStatus.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Imports() {
  const {
    importHistory,
    loadInitialBatch,
    loadUpdateBatch,
    loadAllDemoData,
    resetAll,
  } = useApp();

  return (
    <>
      <PageHeader
        title="Imports &amp; Replay History"
        subtitle="Import source batches, check revision handling, and confirm that manager decisions survive updates."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn"
              onClick={loadInitialBatch}
              title="Loads 01_initial.json (44 records, 17 usable texts)"
            >
              1. Load 01_initial.json
            </button>
            <button
              className="btn"
              onClick={loadUpdateBatch}
              title="Applies 02_update.json (M07 revision 2, 18th usable text)"
            >
              2. Load 02_update.json
            </button>
            {importHistory.length > 0 && (
              <button
                className="btn"
                style={{ color: '#dc2626' }}
                onClick={() => {
                  if (window.confirm('Clear all imported data and reset to empty?')) {
                    resetAll();
                  }
                }}
              >
                Clear all data
              </button>
            )}
          </div>
        }
      />

      {/* Manual file upload dropzones */}
      <div className="grid two">
        <ImportDropzone
          kind="Initial Delivery (01_initial.json)"
          description="Upload the initial 44-record dataset containing 17 usable conversation texts."
        />
        <ImportDropzone
          kind="Update Delivery (02_update.json)"
          description="Upload revision 2 updates (e.g. M07 late transcript arrival). Merged safely without duplicating records."
        />
      </div>

      {/* Replay History Table */}
      <div className="grid two" style={{ marginTop: 16 }}>
        <Card title={`Import History (${importHistory.length} batches)`} flush>
          {importHistory.length > 0 ? (
            <ImportHistoryTable rows={importHistory} />
          ) : (
            <EmptyState
              title="No imports yet"
              text="Upload a JSON file above or click 'Load 01_initial.json' to start."
            />
          )}
        </Card>

        <Card title="Batch Execution Sequence">
          {importHistory.length > 0 ? (
            <ReplayStatus steps={[...importHistory].reverse()} />
          ) : (
            <EmptyState
              title="No replay history"
              text="Imported batches will appear here in chronological order."
            />
          )}
        </Card>
      </div>
    </>
  );
}
