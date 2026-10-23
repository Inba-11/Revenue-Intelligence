/**
 * routing.js — Effective route computation and suggestions.
 *
 * Route Taxonomy (ASSIGNMENT.md §2):
 *  - Deal next steps
 *  - Customer follow-up
 *  - Sales coaching
 *  - Support escalation
 *  - Internal / vendor note
 *  - No action / Unusable
 */

import { ROUTE_TAXONOMY } from '../data/analysisData.js';

export { ROUTE_TAXONOMY };

/**
 * Derive suggested route for a record.
 */
export function suggestRoute(record) {
  if (!record) {
    return { route: 'No action / Unusable', reason: 'No record data', source: 'Intake placeholder' };
  }

  // Pre-generated or source-supplied route
  if (record.suggestedRoute) {
    return {
      route: record.suggestedRoute,
      reason: record.routingReason || (record.hasTranscript ? 'Pre-generated suggestion based on supplied text.' : 'No usable text is available; this is an intake placeholder.'),
      source: record.hasTranscript ? 'Pre-generated' : 'Intake placeholder',
    };
  }

  // Unusable / non-speech records
  if (!record.hasTranscript) {
    return {
      route: 'No action / Unusable',
      reason: 'No usable text is supplied. This does not establish whether the interaction took place.',
      source: 'Intake placeholder',
    };
  }

  // Fallback to customer follow-up
  return {
    route: 'Customer follow-up',
    reason: 'Conversation requires team review.',
    source: 'Review suggestion',
  };
}

/**
 * Compute the effective route for a record, strictly respecting manual overrides.
 * Overrides are kept separate from source data.
 *
 * @param {object} record — normalised record
 * @param {object} overrides — Map<key, { route, changedAt, reason }>
 * @returns {string} effective route name
 */
export function effectiveRoute(record, overrides = {}) {
  const override = overrides[record.key];
  if (override && override.route) {
    return override.route;
  }
  return suggestRoute(record).route;
}
