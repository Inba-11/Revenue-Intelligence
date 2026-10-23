import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { load, saveRecords, saveOverrides, saveImports, saveActivity, saveActions, clearAll } from '../lib/persistence.js';
import { applyBatch, compositeKey, refreshStoredRecord } from '../lib/importReplay.js';
import { ROUTE_TAXONOMY, suggestRoute, effectiveRoute } from '../lib/routing.js';
import { computeMetrics } from '../lib/metrics.js';
import { buildExportGroups, downloadGroup, generateAllExports, downloadManifest } from '../lib/exportGenerator.js';
import { INITIAL_BATCH, UPDATE_BATCH } from '../data/bundledBatches.js';

export const ROUTES = ROUTE_TAXONOMY;
export const STATUSES = ['New', 'In review', 'Routed', 'Unusable text', 'Dismissed'];
export const PRIORITIES = ['High', 'Medium', 'Low', 'Unassessed'];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [records, setRecordsRaw] = useState({});
  const [overrides, setOverridesRaw] = useState({});
  const [importHistory, setImportHistoryRaw] = useState([]);
  const [activity, setActivityRaw] = useState([]);
  const [actionChecks, setActionChecksRaw] = useState({});

  const [navOpen, setNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [booted, setBooted] = useState(false);

  const setRecords = useCallback((v) => { setRecordsRaw(v); saveRecords(v); }, []);
  const setOverrides = useCallback((v) => { setOverridesRaw(v); saveOverrides(v); }, []);
  const setImportHistory = useCallback((v) => { setImportHistoryRaw(v); saveImports(v); }, []);
  const setActivity = useCallback((v) => { setActivityRaw(v); saveActivity(v); }, []);

  const notify = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const pushActivity = useCallback((text) => {
    setActivityRaw((prev) => {
      const entry = { id: Date.now(), text, time: 'Just now' };
      const next = [entry, ...prev].slice(0, 50);
      saveActivity(next);
      return next;
    });
  }, []);

  // ── Apply batch payload ────────────────────────────────────────────────────
  const importBatch = useCallback((payload, customFilename) => {
    const seenBatchIds = importHistory.map((e) => e.batchId).filter(Boolean);
    const result = applyBatch(payload, records, seenBatchIds);

    if (result.error && !result.duplicate) {
      notify(`Import error: ${result.error}`);
      return;
    }
    if (result.duplicate) {
      notify(`Batch "${payload.batch_id}" already imported — skipped (no duplicates).`);
      return;
    }

    const entry = {
      id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      batchId: result.batchId,
      name: customFilename || payload._filename || payload.batch_id,
      type: payload.batch_id.includes('update') ? 'Update Batch' : 'Initial Batch',
      date: new Date().toLocaleString(),
      records: payload.records?.length || 0,
      added: result.added,
      updated: result.updated,
      skipped: result.skipped,
      status: 'Replayed',
    };

    const nextHistory = [entry, ...importHistory];
    setRecordsRaw(result.records);
    saveRecords(result.records);
    setImportHistoryRaw(nextHistory);
    saveImports(nextHistory);
    notify(`Imported "${entry.name}": ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`);
    pushActivity(`Batch "${entry.name}" replayed (${result.added} added, ${result.updated} updated).`);
  }, [importHistory, records, notify, pushActivity]);

  // ── Import from File ───────────────────────────────────────────────────────
  const importFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);
        payload._filename = file.name;
        importBatch(payload, file.name);
      } catch {
        notify(`Could not parse "${file.name}" — invalid JSON.`);
      }
    };
    reader.readAsText(file);
  }, [importBatch, notify]);

  // ── Manual route override ──────────────────────────────────────────────────
  const overrideRoute = useCallback((key, route, reason = '') => {
    setOverridesRaw((prev) => {
      const next = {
        ...prev,
        [key]: {
          route,
          reason,
          changedAt: new Date().toISOString(),
        },
      };
      saveOverrides(next);
      return next;
    });
    pushActivity(`Route manually overridden to "${route}" for record ${key}.`);
  }, [pushActivity]);

  const resetRouteOverride = useCallback((key) => {
    setOverridesRaw((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      saveOverrides(next);
      return next;
    });
    pushActivity(`Manual route override cleared for record ${key}.`);
  }, [pushActivity]);

  const toggleAction = useCallback((key, actionText) => {
    const recordChecks = actionChecks[key] || {};
    const nextRecordChecks = { ...recordChecks, [actionText]: !recordChecks[actionText] };
    const next = { ...actionChecks, [key]: nextRecordChecks };
    setActionChecksRaw(next);
    saveActions(next);
  }, [actionChecks]);

  // ── Update record status ───────────────────────────────────────────────────
  const updateStatus = useCallback((key, status) => {
    setRecordsRaw((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev, [key]: { ...prev[key], status } };
      saveRecords(next);
      return next;
    });
    pushActivity(`Status marked as "${status}" for record ${key}.`);
  }, [pushActivity]);

  // ── Bundled batches are imported only when requested ───────────────────────
  const loadInitialBatch = useCallback(() => {
    importBatch(INITIAL_BATCH, '01_initial.json');
  }, [importBatch]);

  const loadUpdateBatch = useCallback(() => {
    importBatch(UPDATE_BATCH, '02_update.json');
  }, [importBatch]);

  // ── Reset everything ───────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    clearAll();
    setRecordsRaw({});
    setOverridesRaw({});
    setImportHistoryRaw([]);
    setActivityRaw([]);
    setActionChecksRaw({});
    notify('Workspace cleared. Import a batch to get started.');
  }, [notify]);

  // ── Boot sequence ──────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = load();

    // Older builds silently seeded both sample batches on first visit. Remove
    // that generated state once, while preserving records imported through the UI.
    const hadAutomaticDemoSeed = stored.imports.some((entry) => (
      (entry.id === 'imp-1' && entry.batchId === 'initial-001')
      || (entry.id === 'imp-2' && entry.batchId === 'update-002')
    ));
    if (hadAutomaticDemoSeed) clearAll();

    const restoredRecords = hadAutomaticDemoSeed ? {} : stored.records;
    const refreshedRecords = Object.fromEntries(
      Object.entries(restoredRecords).map(([key, record]) => [key, refreshStoredRecord(record)]),
    );
    setRecordsRaw(refreshedRecords);
    if (Object.keys(refreshedRecords).length > 0) saveRecords(refreshedRecords);
    setOverridesRaw(hadAutomaticDemoSeed ? {} : stored.overrides);
    setImportHistoryRaw(hadAutomaticDemoSeed ? [] : stored.imports);
    setActivityRaw(hadAutomaticDemoSeed ? [] : stored.activity);
    setActionChecksRaw(hadAutomaticDemoSeed ? {} : stored.actions);
    setBooted(true);
  }, []);

  // ── Derived conversation list ──────────────────────────────────────────────
  const conversations = useMemo(() => {
    return Object.values(records).map((rec) => ({
      ...rec,
      id: rec.key,
      route: effectiveRoute(rec, overrides),
      routingSuggestion: suggestRoute(rec),
      isOverridden: !!(overrides[rec.key]?.route),
      overrideInfo: overrides[rec.key] || null,
    }));
  }, [records, overrides]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const metrics = useMemo(() => computeMetrics(records, overrides), [records, overrides]);

  // ── Derived export groups ──────────────────────────────────────────────────
  const exportGroups = useMemo(() => buildExportGroups(records, overrides), [records, overrides]);

  // ── Export actions ─────────────────────────────────────────────────────────
  const doDownloadGroup = useCallback((group) => {
    downloadGroup(group);
  }, []);

  const doGenerateAll = useCallback(() => {
    generateAllExports(records, overrides);
    pushActivity('Complete route export ZIP downloaded.');
    notify('Downloaded the ZIP with route files and manifest.');
  }, [records, overrides, pushActivity, notify]);

  const doDownloadManifest = useCallback(() => {
    downloadManifest(records, overrides);
    pushActivity('Export manifest.json downloaded.');
    notify('Downloaded manifest.json.');
  }, [records, overrides, pushActivity, notify]);

  const value = useMemo(() => ({
    records,
    conversations,
    overrides,
    importHistory,
    activity,
    actionChecks,
    metrics,
    exportGroups,
    booted,
    navOpen,
    setNavOpen,
    toast,
    notify,
    importBatch,
    importFile,
    overrideRoute,
    resetRouteOverride,
    toggleAction,
    updateStatus,
    loadInitialBatch,
    loadUpdateBatch,
    resetAll,
    doDownloadGroup,
    doGenerateAll,
    doDownloadManifest,
    ROUTES,
    STATUSES,
    PRIORITIES,
  }), [
    records, conversations, overrides, importHistory, activity, actionChecks, metrics, exportGroups,
    booted, navOpen, toast, notify,
    importBatch, importFile, overrideRoute, resetRouteOverride, toggleAction, updateStatus,
    loadInitialBatch, loadUpdateBatch, resetAll,
    doDownloadGroup, doGenerateAll, doDownloadManifest,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
