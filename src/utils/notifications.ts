export type NotificationTone = 'success' | 'error' | 'info';

export interface GameNotification {
  id: number;
  title: string;
  message?: string;
  tone: NotificationTone;
}

type Listener = (notification: GameNotification) => void;

const listeners = new Set<Listener>();
let nextId = 1;

export function notify(title: string, message?: string, tone: NotificationTone = 'info') {
  const notification = { id: nextId++, title, message, tone };
  listeners.forEach((listener) => listener(notification));
}

export function subscribeToNotifications(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}