import { useState } from 'react';
import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';

export function Shop() {
  const { player, buyLimitCoins, buyLimitVotes, buyBoost, buyFrame, buyCoinsForVotes } = useGame();
  const [tab, setTab] = useState<'boosts' | 'frames' | 'coins'>('boosts');

  return (
    <Panel id="shop" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent' }}>Магазин</PanelHeader>
      
      <Div className="page-shell shop-page" style={{ padding: '0 16px', paddingBottom: 100 }}>
        
        <header className="shop-hero">
          <div className="shop-eyebrow">ПЕРСОНАЛИЗАЦИЯ · БОНУСЫ · ПАКЕТЫ</div>
          <h1>Магазин</h1>
          <p>Усиль свой профиль и выделись среди других игроков</p>
          <div className="shop-wallet">
            <div><span>Монеты</span><strong>{player.coins.toLocaleString('ru-RU')}</strong></div>
            <div className="shop-wallet-divider" />
            <div><span>Голоса VK</span><strong className="shop-votes">{player.votes.toLocaleString('ru-RU')}</strong></div>
          </div>
        </header>

        <div className="shop-promo"><span>Оплата голосами ВКонтакте</span><b>Защищено VK</b></div>

        <div className="shop-tabs" role="tablist" aria-label="Разделы магазина">
          <button type="button" role="tab" aria-selected={tab === 'boosts'} className={tab === 'boosts' ? 'shop-tab shop-tab-active' : 'shop-tab'} onClick={() => setTab('boosts')}>Бусты</button>
          <button type="button" role="tab" aria-selected={tab === 'frames'} className={tab === 'frames' ? 'shop-tab shop-tab-active' : 'shop-tab'} onClick={() => setTab('frames')}>Украшения</button>
          <button type="button" role="tab" aria-selected={tab === 'coins'} className={tab === 'coins' ? 'shop-tab shop-tab-active' : 'shop-tab'} onClick={() => setTab('coins')}>Монеты</button>
        </div>

        {tab === 'boosts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 16 }}>
              <div className="text-value" style={{ marginBottom: 8 }}>👥 Расширение мест (+1000)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1, marginTop: 0, padding: 10, fontSize: 13 }} onClick={buyLimitCoins}>
                  {(50000 * Math.pow(3, player.limitLevel)).toLocaleString()} 💰
                </button>
                <button className="btn-primary" style={{ flex: 1, marginTop: 0, padding: 10, fontSize: 13, background: '#5a7af5' }} onClick={buyLimitVotes}>
                  {(100 * Math.pow(3, player.limitLevel)).toLocaleString()} 🗳️
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="text-value">⛓️ Кнут</div>
                <div className="text-sub">Удваивает доход</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }} onClick={() => buyBoost('whip')} disabled={player.hasWhip}>
                {player.hasWhip ? 'Куплено' : '50 🗳️'}
              </button>
            </div>

            <div className="glass-panel" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="text-value">🔗 Цепи</div>
                <div className="text-sub">Рабов нельзя купить</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }} onClick={() => buyBoost('chains')} disabled={player.hasChains}>
                {player.hasChains ? 'Куплено' : '50 🗳️'}
              </button>
            </div>

            <div className="glass-panel" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="text-value">🛡️ Щит</div>
                <div className="text-sub">Тебя нельзя купить</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }} onClick={() => buyBoost('shield')} disabled={player.hasShield}>
                {player.hasShield ? 'Куплено' : '50 🗳️'}
              </button>
            </div>

            <div className="glass-panel" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="text-value">☂️ Зонтик</div>
                <div className="text-sub">Защита от камней</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }} onClick={() => buyBoost('umbrella')} disabled={player.hasUmbrella}>
                {player.hasUmbrella ? 'Куплено' : '50 🗳️'}
              </button>
            </div>

            <div className="glass-panel" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="text-value">🪨 Большой камень</div>
                <div className="text-sub">Заморозит доход цели на 12ч</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0, background: '#ef4444' }} onClick={() => buyBoost('stone')}>
                Купить
              </button>
            </div>
          </div>
        )}

        {tab === 'frames' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="shop-frames-grid">
              {[
                { id: 'gold', name: 'Золотая рамка', color: '#FFD700', price: 20, description: 'Тёплое сияние' },
                { id: 'neon', name: 'Неоновая рамка', color: '#00FFFF', price: 40, description: 'Холодный неон' },
                { id: 'flame', name: 'Огненная рамка', color: '#FF4500', price: 50, description: 'Пылающий стиль' },
              ].map((frame) => (
                <div key={frame.id} className={`shop-frame-card ${player.avatarFrame === frame.id ? 'shop-frame-selected' : ''}`}>
                  <div className="shop-frame-preview" style={{ borderColor: frame.color, boxShadow: `0 0 20px ${frame.color}55` }}><div className="shop-frame-avatar" /></div>
                  <div className="shop-frame-name">{frame.name}</div>
                  <div className="shop-frame-description">{player.avatarFrame === frame.id ? 'Надета' : frame.description}</div>
                  <button type="button" className="shop-frame-buy" disabled={player.avatarFrame === frame.id} onClick={() => void buyFrame(frame.id as 'gold' | 'neon' | 'flame')}>
                    {player.avatarFrame === frame.id ? '✓ Надета' : `${frame.price} ⚡`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'coins' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { coins: 450000, votes: 1 },
              { coins: 3245000, votes: 7 },
              { coins: 9900000, votes: 20 },
              { coins: 25200000, votes: 50 },
              { coins: 54000000, votes: 100 },
              { coins: 360000000, votes: 500 },
              { coins: 900000000, votes: 1000 },
            ].map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ justifyContent: 'space-between' }}>
                <div className="text-value" style={{ color: '#fbbf24' }}>💰 {item.coins.toLocaleString()}</div>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', marginTop: 0, background: '#5a7af5' }} onClick={() => void buyCoinsForVotes(item.coins, item.votes)}>
                  {item.votes} 🗳️
                </button>
              </div>
            ))}
          </div>
        )}

      </Div>
    </Panel>
  );
}