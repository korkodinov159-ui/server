import { useEffect, useState } from 'react';
import { GameNotification, subscribeToNotifications } from '../utils/notifications';

export function ToastViewport() {
  const [items, setItems] = useState<GameNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((item) => {
      setItems((current) => [...current, item]);
      window.setTimeout(() => setItems((current) => current.filter((toast) => toast.id !== item.id)), 4200);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div className={`game-toast game-toast-${item.tone}`} key={item.id}>
          <span className="game-toast-mark">{item.tone === 'success' ? '✓' : item.tone === 'error' ? '!' : 'i'}</span>
          <div><strong>{item.title}</strong>{item.message && <p>{item.message}</p>}</div>
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}>×</button>
        </div>
      ))}
    </div>
  );
}