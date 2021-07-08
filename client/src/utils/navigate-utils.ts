export function navigateTo(url: string): void {
  window.history.pushState({}, '', url);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
}
