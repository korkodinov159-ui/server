import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';

const TYPES = [
  { type: 'lumber' as const, emoji: '🌲', name: 'Лесопилка', description: 'Древесина' },
  { type: 'mine' as const, emoji: '⛏️', name: 'Шахта', description: 'Руда' },
  { type: 'farm' as const, emoji: '🌾', name: 'Ферма', description: 'Еда' },
  { type: 'port' as const, emoji: '⚓', name: 'Торговый порт', description: 'Монеты и ресурсы' },
];

export function Regions() {
  const { regions, resources, buyRegion, upgradeRegion, collectRegions } = useGame();
  return (
    <Panel id="regions" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent' }}>Регионы</PanelHeader>
      <Div className="page-shell page-content">
        <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <b>💰 {resources.coins.toLocaleString()}</b><b>⛏️ {resources.ore}</b><b>🪵 {resources.wood}</b><b>🍞 {resources.food}</b>
        </div>
        <button className="btn-primary" onClick={() => void collectRegions()}>Собрать ресурсы</button>
        <div className="glass-panel" style={{ marginTop: 16, flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="text-title" style={{ fontSize: 18 }}>Купить регион</div>
          {TYPES.map((item) => <button key={item.type} className="btn-primary" style={{ marginTop: 8 }} onClick={() => void buyRegion(item.type)}>{item.emoji} {item.name} · {item.description}</button>)}
        </div>
        {regions.map((region) => <RegionCard key={region.id} region={region} onUpgrade={() => void upgradeRegion(region.id)} />)}
      </Div>
    </Panel>
  );
}
function RegionCard({ region, onUpgrade }: { region: any; onUpgrade: () => void }) {
  return <div className="glass-panel" style={{ marginTop: 12, display: 'block' }}><div className="text-title" style={{ fontSize: 18 }}>{region.meta.emoji} {region.meta.name}</div><div className="text-sub">Уровень {region.level}/10 · {Math.floor(region.rate)} в час</div><button className="btn-primary" style={{ marginTop: 10 }} onClick={onUpgrade} disabled={region.level >= 10}>{region.level >= 10 ? 'Максимальный уровень' : 'Улучшить'}</button></div>;
}
