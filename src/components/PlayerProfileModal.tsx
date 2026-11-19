import { Avatar } from '@vkontakte/vkui';
import { useProfile } from '../context/ProfileContext';
import { apiPost } from '../api/client';
import { notify } from '../utils/notifications';
import { useState } from 'react';

export function PlayerProfileModal() {
  const { selectedPlayer, closeProfile } = useProfile();
  const [buying, setBuying] = useState(false);

  if (!selectedPlayer) return null;

  const handleAttack = async () => {
    try {
      const data = await apiPost<{ stolenSlave: { name: string } }>('/attack', { defenderId: selectedPlayer.vk_id });
      notify('⚔️ Успех', `Украл ${data.stolenSlave.name}!`, 'success');
      closeProfile();
    } catch (e: any) {
      notify('❌ Ошибка', e.message || 'Не удалось', 'error');
    }
  };

  const handleBuyPlayer = async () => {
    if (buying) return;
    setBuying(true);
    try {
      const data = await apiPost<{ paid: number }>('/character/buy-player', { targetVkId: selectedPlayer.vk_id });
      notify('Куплен', `За ${data.paid.toLocaleString()} 💰`, 'success');
      closeProfile();
    } catch (e: any) {
      notify('Ошибка', e.message || 'Не удалось купить', 'error');
    } finally {
      setBuying(false);
    }
  };

  const itemStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1a1a21', padding: '16px', borderRadius: '16px',
    marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)',
  };
  const iconBoxStyle = (bg: string) => ({
    width: 36, height: 36, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontSize: 18,
  });

  return (
    <div className="chest-modal-overlay" style={{ justifyContent: 'flex-start', paddingTop: '5vh', overflowY: 'auto', zIndex: 10000 }}>
      <div style={{ width: '100%', maxWidth: 400, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', padding: 4, borderRadius: '50%', border: '2px solid #5a7af5', boxShadow: '0 0 20px rgba(90,122,245,0.3)' }}>
            <Avatar size={100} src={selectedPlayer.avatar} />
          </div>
          <div className="text-title" style={{ fontSize: 24, marginTop: 12 }}>{selectedPlayer.name}</div>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#fbbf24')}><span style={{ color: '#000', fontWeight: 'bold' }}>$</span></div>
            <span className="text-value">Баланс</span>
          </div>
          <span className="text-value">{selectedPlayer.coins.toLocaleString()} 💰</span>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#4ade80')}><span style={{ color: '#000' }}>↗</span></div>
            <span className="text-value">Приносит</span>
          </div>
          <span className="text-value">{selectedPlayer.income.toLocaleString()} 💰 / ч</span>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#a78bfa')}><span style={{ color: '#000' }}>👥</span></div>
            <span className="text-value">Подданные</span>
          </div>
          <span className="text-value">{selectedPlayer.slaves?.length || 0}</span>
        </div>

        <div style={itemStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={iconBoxStyle('#ef4444')}><span style={{ color: '#fff' }}>🏠</span></div>
            <span className="text-value">Клан</span>
          </div>
          <span className="text-value" style={{ color: selectedPlayer.clanName ? '#5a7af5' : '#888' }}>
            {selectedPlayer.clanName || 'Без клана'}
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <a href={`https://vk.com/id${selectedPlayer.vk_id}`} target="_blank" rel="noreferrer" style={{ color: '#5a7af5', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Открыть в ВК
          </a>
        </div>

        <button className="btn-primary" style={{ background: '#5a7af5', marginBottom: 8 }} onClick={handleBuyPlayer} disabled={buying}>
          {buying ? 'Покупка...' : '💰 Купить этого игрока'}
        </button>

        <button className="btn-primary" style={{ background: '#2a2a35', color: '#fff', boxShadow: 'none', marginBottom: 8 }} onClick={handleAttack}>
          🪨 Кинуть камень
        </button>

        <div style={{ marginTop: 24, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div className="text-sub" style={{ letterSpacing: 1, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Подданные</div>
          <div className="text-sub" style={{ fontSize: 14 }}>{selectedPlayer.slaves?.length || 0} чел.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {selectedPlayer.slaves?.slice(0, 10).map((ch: any) => (
            <div key={ch.id} className="glass-panel" style={{ padding: '12px 16px', borderRadius: 16, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Avatar size={40} src={ch.avatar} style={{ border: '2px solid #2a2a35' }} />
                <div style={{ marginLeft: 12 }}>
                  <div className="text-value" style={{ fontSize: 15 }}>{ch.name}</div>
                  <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                    +{ch.income || 0} 💰 / ч
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ background: 'transparent', color: '#888', boxShadow: 'none', marginTop: 24 }} onClick={closeProfile}>
          Закрыть
        </button>
      </div>
    </div>
  );
}