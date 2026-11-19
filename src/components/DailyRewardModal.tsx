import { useGame, DAILY_REWARDS } from '../store/gameStore';

interface Props {
  forceOpen: boolean;
  onClose: () => void;
}

export function DailyRewardModal({ forceOpen, onClose }: Props) {
  const { dailyStatus, claimDailyReward } = useGame();

  const visible = forceOpen || dailyStatus.isNewDay;
  if (!visible) return null;

  const handleClaim = () => {
    claimDailyReward();
    onClose();
  };

  return (
    <div className="chest-modal-overlay" style={{ zIndex: 100000 }}>
      <div className="daily-modal-card">
        <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: 22, textAlign: 'center' }}>
          Ежедневный вход
        </h2>
        <p className="text-sub" style={{ textAlign: 'center', marginBottom: 20 }}>
          {dailyStatus.isNewDay
            ? 'Забери награду за вход!'
            : 'Ты уже забрал награду сегодня'}
        </p>

        <div className="daily-strip">
          {DAILY_REWARDS.map((r, i) => {
            const isToday = i === dailyStatus.todayIndex && dailyStatus.isNewDay;
            const isPast = i < dailyStatus.todayIndex || (!dailyStatus.isNewDay && i === dailyStatus.todayIndex);
            return (
              <div
                key={r.day}
                className={`daily-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
              >
                <div className="daily-day-num">{r.day}</div>
                <div className="daily-day-emoji">{r.emoji}</div>
                <div className="daily-day-label">{r.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
          <div className="text-sub">Текущая серия</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>
            🔥 {dailyStatus.streak} / 7
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleClaim}
          disabled={!dailyStatus.isNewDay}
          style={{ marginTop: 8 }}
        >
          {dailyStatus.isNewDay
            ? `Забрать ${dailyStatus.nextReward.coins.toLocaleString()} 💰` +
              (dailyStatus.nextReward.votes ? ` +${dailyStatus.nextReward.votes} 🗳️` : '')
            : 'Забрано'}
        </button>

        {!dailyStatus.isNewDay && (
          <button
            className="btn-primary"
            style={{ background: 'transparent', color: '#888', boxShadow: 'none', marginTop: 8 }}
            onClick={onClose}
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}