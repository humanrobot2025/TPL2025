const base = (import.meta as any).env?.VITE_SSE_URL || '';

export async function sendActive(payload: any) {
  if (!base) return;
  try {
    await fetch(`${base}/active`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (e) {
    console.warn('Failed to send active to SSE server', e);
  }
}

export async function clearActive() {
  if (!base) return;
  try {
    await fetch(`${base}/active`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Failed to clear active on SSE server', e);
  }
}

export async function getActive() {
  if (!base) return null;
  try {
    const r = await fetch(`${base}/active`);
    if (!r.ok) return null;
    const j = await r.json();
    return j.active || null;
  } catch (e) {
    return null;
  }
}

export function listen(handler: (evt: string, payload: any) => void) {
  if (!base || typeof EventSource === 'undefined') return { close: () => {} };
  const es = new EventSource(`${base}/events`);
  es.addEventListener('init', (ev: any) => {
    try { handler('init', JSON.parse(ev.data)); } catch (e) {}
  });
  es.addEventListener('active', (ev: any) => { try { handler('active', JSON.parse(ev.data)); } catch (e) {} });
  es.addEventListener('clear', (ev: any) => { try { handler('clear', JSON.parse(ev.data)); } catch (e) {} });
  es.addEventListener('matches-updated', (ev: any) => { try { handler('matches-updated', JSON.parse(ev.data)); } catch (e) {} });
  es.onerror = () => {}; // silent error
  return { close: () => es.close() };
}
