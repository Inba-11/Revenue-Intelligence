/**
 * metrics.js — Derive dashboard KPIs strictly from supplied data.
 *
 * Rules (ASSIGNMENT.md):
 *  - Usable supplied transcript coverage (with explicit denominator).
 *  - Selected-record activity by person and source-type.
 *  - Distinguishes Call Reps from Meeting Organisers.
 *  - Routing and review counts.
 *  - Does NOT invent pipeline value or ungrounded deal outcomes.
 */

import { effectiveRoute } from './routing.js';

export function computeMetrics(records = {}, overrides = {}) {
  const list = Object.values(records);

  if (list.length === 0) {
    return {
      total: 0,
      usableCount: 0,
      usableDenominator: 0,
      usablePct: 0,
      awaitingReview: 0,
      unusableText: 0,
      routed: 0,
      highPriority: 0,
      stale: 0,
      byRoute: {},
      byStatus: {},
      bySourceType: { call: 0, meeting: 0 },
      callReps: {},
      meetingOrganizers: {},
    };
  }

  const byRoute = {};
  const byStatus = {};
  const bySourceType = { call: 0, meeting: 0 };
  const callReps = {};
  const meetingOrganizers = {};

  let usableCount = 0;
  let awaitingReview = 0;
  let unusableText = 0;
  let routed = 0;
  let highPriority = 0;
  let stale = 0;

  for (const rec of list) {
    const route = effectiveRoute(rec, overrides);
    const status = rec.status || 'New';
    const isCall = rec.source_type === 'call';

    // Route & Status
    byRoute[route] = (byRoute[route] || 0) + 1;
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Source Type
    if (isCall) {
      bySourceType.call++;
      const rep = rec.person || rec.repName || 'Unassigned';
      if (!callReps[rep]) {
        callReps[rep] = { name: rep, total: 0, usable: 0, outcomes: {} };
      }
      callReps[rep].total++;
      if (rec.hasTranscript) callReps[rep].usable++;
      const out = rec.observedOutcome || 'unrecorded';
      callReps[rep].outcomes[out] = (callReps[rep].outcomes[out] || 0) + 1;
    } else {
      bySourceType.meeting++;
      const org = rec.organizerEmail || rec.person || 'Unknown Organiser';
      if (!meetingOrganizers[org]) {
        meetingOrganizers[org] = { email: org, total: 0, usable: 0 };
      }
      meetingOrganizers[org].total++;
      if (rec.hasTranscript) meetingOrganizers[org].usable++;
    }

    if (rec.hasTranscript) usableCount++;
    if (status === 'New' || status === 'In review') awaitingReview++;
    if (!rec.hasTranscript) unusableText++;
    if (status === 'Routed') routed++;
    if (rec.priority === 'High') highPriority++;
    if (rec.analysisStale) stale++;
  }

  const total = list.length;
  const usablePct = total > 0 ? Math.round((usableCount / total) * 100) : 0;

  return {
    total,
    usableCount,
    usableDenominator: total,
    usablePct,
    awaitingReview,
    unusableText,
    routed,
    highPriority,
    stale,
    byRoute,
    byStatus,
    bySourceType,
    callReps,
    meetingOrganizers,
  };
}
