// Persistence layer — localStorage only, no external dependencies.
const KEYS = {
  records:   'rii_records',    // Map<compositeKey, record>
  overrides: 'rii_overrides',  // Map<compositeKey, { route, changedAt }>
  imports:   'rii_imports',    // Array<importEntry>
  activity:  'rii_activity',   // Array<activityEntry>
  actions:   'rii_action_checks', // Map<compositeKey, Map<actionText, boolean>>
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[persistence] write failed:', key, e);
  }
}

/** Load all persisted state. Returns null fields where nothing saved yet. */
export function load() {
  return {
    records:   read(KEYS.records)   || {},
    overrides: read(KEYS.overrides) || {},
    imports:   read(KEYS.imports)   || [],
    activity:  read(KEYS.activity)  || [],
    actions:   read(KEYS.actions)   || {},
  };
}

/** Save entire state snapshot. */
export function save({ records, overrides, imports, activity, actions }) {
  write(KEYS.records,   records);
  write(KEYS.overrides, overrides);
  write(KEYS.imports,   imports);
  write(KEYS.activity,  activity);
  write(KEYS.actions,   actions);
}

/** Save a single slice. */
export function saveRecords(records)     { write(KEYS.records,   records); }
export function saveOverrides(overrides) { write(KEYS.overrides, overrides); }
export function saveImports(imports)     { write(KEYS.imports,   imports); }
export function saveActivity(activity)   { write(KEYS.activity,  activity); }
export function saveActions(actions)     { write(KEYS.actions, actions); }

/** Clear everything — used during dev/reset. */
export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
