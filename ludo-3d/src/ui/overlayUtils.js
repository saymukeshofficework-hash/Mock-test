export function showOverlay(el) {
  if (!el) return;
  el.hidden = false;
  const focusable = el.querySelector('button, input, [tabindex]');
  focusable?.focus({ preventScroll: true });
}

export function hideOverlay(el) {
  if (el) el.hidden = true;
}

export function $(id) {
  return document.getElementById(id);
}
