// Tiny debug logger with topic-based enabling
// Enable by setting localStorage.debug = "tts,sermon,post" (comma-separated)
// Or append ?debugTTS=1 to URL to enable only TTS logs for this tab.

const getDebugSet = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlTTS = params.get('debugTTS');
    const raw = window.localStorage.getItem('debug') || '';
    const set = new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
    if (urlTTS === '1') set.add('tts');
    return set;
  } catch {
    return new Set();
  }
};

let __areas = getDebugSet();

export function debugOn(area) {
  // Hot-reload aware: re-read on every check
  __areas = getDebugSet();
  return __areas.has('*') || __areas.has(area);
}

export function dlog(area, ...args) {
  if (!debugOn(area)) return;
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${ts}] [${area}]`, ...args);
}

export function enable(area) {
  try {
    const raw = window.localStorage.getItem('debug') || '';
    const set = new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
    set.add(area);
    window.localStorage.setItem('debug', Array.from(set).join(','));
  } catch {}
}

export function disable(area) {
  try {
    const raw = window.localStorage.getItem('debug') || '';
    const set = new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
    set.delete(area);
    window.localStorage.setItem('debug', Array.from(set).join(','));
  } catch {}
}

export default { debugOn, dlog, enable, disable };
