import { Avatar } from '@vkontakte/vkui';
import type { Character } from '../types';
import { calcCurrentPrice, calcSellerPayout, calcGiveAwayPayout, isJudgmentDayNow } from '../config';

interface Props {
  slave: Character | null;
  onClose: () => void;
  onRelease: (id: string) => void;
  onGiveAway: (id: string) => void;
  onSell: (id: string) => void;
}

export function SlaveProfileModal({ slave, onClose, onRelease, onGiveAway, onSell }: Props) {
  if (!slave) return null;

  const isJD = isJudgmentDayNow();
  const currentPrice = calcCurrentPrice(slave.income, slave.resaleCount || 0, !!slave.boughtBySelf);
  const sellerPayout = calcSellerPayout(slave.income);
  const givePayout = calcGiveAwayPayout(slave.income, slave.resaleCount || 0, !!slave.boughtBySelf, isJD);
  const nextIncomeVal = Math.min(500, Math.ceil(slave.income * 1.3));

  const itemStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1a1a21', padding: '16px', borderRadius: '16px',
    marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)',
  };
  const iconBoxStyle = (bg: string) => ({
    width: 36, height: 36, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginRight: 12, fontSize: 18,
  });

  return (
    <div className="chest-modal-overlay" style={{ justifyContent: 'flex-start', paddingTop: '10vh', zIndex: 99999, overflowY: 'auto' }}>
      <div className="character-modal-shell" style={{ width: '100%', maxWidth: 400, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={100} src={slave.avatar} style={{ border: '3px solid rgba(255,255,255,0.1)' }} />
          <div className="text-title" style={{ fontSize: 24, marginTop: 12 }}>{slave.name}</div>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#fbbf24')}><span style={{ color: '#000', fontWeight: 'bold' }}>$</span></div>
            <span className="text-value">Текущая цена</span>
          </div>
          <span className="text-value">{currentPrice.toLocaleString()} 💰</span>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#4ade80')}><span style={{ color: '#000' }}>↗</span></div>
            <span className="text-value">Доход</span>
          </div>
          <span className="text-value">
            {slave.income} / ч {slave.income < 500 && <span style={{ color: '#888', fontSize: 11 }}>→ {nextIncomeVal} при покупке</span>}
          </span>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#a78bfa')}><span style={{ color: '#000' }}>🔄</span></div>
            <span className="text-value">Перепродаж</span>
          </div>
          <span className="text-value">
            {slave.resaleCount || 0} {slave.boughtBySelf ? '• выкуплен' : ''}
          </span>
        </div>

        <div style={{ ...itemStyle, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#fbbf24')}><span style={{ color: '#000' }}>₽</span></div>
            <span className="text-value">Продажа на рынок</span>
          </div>
          <span className="text-value" style={{ color: '#fbbf24' }}>+{sellerPayout.toLocaleString()} 💰</span>
        </div>

        <div style={{ ...itemStyle, background: givePayout > 0 ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)', border: givePayout > 0 ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#4ade80')}><span style={{ color: '#000' }}>↩</span></div>
            <span className="text-value">Отдать {isJD && givePayout > 0 ? '(×0.5)' : ''}</span>
          </div>
          <span className="text-value" style={{ color: givePayout > 0 ? '#4ade80' : '#888' }}>
            {givePayout > 0 ? `+${givePayout.toLocaleString()} 💰` : 'без выплаты'}
          </span>
        </div>

        {currentPrice >= 500_000 && (
          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
            Цена ≥ 500 000 — «отдать» нельзя, только освободить без выплаты
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            className="btn-primary"
            style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #fbbf24', boxShadow: 'none', marginBottom: 12 }}
            onClick={() => { onSell(slave.id); onClose(); }}
          >
            Продать на рынок (+{sellerPayout.toLocaleString()} 💰)
          </button>
          <button
            className="btn-primary"
            style={{ background: givePayout > 0 ? 'rgba(74, 222, 128, 0.15)' : '#2a2a35', color: givePayout > 0 ? '#4ade80' : '#888', border: givePayout > 0 ? '1px solid #4ade80' : 'none', boxShadow: 'none', marginBottom: 12 }}
            onClick={() => { onGiveAway(slave.id); onClose(); }}
          >
            {givePayout > 0 ? `Отдать (+${givePayout.toLocaleString()} 💰)` : 'Освободить (без выплаты)'}
          </button>
          <button
            className="btn-primary"
            style={{ background: 'transparent', color: '#888', boxShadow: 'none' }}
            onClick={() => { onRelease(slave.id); onClose(); }}
          >
            Отпустить (удалить)
          </button>
        </div>

        <button className="btn-primary" style={{ background: 'transparent', color: '#888', boxShadow: 'none', marginTop: 12 }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}