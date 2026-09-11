/** Ephemeral display state only; the server independently authorises every write. */
export function createSessionView() {
  let current;
  const listeners = new Set();
  return {
    publish(identity) {
      current = Object.freeze({ authenticated: Boolean(identity),
        name: identity ? (identity.name?.trim() || 'Participant').slice(0, 256) : '' });
      for (const listener of listeners) listener(current);
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(current);
      return () => listeners.delete(listener);
    },
  };
}

const view = createSessionView();
export const publishSessionView = view.publish;
export const subscribeSessionView = view.subscribe;
