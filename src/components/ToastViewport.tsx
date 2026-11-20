import { useEffect, useState } from 'react';
import { GameNotification, subscribeToNotifications } from '../utils/notifications';

export function ToastViewport() {
  const [item, setItem] = useState<GameNotification | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    const unsubscribe = subscribeToNotifications((nextItem) => {
      setItem(nextItem);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setItem((current) => current?.id === nextItem.id ? null : current);
      }, 4200);
    });
    return () => {
      unsubscribe();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!item) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      <div className={`game-toast game-toast-${item.tone}`}>
        <span className="game-toast-mark">{item.tone === 'success' ? '✓' : item.tone === 'error' ? '!' : 'i'}</span>
        <div><strong>{item.title}</strong>{item.message && <p>{item.message}</p>}</div>
        <button type="button" aria-label="Закрыть уведомление" onClick={() => setItem(null)}>×</button>
      </div>
    </div>
  );
}
