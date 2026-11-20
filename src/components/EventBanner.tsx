import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export type EventPhase = 'INACTIVE' | 'DISCOUNT_PHASE' | 'WAR_PHASE';
export function EventBanner() {
  const [status, setStatus] = useState<{ phase: EventPhase; endsAt: number }>({ phase: 'INACTIVE', endsAt: 0 });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const load = () => void apiGet<typeof status>('/event/status').then(setStatus).catch(() => setStatus({ phase: 'INACTIVE', endsAt: 0 }));
    load(); const refresh = window.setInterval(load, 60000); const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(refresh); window.clearInterval(clock); };
  }, []);
  if (status.phase === 'INACTIVE') return null;
  const seconds = Math.max(0, Math.floor((status.endsAt - now) / 1000));
  const time = `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return <div className={`event-banner event-banner-${status.phase.toLowerCase()}`}><strong>{status.phase === 'DISCOUNT_PHASE' ? '🛒 Скидка 50% на подданных!' : '⚔️ Война за регионы открыта!'}</strong><span>До конца: {time}</span></div>;
}
