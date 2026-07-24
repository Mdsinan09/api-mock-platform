let listeners = [];

export const subscribeToToasts = (listener) => {
  listeners.push(listener);
  return () => { listeners = listeners.filter((item) => item !== listener); };
};

export const toast = (message, type = 'info') => {
  const notification = { id: Date.now() + Math.random(), message, type };
  listeners.forEach((listener) => listener(notification));
};
