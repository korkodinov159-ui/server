import { useState } from 'react';
import { Panel, PanelHeader, Div, Avatar, Input } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { calcPower } from '../config';

export function Collection() {
  const { player, releaseCharacter } = useGame();
  const [search, setSearch] = useState('');

  // Фильтрация по поиску
  const filtered = player.characters.filter((ch) => 
    ch.name.toLowerCase().includes(search.toLowerCase())
  );

  // Считаем общий доход в час от этих рабов
  const totalIncome = player.characters.reduce((sum, ch) => sum + Math.floor(calcPower(ch.basePower, ch.level, ch.rarity) / 10), 0);

  return (
    <Panel id="collection" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent' }}>Подданные</PanelHeader>

      <Div style={{ padding: '0 16px' }}>
        
        {/* Заголовок с суммой */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="text-sub" style={{ letterSpacing: 1, fontSize: 12, fontWeight: 700 }}>ПОДДАННЫЕ</div>
          <div className="text-sub" style={{ fontSize: 14 }}>{totalIncome.toLocaleString()}</div>
        </div>

        {/* Поиск */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Input 
            placeholder="Поиск" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: '#1a1a21', borderRadius: 12, border: 'none' }}
            className="custom-input"
          />
          <button style={{ background: '#1a1a21', border: 'none', borderRadius: 12, width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer' }}>
            ≡
          </button>
        </div>

        {/* Список рабов */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((ch) => {
            const charIncome = Math.floor(calcPower(ch.basePower, ch.level, ch.rarity) / 10);
            
            return (
              <div key={ch.id} className="glass-panel" style={{ padding: '12px 16px', borderRadius: 16, marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Avatar size={48} src={ch.avatar} style={{ border: '2px solid #2a2a35' }} />
                  <div style={{ marginLeft: 12 }}>
                    <div className="text-value" style={{ fontSize: 16, color: '#e2e2e2' }}>{ch.name}</div>
                    <div style={{ color: '#4ade80', fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                      +{charIncome} 💰 / ч
                    </div>
                  </div>
                </div>
                
                {/* Кнопка Отпустить */}
                <button 
                  onClick={() => releaseCharacter(ch.id)}
                  style={{ 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    color: '#4ade80', 
                    border: '1px solid rgba(34, 197, 94, 0.3)', 
                    borderRadius: 20, 
                    padding: '8px 16px', 
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  Отпустить
                </button>
              </div>
            );
          })}
          
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
              Никого не найдено
            </div>
          )}
        </div>
      </Div>
    </Panel>
  );
}