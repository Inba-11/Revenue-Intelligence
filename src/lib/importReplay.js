/**
 * importReplay.js — Ingest, normalise, and replay conversation batches.
 *
 * Rules (DATA_CONTRACT.md & ASSIGNMENT.md):
 *  - Record identity = `${source_type}::${source_id}` (never title, name or array index).
 *  - Unpacks envelope: { record_ref, source_type, source_id, payload, transcript_payload }.
 *  - Extracts calls (payload.transcript) and meetings (transcript_payload.turns).
 *  - Initial delivery revision = 1 (17 usable texts); update delivery revision = 2 (18 usable texts).
 *  - Revision 2 replaces matching revision 1 record; older revisions NEVER overwrite newer.
 *  - When transcript content changes on update (e.g. M07), analysis is marked stale.
 *  - Idempotent repeated imports: skips duplicate batch IDs without inflating metrics.
 *  - Manual route overrides are stored separately and preserved across replays.
 */

import { CONVERSATION_ANALYSIS_BY_KEY } from '../data/analysisData.js';

export function compositeKey(source_type, source_id) {
  return `${source_type}::${source_id}`;
}

/**
 * Format call transcript string into turns array for consistent UI rendering.
 */
function parseCallTranscript(text) {
  if (!text || typeof text !== 'string') return [];
  return [{
    speaker: 'Supplied call text (speakers not separated)',
    time: '',
    text: text.trim(),
    turnNumber: 1,
  }];
}

/**
 * Normalise raw envelope record into canonical internal shape.
 */
export function normaliseRecord(raw, batchId, envelopeRevision, importedAt) {
  const {
    record_ref = '',
    source_type = 'call',
    source_id = '',
    payload = {},
    transcript_payload = null,
  } = raw;

  const key = compositeKey(source_type, source_id);
  const revision = payload.revision || raw.revision || envelopeRevision || 1;

  // Determine person distinction: Call Rep vs Meeting Organiser
  const isCall = source_type === 'call';
  const repName = payload.rep_name || (isCall ? 'Unassigned Rep' : null);
  const repEmail = payload.rep_email || null;
  const organizerEmail = payload.organizer_email || null;
  const person = isCall ? repName : (organizerEmail || 'Unknown Organiser');

  // Dates & timings
  const date = payload.started_at || payload.starts_at || '';
  const durationSeconds = payload.duration_seconds || 0;
  const observedOutcome = payload.observed_outcome || payload.recording_status || 'recorded';

  // Usable Transcript turns extraction
  let turns = [];
  let hasTranscript = false;

  if (isCall) {
    if (payload.transcript && typeof payload.transcript === 'string' && payload.transcript.trim().length > 0) {
      turns = parseCallTranscript(payload.transcript);
      hasTranscript = true;
    }
  } else {
    const rawTurns = transcript_payload?.turns;
    if (Array.isArray(rawTurns)) {
      turns = rawTurns.flatMap((t, idx) => {
        if (typeof t?.text !== 'string' || !t.text.trim()) return [];
        return [{
          turnNumber: idx + 1, // Keep the source's 1-based turn reference.
          speaker: t.speaker || 'Speaker',
          time: t.timecode || '',
          seconds: t.starts_at_seconds ?? null,
          text: t.text,
        }];
      });
      hasTranscript = turns.length > 0;
    }
  }

  // Analysis is joined on the source identity pair, never on record_ref.
  const analysis = hasTranscript ? (CONVERSATION_ANALYSIS_BY_KEY[key] || null) : null;

  // Default title
  const defaultTitle = payload.title || (record_ref ? `${record_ref} — ${person}` : `(untitled ${source_type})`);

  // Initial suggested route & reasoning
  const suggestedRoute = analysis?.route || (hasTranscript ? 'Customer follow-up' : 'No action / Unusable');
  const routingReason = analysis?.summary
    ? 'Pre-generated route suggestion based on supplied conversation text.'
    : (hasTranscript ? 'Conversation text is available and needs review.' : 'No usable conversation text was supplied; this does not establish whether the interaction took place.');

  const summary = analysis?.summary || (
    hasTranscript
      ? 'Transcript available for review.'
      : `No usable conversation text was supplied. Source-reported status: ${observedOutcome}. This does not establish whether the interaction took place.${transcript_payload?.unavailable_reason ? ` Source note: ${transcript_payload.unavailable_reason}` : ''}`
  );

  return {
    key,
    record_ref,
    source_type,
    source_id,
    revision,
    title: defaultTitle,
    person,
    repName,
    repEmail,
    organizerEmail,
    date,
    durationSeconds,
    observedOutcome,
    summary,
    evidence: analysis?.evidence || [],
    unestablished: analysis?.unestablished || (hasTranscript ? '' : 'No conversation text was supplied; this does not establish whether the interaction took place.'),
    dataWarnings: analysis?.warnings || [],
    nextActions: analysis?.nextActions || [],
    issues: analysis?.issues || [], // Multi-issue modeling (e.g. M07)
    suggestedRoute,
    routingReason,
    transcript: turns,
    hasTranscript,
    rawTranscript: isCall ? (payload.transcript || '') : '',
    batchId,
    importedAt,
    status: hasTranscript ? 'New' : 'Unusable text',
    priority: !hasTranscript
      ? 'Unassessed'
      : (analysis?.route === 'Support escalation' ? 'High' : 'Medium'),
    analysisStale: false,
    rawPayload: payload,
    rawTranscriptPayload: transcript_payload,
  };
}

/** Refresh derived analysis fields from the current bundled analysis data while preserving manager review state. */
export function refreshStoredRecord(record) {
  if (!record?.rawPayload || !record?.source_type || !record?.source_id) return record;
  const refreshed = normaliseRecord({
    record_ref: record.record_ref,
    source_type: record.source_type,
    source_id: record.source_id,
    payload: record.rawPayload,
    transcript_payload: record.rawTranscriptPayload,
  }, record.batchId, record.revision, record.importedAt);
  const autoStatus = ['New', 'Unusable text'].includes(record.status);
  return {
    ...refreshed,
    status: autoStatus ? (refreshed.hasTranscript ? 'New' : 'Unusable text') : record.status,
    analysisStale: !!record.analysisStale,
  };
}

/**
 * Apply a batch payload to the existing records map.
 * Handles deduplication, revision ordering, and stale detection.
 */
export function applyBatch(payload, currentRecords = {}, seenBatchIds = []) {
  const result = {
    records: { ...currentRecords },
    added: 0,
    updated: 0,
    skipped: 0,
    duplicate: false,
    error: null,
    batchId: null,
  };

  if (!payload || typeof payload !== 'object') {
    result.error = 'Invalid JSON payload — not an object.';
    return result;
  }

  const { batch_id, revision = 1, records: rawRecords } = payload;

  if (!batch_id) {
    result.error = 'Payload missing batch_id.';
    return result;
  }
  result.batchId = batch_id;

  // Idempotent duplicate batch protection
  if (seenBatchIds.includes(batch_id)) {
    result.duplicate = true;
    result.error = `Batch "${batch_id}" already imported — skipped (idempotent).`;
    return result;
  }

  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    result.error = `Batch "${batch_id}" contains no records array.`;
    return result;
  }

  const importedAt = new Date().toISOString();

  for (const raw of rawRecords) {
    if (!raw.source_type || !raw.source_id) {
      result.skipped++;
      continue;
    }

    const incoming = normaliseRecord(raw, batch_id, revision, importedAt);
    const existing = result.records[incoming.key];

    if (!existing) {
      result.records[incoming.key] = incoming;
      result.added++;
      continue;
    }

    // Never let an older revision overwrite a newer one
    if (incoming.revision < existing.revision) {
      result.skipped++;
      continue;
    }

    // Same revision — skip (already up-to-date)
    if (incoming.revision === existing.revision) {
      result.skipped++;
      continue;
    }

    // Newer revision — replace entire source payload and transcript payload
    const transcriptChanged =
      JSON.stringify(incoming.transcript) !== JSON.stringify(existing.transcript);

    result.records[incoming.key] = {
      ...incoming,
      // Carry forward UI-level review status if already user-modified
      status: ['New', 'Unusable text'].includes(existing.status)
        ? (incoming.hasTranscript ? 'New' : 'Unusable text')
        : existing.status,
      // If transcript changed, mark analysis stale/pending review
      analysisStale: transcriptChanged,
    };
    result.updated++;
  }

  return result;
}

/**
 * Replay an array of import entries from scratch.
 */
export function replayAll(importHistory) {
  let records = {};
  const seenBatchIds = [];

  for (const entry of importHistory) {
    if (!entry.payload) continue;
    const result = applyBatch(entry.payload, records, seenBatchIds);
    if (!result.duplicate && !result.error) {
      records = result.records;
      seenBatchIds.push(entry.batchId || entry.payload.batch_id);
    }
  }

  return records;
}
