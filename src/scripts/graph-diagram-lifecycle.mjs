/** One diagram owns all scheduled work and event/observer subscriptions. */
export function createDiagramLifecycle(wrapper, browser = window) {
  let disposed = false;
  const cleanups = new Set();
  const active = () => !disposed && wrapper.isConnected;
  const guard = callback => (...args) => { if (active()) return callback(...args); };

  function onDispose(cleanup) {
    if (disposed) cleanup(); else cleanups.add(cleanup);
    return cleanup;
  }

  function listen(target, type, callback, options) {
    if (disposed) return () => {};
    const handler = guard(callback);
    target.addEventListener(type, handler, options);
    const remove = () => { target.removeEventListener(type, handler, options); cleanups.delete(remove); };
    return onDispose(remove);
  }

  function schedule(callback, start, cancel) {
    if (!active()) return () => {};
    const id = start(() => { cleanups.delete(stop); if (active()) callback(); });
    const stop = () => { cancel(id); cleanups.delete(stop); };
    return onDispose(stop);
  }

  return {
    get active() { return active(); },
    guard, listen, onDispose,
    observe(observer) { onDispose(() => observer.disconnect()); return observer; },
    timeout(callback, delay) { return schedule(callback, done => browser.setTimeout(done, delay), id => browser.clearTimeout(id)); },
    frame(callback) { return schedule(callback, done => browser.requestAnimationFrame(done), id => browser.cancelAnimationFrame(id)); },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of [...cleanups].reverse()) cleanup();
      cleanups.clear();
    },
  };
}
