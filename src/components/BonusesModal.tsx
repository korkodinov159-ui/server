import { useState, useEffect } from 'react';
import {
  useGame,
  REF_WELCOME_BONUS,
  STORY_SHARE_REWARD,
  CAREER_LEVELS,
} from '../store/gameStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'today' | 'career' | 'games';

const formatMoney = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

export function BonusesModal({ open, onClose }: Props) {
  const {
    player,
    dailyStatus,
    claimDailyReward,
    getRefLink,
    shareToStory,
    storyCooldownEnd,
    claimAdReward,
    adCooldownEnd,
    adViewsToday,
    dailyAdLimit,
    claimCareerReward,
  } = useGame();

  const [tab, setTab] = useState<Tab>('today');
  const [copied, setCopied] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!open) return null;

  const link = getRefLink();
  const referrals = player.referrals ?? [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Ссылка: ${link}`);
    }
  };

  const isStoryCooldown = Date.now() < storyCooldownEnd;
  const storyWaitMin = isStoryCooldown ? Math.ceil((storyCooldownEnd - Date.now()) / 60000) : 0;
  const isAdCooldown = Date.now() < adCooldownEnd;
  const adWaitSec = isAdCooldown ? Math.ceil((adCooldownEnd - Date.now()) / 1000) : 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Сегодня' },
    { id: 'career', label: 'Карьера' },
    { id: 'games', label: 'Игры' },
  ];

  return (
    <div className="chest-modal-overlay" style={{ justifyContent: 'flex-start', paddingTop: '4vh', zIndex: 100000 }}>
      <div style={{ width: '100%', maxWidth: 420, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: 20, padding: '8px 16px', fontSize: 13, cursor: 'pointer', position: 'absolute', top: 4, left: 0 }}>
            ‹ Назад
          </button>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 8 }}>Бонусы</div>
          <div className="text-sub" style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
            Челленджи • Ежедневный бонус
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {tabs.map((t) => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === t.id ? 'rgba(90,122,245,0.2)' : 'rgba(255,255,255,0.04)', border: tab === t.id ? '2px solid #5a7af5' : '1px solid rgba(255,255,255,0.05)', color: tab === t.id ? '#fff' : '#8e8e9a' }}>
              {t.label}
            </div>
          ))}
        </div>

        {tab === 'today' && (
          <>
            <div className="text-sub" style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 8 }}>
              Челленджи дня
            </div>

            <div className="bonus-row">
              <div className="bonus-icon" style={{ background: 'linear-gradient(135deg, #2a2a80, #151540)' }}>👥</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-value" style={{ fontSize: 15 }}>Приведи друга</div>
                <div className="text-sub" style={{ fontSize: 12 }}>{referrals.length} / 1 друзей</div>
                <div className="bonus-progress">
                  <div style={{ width: `${Math.min(100, referrals.length * 100)}%`, background: '#5a7af5' }} />
                </div>
              </div>
              <div className="bonus-reward" onClick={handleCopy} style={{ cursor: 'pointer', color: referrals.length > 0 ? '#4ade80' : '#fbbf24' }}>
                {copied ? '✓' : `+${formatMoney(REF_WELCOME_BONUS)} 💰`}
              </div>
            </div>

            <div className="bonus-row">
              <div className="bonus-icon" style={{ background: 'linear-gradient(135deg, #5a3a00, #2a1a00)' }}>📸</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-value" style={{ fontSize: 15 }}>Опубликуй историю</div>
                <div className="text-sub" style={{ fontSize: 12 }}>
                  {isStoryCooldown ? `Доступно через ${storyWaitMin} мин` : `+${formatMoney(STORY_SHARE_REWARD)} 💰`}
                </div>
                <div className="bonus-progress">
                  <div style={{ width: isStoryCooldown ? '30%' : '0%', background: '#fbbf24' }} />
                </div>
              </div>
              <button onClick={shareToStory} disabled={isStoryCooldown} className="bonus-btn" style={{ opacity: isStoryCooldown ? 0.4 : 1 }}>
                {isStoryCooldown ? '⏳' : 'Опубликовать'}
              </button>
            </div>

            <div className="bonus-row">
              <div className="bonus-icon" style={{ background: 'linear-gradient(135deg, #1b3b2b, #0f261b)' }}>▶️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-value" style={{ fontSize: 15 }}>Посмотри рекламу</div>
                <div className="text-sub" style={{ fontSize: 12 }}>
                  {adViewsToday} / {dailyAdLimit} раз • доход ×1.5 на след. сбор
                </div>
                <div className="bonus-progress">
                  <div style={{ width: `${(adViewsToday / dailyAdLimit) * 100}%`, background: '#4ade80' }} />
                </div>
              </div>
              <button onClick={claimAdReward} disabled={isAdCooldown || adViewsToday >= dailyAdLimit} className="bonus-btn" style={{ background: 'linear-gradient(180deg, #4ade80, #22c55e)', color: '#0a1a10', opacity: isAdCooldown || adViewsToday >= dailyAdLimit ? 0.4 : 1 }}>
                {adViewsToday >= dailyAdLimit ? 'Лимит' : isAdCooldown ? `${adWaitSec}с` : 'Смотреть'}
              </button>
            </div>

            <div className="text-sub" style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', margin: '20px 0 8px' }}>
              Ежедневный бонус
            </div>

            <div className="bonus-row" onClick={() => { if (dailyStatus.isNewDay) claimDailyReward(); }} style={{ cursor: dailyStatus.isNewDay ? 'pointer' : 'default' }}>
              <div className="bonus-icon" style={{ background: 'linear-gradient(135deg, #5a3a00, #2a1a00)' }}>🎁</div>
              <div style={{ flex: 1 }}>
                <div className="text-value" style={{ fontSize: 15 }}>Ежедневный бонус</div>
                <div className="text-sub" style={{ fontSize: 12 }}>
                  {dailyStatus.isNewDay ? 'Доступно!' : 'Сегодня получено • вернись завтра'}
                </div>
              </div>
              <div style={{ color: dailyStatus.isNewDay ? '#fbbf24' : '#555', fontSize: 18, fontWeight: 800 }}>
                {dailyStatus.isNewDay ? '!' : '✓'}
              </div>
            </div>
          </>
        )}

        {tab === 'career' && (
          <>
            <div className="text-sub" style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>
              Уровни карьеры
            </div>

            {CAREER_LEVELS.map((lvl) => {
              const isDone = player.careerLevel >= lvl.level;
              const isCurrent = player.careerLevel === lvl.level - 1;
              const hasCoins = player.coins >= lvl.reqCoins;
              const hasChars = player.characters.length >= lvl.reqCharacters;
              const hasEarned = (player.totalEarned || 0) >= lvl.reqTotalEarned;
              const isReady = isCurrent && hasCoins && hasChars && hasEarned;

              return (
                <div key={lvl.level} className="bonus-row" style={{ flexDirection: 'column', alignItems: 'stretch', opacity: isDone || isCurrent ? 1 : 0.4, border: isReady ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.05)', background: isReady ? 'rgba(74, 222, 128, 0.1)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 8 }}>
                    <div className="bonus-icon" style={{ background: isDone ? '#0f261b' : '#1a1a21', border: isDone ? '1px solid #4ade80' : 'none' }}>
                      {lvl.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-value" style={{ fontSize: 15, color: isDone ? '#4ade80' : '#fff' }}>
                        {lvl.level}. {lvl.title} {isDone && '✓'}
                      </div>
                      <div className="text-sub" style={{ fontSize: 12 }}>
                        Награда: {formatMoney(lvl.rewardCoins)} 💰 {lvl.rewardVotes > 0 && `+ ${lvl.rewardVotes} 🗳️`}
                      </div>
                    </div>
                    {isCurrent && (
                      <button onClick={claimCareerReward} disabled={!isReady} className="bonus-btn" style={{ background: isReady ? 'linear-gradient(180deg, #4ade80, #22c55e)' : '#2a2a35', color: isReady ? '#0a1a10' : '#888', opacity: isReady ? 1 : 0.6 }}>
                        {isReady ? 'Забрать' : 'Закрыто'}
                      </button>
                    )}
                  </div>

                  {isCurrent && !isDone && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#121216', padding: 10, borderRadius: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: hasCoins ? '#4ade80' : '#ef4444' }}>
                        <span>Монеты на счету:</span>
                        <span>{formatMoney(player.coins)} / {formatMoney(lvl.reqCoins)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: hasChars ? '#4ade80' : '#ef4444' }}>
                        <span>Подданных:</span>
                        <span>{player.characters.length} / {lvl.reqCharacters}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: hasEarned ? '#4ade80' : '#ef4444' }}>
                        <span>Всего нафармлено:</span>
                        <span>{formatMoney(player.totalEarned || 0)} / {formatMoney(lvl.reqTotalEarned)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {tab === 'games' && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎮</div>
            <div className="text-value">Мини-игры в разработке...</div>
            <div className="text-sub" style={{ fontSize: 12, marginTop: 8 }}>Скоро здесь появятся способы заработка!</div>
          </div>
        )}
      </div>
    </div>
  );
}