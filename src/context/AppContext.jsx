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

  // ── 1-click Demo Load Helpers ─────────────────────────────────────────────
  const loadInitialBatch = useCallback(() => {
    importBatch(INITIAL_BATCH, '01_initial.json');
  }, [importBatch]);

  const loadUpdateBatch = useCallback(() => {
    importBatch(UPDATE_BATCH, '02_update.json');
  }, [importBatch]);

  const loadAllDemoData = useCallback(() => {
    // Replay initial then update in sequence
    const r1 = applyBatch(INITIAL_BATCH, {}, []);
    const r2 = applyBatch(UPDATE_BATCH, r1.records, [r1.batchId]);

    setRecordsRaw(r2.records);
    saveRecords(r2.records);

    const history = [
      {
        id: `imp-2`,
        batchId: 'update-002',
        name: '02_update.json',
        type: 'Update Batch',
        date: new Date().toLocaleString(),
        records: UPDATE_BATCH.records.length,
        added: r2.added,
        updated: r2.updated,
        skipped: r2.skipped,
        status: 'Replayed',
      },
      {
        id: `imp-1`,
        batchId: 'initial-001',
        name: '01_initial.json',
        type: 'Initial Batch',
        date: new Date().toLocaleString(),
        records: INITIAL_BATCH.records.length,
        added: r1.added,
        updated: r1.updated,
        skipped: r1.skipped,
        status: 'Replayed',
      },
    ];
    setImportHistoryRaw(history);
    saveImports(history);

    notify('Loaded demo state: Initial + Update batches (44 records, 18 usable texts).');
    pushActivity('Demonstration dataset replayed: Initial delivery + Update delivery.');
  }, [notify, pushActivity]);

  // ── Reset everything ───────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    clearAll();
    setRecordsRaw({});
    setOverridesRaw({});
    setImportHistoryRaw([]);
    setActivityRaw([]);
    setActionChecksRaw({});
    notify('All records and overrides cleared.');
    pushActivity('Application state reset to clean start.');
  }, [notify, pushActivity]);

  // ── Boot sequence ──────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = load();
    const hasExistingRecords = stored.records && Object.keys(stored.records).length > 0;

    if (hasExistingRecords) {
      const refreshedRecords = Object.fromEntries(
        Object.entries(stored.records).map(([key, record]) => [key, refreshStoredRecord(record)]),
      );
      setRecordsRaw(refreshedRecords);
      saveRecords(refreshedRecords);
      if (stored.overrides) setOverridesRaw(stored.overrides);
      if (stored.imports) setImportHistoryRaw(stored.imports);
      if (stored.activity) setActivityRaw(stored.activity);
      if (stored.actions) setActionChecksRaw(stored.actions);
    } else {
      // Per ASSIGNMENT.md page 4: "Your submitted app should open in the final post-update state"
      loadAllDemoData();
    }
    setBooted(true);
  }, [loadAllDemoData]);

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
    loadAllDemoData,
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
    loadInitialBatch, loadUpdateBatch, loadAllDemoData, resetAll,
    doDownloadGroup, doGenerateAll, doDownloadManifest,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
