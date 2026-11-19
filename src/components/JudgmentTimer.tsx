import { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore';

export function JudgmentTimer({ compact = false }: { compact?: boolean }) {
  const { judgmentStatus } = useGame();
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, judgmentStatus.endTime - now);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ d, h, m, s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [judgmentStatus.endTime]);

  if (compact) {
    return (
      <div className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(30, 30, 38, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: judgmentStatus.isNow ? '#ef4444' : '#fff', fontWeight: 600 }}>
            {judgmentStatus.isNow ? '🔥 Судный день ИДЕТ!' : '⏳ Судный день'}
          </span>
          <span style={{ color: '#fff', fontWeight: 600 }}>
            {judgmentStatus.isNow ? 'СКИДКА 50%' : `через ${timeLeft.d}д ${timeLeft.h}ч ${timeLeft.m}м`}
          </span>
        </div>
        <div style={{ width: '100%', height: 4, background: '#1a1a21', borderRadius: 2 }}>
          <div style={{ 
            width: judgmentStatus.isNow ? '100%' : `${Math.max(0, 100 - (timeLeft.d / 7) * 100)}%`, 
            height: '100%', 
            background: judgmentStatus.isNow ? '#ef4444' : '#5a7af5', 
            borderRadius: 2,
            transition: 'width 1s linear'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="judgment-banner">
      <div className="judgment-header">
        <span>{judgmentStatus.isNow ? '🔥 Судный день ИДЕТ!' : '⚖️ До Судного дня'}</span>
      </div>
      <div className="judgment-grid">
        <div className="judgment-box">
          <div className="judgment-num">{String(timeLeft.d).padStart(2, '0')}</div>
          <div className="judgment-label">ДНЕЙ</div>
        </div>
        <div className="judgment-box">
          <div className="judgment-num">{String(timeLeft.h).padStart(2, '0')}</div>
          <div className="judgment-label">ЧАСОВ</div>
        </div>
        <div className="judgment-box">
          <div className="judgment-num">{String(timeLeft.m).padStart(2, '0')}</div>
          <div className="judgment-label">МИНУТ</div>
        </div>
        <div className="judgment-box">
          <div className="judgment-num red">{String(timeLeft.s).padStart(2, '0')}</div>
          <div className="judgment-label">СЕКУНД</div>
        </div>
      </div>
      <div className="text-sub" style={{ fontSize: 11, textAlign: 'center', marginTop: 8 }}>
        {judgmentStatus.isNow ? 'Все подданные стоят в 2 раза дешевле!' : 'В воскресенье все цены на рынке упадут в 2 раза!'}
      </div>
    </div>
  );
}