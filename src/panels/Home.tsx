import { useState, useEffect } from 'react';
import { Panel, Div, Avatar, Input } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { useProfile } from '../context/ProfileContext';
import { ChestModal } from '../components/ChestModal';
import { SlaveProfileModal } from '../components/SlaveProfileModal';
import { JudgmentTimer } from '../components/JudgmentTimer';
import { Character } from '../types';
import { calcCurrentPrice, calcGiveAwayPayout, calcSellerPayout, isJudgmentDayNow } from '../config';
import bridge from '@vkontakte/vk-bridge';
import { Icon24Coins, Icon24CubeBoxOutline } from '@vkontakte/icons';

export function Home() {
  const {
    player, incomePerHour, effectiveIncomePerHour, displayCoins, adBuffActive,
    releaseCharacter, sellCharacter, giveAwayCharacter, openChest, claimIncome, buyoutSelf,
  } = useGame();
  const { openProfile } = useProfile();

  const [search, setSearch] = useState('');
  const [chestPrize, setChestPrize] = useState<Character | null>(null);
  const [selectedSlave, setSelectedSlave] = useState<Character | null>(null);
  const [myVkId, setMyVkId] = useState('local-test-user');

  useEffect(() => {
    bridge.send('VKWebAppGetUserInfo')
      .then((info) => setMyVkId(info.id.toString()))
      .catch(() => {});
  }, []);

  const filtered = player.characters.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMyProfileClick = () => {
    openProfile({
      vk_id: myVkId, name: player.name, avatar: player.avatar,
      coins: player.coins, income: incomePerHour,
      slaves: player.characters,
      clanName: player.clanId ? 'Мой Клан' : 'Без клана',
    });
  };

  const isJD = isJudgmentDayNow();
  const fmt = (n: number) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + 'M'
    : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K'
    : n.toLocaleString();

  return (
    <Panel id="home" className="custom-app-bg">
      <Div style={{ padding: '0 16px', paddingBottom: 100 }}>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
          <div onClick={handleMyProfileClick} style={{ position: 'relative', borderRadius: '50%', padding: 3, cursor: 'pointer', background: 'linear-gradient(45deg, #FFD700, #FFA500)' }}>
            <Avatar size={76} src={player.avatar} style={{ border: '3px solid #3a2210' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#5a7af5', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #0f0f13' }}>⭐</div>
          </div>
          <div style={{ marginLeft: 16 }}>
            <div className="text-title">{player.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 6, background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20 }}>
              <span style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}> <Icon24Coins /> {player.coins.toLocaleString()}</span>
            </div>
            {player.ownedByVkId && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#ef4444' }}>
                ⛓️ Под властью — доход −50%
              </div>
            )}
          </div>
        </div>

        <JudgmentTimer />

        {/* Сбор дохода */}
        <div className="glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 16, marginTop: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="text-value" style={{ fontSize: 14 }}>Накоплено</span>
            <span className="text-value" style={{ color: '#4ade80', fontSize: 16 }}>
              +{displayCoins.toLocaleString()} 💰
              {adBuffActive && <span style={{ color: '#fbbf24', marginLeft: 6 }}>×1.5</span>}
            </span>
          </div>
          <div className="text-sub" style={{ fontSize: 11, marginBottom: 12 }}>
            Доход: {effectiveIncomePerHour.toLocaleString()} 💰/ч
            {player.ownedByVkId && <span style={{ color: '#ef4444' }}> (штраф −50%)</span>}
            {player.isDonutPatron && <span style={{ color: '#fbbf24' }}> • накопление 36ч</span>}
            {!player.isDonutPatron && <span> • накопление 24ч</span>}
          </div>
          <button className="btn-primary" onClick={() => claimIncome()} disabled={displayCoins < 1}>
            Собрать {displayCoins.toLocaleString()} 💰
          </button>
        </div>

        {player.ownedByVkId && (
          <div className="glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 16, marginBottom: 16, border: '1px solid #ef4444' }}>
            <div className="text-value" style={{ marginBottom: 8 }}>⛓️ Ты под властью игрока</div>
            <div className="text-sub" style={{ fontSize: 12, marginBottom: 12 }}>
              Выкупи себя, чтобы вернуть полный доход
            </div>
            <button className="btn-primary" style={{ background: '#ef4444' }} onClick={buyoutSelf}>
              Выкупиться
            </button>
          </div>
        )}

        <div style={{ marginTop: 24, marginBottom: 12 }}>
          <div className="text-sub" style={{ letterSpacing: 1, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Сундуки</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="glass-panel" style={{ flex: 1, flexDirection: 'column', padding: 12, textAlign: 'center', cursor: 'pointer' }} onClick={() => { const p = openChest('common'); if (p) setChestPrize(p); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}><Icon24CubeBoxOutline /></div>
              <div className="text-value" style={{ fontSize: 14 }}>Обычный</div>
              <div className="text-sub" style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>5 000 <Icon24Coins /></div>
            </div>
            <div className="glass-panel" style={{ flex: 1, flexDirection: 'column', padding: 12, textAlign: 'center', border: '1px solid #5a7af5', cursor: 'pointer' }} onClick={() => { const p = openChest('gold'); if (p) setChestPrize(p); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}><Icon24CubeBoxOutline /></div>
              <div className="text-value" style={{ fontSize: 14 }}>Золотой</div>
              <div className="text-sub" style={{ fontSize: 11, color: '#5a7af5', marginTop: 4 }}>50 🗳️</div>
            </div>
            <div className="glass-panel" style={{ flex: 1, flexDirection: 'column', padding: 12, textAlign: 'center', border: '1px solid #ef4444', cursor: 'pointer' }} onClick={() => { const p = openChest('imperial'); if (p) setChestPrize(p); }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}><Icon24CubeBoxOutline /></div>
              <div className="text-value" style={{ fontSize: 14 }}>Империя</div>
              <div className="text-sub" style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>500 🗳️</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-sub" style={{ letterSpacing: 1, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Подданные</div>
          <div className="text-sub" style={{ fontSize: 14 }}>{player.characters.length} / {player.maxCharacters}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Input placeholder="Поиск по имени" value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: '#1a1a21', borderRadius: 12, border: 'none', color: '#fff' }} className="custom-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((ch) => {
            const currentPrice = calcCurrentPrice(ch.income, ch.resaleCount || 0, !!ch.boughtBySelf);
            const canSell = currentPrice < 20_000_000;
            const givePayout = calcGiveAwayPayout(ch.income, ch.resaleCount || 0, !!ch.boughtBySelf, isJD);
            const sellerPayout = calcSellerPayout(ch.income);

            return (
              <div
                key={ch.id}
                className="glass-panel"
                style={{ padding: '12px 16px', borderRadius: 16, marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => setSelectedSlave(ch)}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <Avatar size={48} src={ch.avatar} style={{ border: '2px solid #2a2a35', flexShrink: 0 }} />
                  <div style={{ marginLeft: 12, minWidth: 0 }}>
                    <div className="text-value" style={{ fontSize: 15, fontWeight: 600 }}>{ch.name}</div>
                    <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                      +{ch.income} <Icon24Coins style={{ verticalAlign: 'middle', width: 12, height: 12 }} /> / ч
                    </div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                      Цена: {fmt(currentPrice)} {ch.boughtBySelf ? '• выкуплен' : ''}{ch.resaleCount > 0 ? ` • ×${ch.resaleCount}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {canSell && (
                    <button
                      onClick={(e) => { e.stopPropagation(); sellCharacter(ch.id); }}
                      style={{
                        background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24',
                        border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 20,
                        padding: '6px 10px', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                      }}
                      title={`Продажа на рынок: +${sellerPayout.toLocaleString()} 💰`}
                    >
                      Продать
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); giveAwayCharacter(ch.id); }}
                    style={{
                      background: givePayout > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: givePayout > 0 ? '#4ade80' : '#888',
                      border: givePayout > 0 ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 20, padding: '6px 10px', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                    }}
                    title={givePayout > 0 ? `Отдать: +${givePayout.toLocaleString()} 💰${isJD ? ' (Судный день ×0.5)' : ''}` : 'Цена ≥ 500k — без выплаты'}
                  >
                    {givePayout > 0 ? 'Отдать' : 'Освободить'}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Никого не найдено</div>}
        </div>

      </Div>

      <ChestModal key={chestPrize ? chestPrize.id : 'empty'} prize={chestPrize} onClose={() => setChestPrize(null)} />

      <SlaveProfileModal
        slave={selectedSlave}
        onClose={() => setSelectedSlave(null)}
        onRelease={(id) => { releaseCharacter(id); setSelectedSlave(null); }}
        onGiveAway={(id) => { giveAwayCharacter(id); setSelectedSlave(null); }}
        onSell={(id) => { sellCharacter(id); setSelectedSlave(null); }}
      />
    </Panel>
  );
}