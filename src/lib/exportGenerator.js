/**
 * Build route exports and a self-contained ZIP archive with a machine-readable
 * manifest. All paths in the manifest are relative to the archive root.
 */
import { effectiveRoute } from './routing.js';

const ROUTE_SLUGS = {
  'Deal next steps': 'deal-next-steps',
  'Customer follow-up': 'customer-follow-up',
  'Sales coaching': 'sales-coaching',
  'Support escalation': 'support-escalation',
  'Internal / vendor note': 'internal-vendor-note',
  'No action / Unusable': 'no-action-unusable',
};

const encoder = new TextEncoder();

function slug(route) {
  return ROUTE_SLUGS[route] || route.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function downloadBlob(content, filename, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function routePayload(group, exportedAt) {
  return {
    route: group.route,
    relative_path: group.outputPath,
    exported_at: exportedAt,
    record_count: group.count,
    conversations: group.records.map((record) => ({
      record_ref: record.record_ref,
      source_type: record.source_type,
      source_id: record.source_id,
      revision: record.revision,
      person: record.person,
      title: record.title,
      source_timestamp: record.date,
      source_reported_status: record.observedOutcome,
      status: record.status,
      priority: record.priority,
      summary: record.summary,
      evidence: record.evidence,
      data_warnings: record.dataWarnings || [],
      unestablished: record.unestablished,
      next_actions: record.nextActions,
      issues: record.issues,
      analysis_stale: record.analysisStale,
      has_transcript: record.hasTranscript,
      transcript_turns: record.transcript,
    })),
  };
}

/** Build per-route export groups from active records and manager overrides. */
export function buildExportGroups(records = {}, overrides = {}) {
  const grouped = {};
  for (const record of Object.values(records)) {
    const route = effectiveRoute(record, overrides);
    if (!grouped[route]) grouped[route] = [];
    grouped[route].push(record);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([route, routeRecords]) => {
      const sortedRecords = routeRecords.sort((a, b) => (
        (a.record_ref || '').localeCompare(b.record_ref || '')
        || a.source_type.localeCompare(b.source_type)
        || a.source_id.localeCompare(b.source_id)
      ));
      const filename = `${slug(route)}.json`;
      return {
        route,
        file: filename,
        outputPath: `exports/${filename}`,
        count: sortedRecords.length,
        status: sortedRecords.some((record) => record.analysisStale) ? 'Needs review' : 'Ready',
        records: sortedRecords,
      };
    });
}

function buildManifest(records, overrides, groups, generatedAt) {
  const groupByRoute = new Map(groups.map((group) => [group.route, group]));
  const sortedRecords = Object.values(records).sort((a, b) => (
    (a.record_ref || '').localeCompare(b.record_ref || '')
    || a.source_type.localeCompare(b.source_type)
    || a.source_id.localeCompare(b.source_id)
  ));

  return {
    manifest_version: '1.0',
    generated_at: generatedAt,
    total_records: sortedRecords.length,
    active_output_files: groups.map((group) => ({
      route: group.route,
      relative_file_path: group.outputPath,
      record_count: group.count,
      status: group.status,
    })),
    records: sortedRecords.map((record) => {
      const route = effectiveRoute(record, overrides);
      const override = overrides[record.key];
      const group = groupByRoute.get(route);
      return {
        record_ref: record.record_ref,
        source_type: record.source_type,
        source_id: record.source_id,
        applied_source_revision: record.revision,
        routes: [route],
        output_paths: [group?.outputPath || `exports/${slug(route)}.json`],
        processing_state: record.status || 'New',
        manual_override: !!override?.route,
        manual_override_reason: override?.reason || null,
        analysis_freshness: record.analysisStale ? 'Needs review after a source update' : 'Current',
        has_usable_transcript: record.hasTranscript,
      };
    }),
  };
}

/** Download one active route export as a standalone JSON file. */
export function downloadGroup(group) {
  const generatedAt = new Date().toISOString();
  downloadBlob(JSON.stringify(routePayload(group, generatedAt), null, 2), group.file);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function buildZip(files) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  const stamp = dosDateTime(new Date());

  for (const file of files) {
    const name = encoder.encode(file.path);
    const data = encoder.encode(file.content);
    const checksum = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, stamp.time, true);
    localView.setUint16(12, stamp.day, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    localParts.push(local);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, stamp.time, true);
    centralView.setUint16(14, stamp.day, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    central.set(name, 46);
    centralParts.push(central);
    localOffset += local.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  const parts = [...localParts, ...centralParts, end];
  const archive = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    archive.set(part, offset);
    offset += part.length;
  }
  return archive;
}

/** Download all route JSON files and manifest together in one ZIP archive. */
export function generateAllExports(records = {}, overrides = {}) {
  const groups = buildExportGroups(records, overrides);
  const generatedAt = new Date().toISOString();
  const manifest = buildManifest(records, overrides, groups, generatedAt);
  const files = groups.map((group) => ({
    path: group.outputPath,
    content: JSON.stringify(routePayload(group, generatedAt), null, 2),
  }));
  files.push({ path: 'manifest.json', content: JSON.stringify(manifest, null, 2) });
  downloadBlob(buildZip(files), 'revenue-intelligence-exports.zip', 'application/zip');
  return groups;
}

/** Download the current manifest on its own. */
export function downloadManifest(records = {}, overrides = {}) {
  const groups = buildExportGroups(records, overrides);
  const manifest = buildManifest(records, overrides, groups, new Date().toISOString());
  downloadBlob(JSON.stringify(manifest, null, 2), 'manifest.json');
}
