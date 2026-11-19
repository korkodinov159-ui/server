import { useState } from 'react';
import { Avatar } from '@vkontakte/vkui';
import { useGame, REF_WELCOME_BONUS, REF_PERCENT } from '../store/gameStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReferralModal({ open, onClose }: Props) {
  const { player, getRefLink, shareRefLink, inviteToProfile } = useGame();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const link = getRefLink();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Ссылка: ${link}`);
    }
  };

  const totalRefEarned = player.referrals?.reduce((sum, r) => sum + r.bonusPaid, 0) || 0;

  return (
    <div className="chest-modal-overlay" style={{ zIndex: 100000 }}>
      <div className="referral-modal-card">
        <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>
          🎁 Приглашай друзей
        </h2>
        <p className="text-sub" style={{ textAlign: 'center', marginBottom: 20 }}>
          Получай <b style={{ color: '#4ade80' }}>{REF_WELCOME_BONUS.toLocaleString()} 💰</b> за каждого друга
          и <b style={{ color: '#4ade80' }}>{Math.round(REF_PERCENT * 100)}%</b> с его дохода!
        </p>

        <div className="ref-link-box">
          <div className="ref-link-text">{link}</div>
          <button className="ref-copy-btn" onClick={handleCopy}>
            {copied ? '✓' : '📋'}
          </button>
        </div>

        <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => shareRefLink()}>
          📤 Поделиться в ВК
        </button>

        <button className="btn-primary" style={{ marginTop: 8, background: '#2a2a35', boxShadow: 'none' }} onClick={() => inviteToProfile()}>
          ⭐ Добавить кнопку в профиль ВК
        </button>

        <div style={{ marginTop: 20, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <div className="text-sub">Приглашено друзей</div>
          <div className="text-value" style={{ color: '#5a7af5' }}>{player.referrals?.length || 0}</div>
        </div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div className="text-sub">Заработано с рефералов</div>
          <div className="text-value" style={{ color: '#4ade80' }}>
            {totalRefEarned.toLocaleString()} 💰
          </div>
        </div>

        {player.referrals && player.referrals.length > 0 && (
          <>
            <div className="text-sub" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Твои рефералы
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {player.referrals.map(r => (
                <div key={r.vk_id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#1a1a21', borderRadius: 12, padding: '8px 12px',
                }}>
                  <Avatar size={36} src={r.avatar} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-value" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.name}
                    </div>
                    <div className="text-sub" style={{ fontSize: 11 }}>
                      Нафармил: {r.totalEarned.toLocaleString()} 💰
                    </div>
                  </div>
                  <div style={{ color: '#4ade80', fontSize: 12, fontWeight: 700 }}>
                    +{r.bonusPaid.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn-primary" style={{ background: 'transparent', color: '#888', boxShadow: 'none', marginTop: 16 }} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}