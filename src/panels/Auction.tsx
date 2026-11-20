import { useEffect, useMemo, useState } from 'react';
import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { apiGet, apiPost } from '../api/client';



type AuctionLot = {
  id: number;
  emoji: string;
  name: string;
  description: string;
  category: string;
  currentBid: number;
  startBid: number;
  bidders: number;
  endsAt: number;
  rare?: boolean;
  resourceType?: string;
  resourceAmount?: number;
  buyoutPrice?: number;
};

type ServerLot = AuctionLot & { status: string };
type AuctionBid = { id: number; lot_id: number; name: string; emoji: string; amount: number; created_at: number; status: string };


const fmt = (v: number) => v.toLocaleString('ru-RU');
const fmtTime = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function LotCard({ lot, myBid, now, onBid }: { lot: AuctionLot; myBid?: number; now: number; onBid: (l: AuctionLot) => void }) {
  const nextBid = lot.currentBid + Math.max(10000, Math.ceil(lot.currentBid * 0.05));
  const timeLeft = lot.endsAt - now;
  const critical = timeLeft < 30000;
  return (
    <div style={{ background: lot.rare ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(200,140,0,0.08))' : 'rgba(22,22,28,0.85)', border: lot.rare ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 44, width: 56, textAlign: 'center' }}>{lot.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{lot.name}</div>
            {lot.rare && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 8, padding: '3px 8px' }}>⭐</span>}
          </div>
          <div style={{ fontSize: 12, color: '#8e8e9a' }}>{lot.description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 12 }}>
        <span style={{ color: '#8e8e9a' }}>👥 {lot.bidders} • {fmt(lot.startBid)}</span>
        <span style={{ fontWeight: 700, color: critical ? '#ef4444' : '#4ade80' }}>⏱ {fmtTime(timeLeft)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginBottom: myBid ? 12 : 0 }}>
        <div><div style={{ fontSize: 11, color: '#8e8e9a', marginBottom: 4 }}>Ставка</div><div style={{ fontSize: 22, fontWeight: 800, color: '#5a7af5' }}>{fmt(lot.currentBid)}</div></div>
        <button className="btn-primary" style={{ margin: 0, padding: '12px 16px', width: 'auto', fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => onBid(lot)}>Бид<br />{fmt(nextBid)}</button>
      </div>
      {myBid && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 12, padding: 11, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#4ade80' }}>✓ {fmt(myBid)}</div>}
    </div>
  );
}

export function Auction() {
  const [lots, setLots] = useState<AuctionLot[]>([]);
  const [now, setNow] = useState(Date.now());
  const [cat, setCat] = useState('Все');
  const [msg, setMsg] = useState('');
  const [bids, setBids] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<AuctionBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { player } = useGame();


  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    Promise.all([apiGet<ServerLot[]>('/auction/lots'), apiGet<AuctionBid[]>('/auction/history')])
      .then(([serverLots, serverHistory]) => { setLots(serverLots); setHistory(serverHistory); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    return () => clearInterval(t);
  }, []);

  const categoryLabels: Record<string, string> = { Все: 'Все', Ресурсы: 'Ресурсы', Бусты: 'Бусты', Элита: 'Элита', События: 'События', Лутбоксы: 'Лутбоксы' };
  const cats = Object.keys(categoryLabels);

  const visible = useMemo(() => (cat === 'Все' ? lots : lots.filter((l) => l.category === cat)), [cat, lots]);
  const buyResourceLot = async (lot: AuctionLot) => {
    try { await apiPost('/auction/resource-buy', { lotId: lot.id }); setLots((items) => items.filter((item) => item.id !== lot.id)); setMsg('Ресурс куплен'); } catch (e) { setError(e instanceof Error ? e.message : 'Покупка не удалась'); }
  };
  const bid = async (lot: AuctionLot) => {
    const requestId = `${lot.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await apiPost<{ amount: number }>('/auction/bid', { lotId: lot.id, requestId });
      setLots((curr) => curr.map((item) => item.id === lot.id ? { ...item, currentBid: result.amount, bidders: item.bidders + 1 } : item));
      setBids((curr) => ({ ...curr, [lot.id]: result.amount }));
      setHistory((curr) => [{ id: Date.now(), lot_id: lot.id, name: lot.name, emoji: lot.emoji, amount: result.amount, created_at: Date.now(), status: 'active' }, ...curr]);
      setMsg(`✓ Ставка: ${fmt(result.amount)}`);
      setTimeout(() => setMsg(''), 2500);
    } catch (e) { setError(e instanceof Error ? e.message : 'Ставка не принята'); }
  };

  return (
    <Panel id="auction" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent' }}>Аукцион</PanelHeader>
      <Div className="page-shell auction-page" style={{ padding: '0 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'rgba(22,22,28,0.85)', border: '1px solid rgba(90,122,245,0.3)', borderRadius: 16, padding: '12px 16px', marginBottom: 16 }}><span style={{ color: '#8e8e9a', fontSize: 12, marginRight: 8 }}>Баланс</span><strong style={{ color: '#fff', fontSize: 18 }}>{player.coins.toLocaleString('ru-RU')} 💰</strong></div>
        {error && <div style={{ color: '#fb7185', padding: 12, textAlign: 'center' }}>{error}</div>}
        {msg && <div style={{ background: 'rgba(74,222,128,.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,.35)', borderRadius: 16, padding: 14, marginBottom: 16, textAlign: 'center', fontWeight: 700 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, marginBottom: 16 }}>{cats.map((item) => <button key={item} onClick={() => setCat(item)} style={{ border: 'none', borderRadius: 20, padding: '10px 16px', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600, color: cat === item ? '#fff' : '#8e8e9a', background: cat === item ? 'linear-gradient(180deg, #6a8aff, #4b68e6)' : 'rgba(42,42,53,.8)' }}>{item}</button>)}</div>
        {loading ? <div style={{ textAlign: 'center', color: '#8e8e9a', padding: 40 }}>Загрузка торгов...</div> : visible.map((lot) => lot.category === 'Ресурсы' ? <LotCard key={lot.id} lot={lot} myBid={bids[lot.id]} now={now} onBid={buyResourceLot} /> : <LotCard key={lot.id} lot={lot} myBid={bids[lot.id]} now={now} onBid={bid} />)}
        {!loading && history.length > 0 && <div style={{ marginTop: 20 }}><div className="text-value" style={{ marginBottom: 10 }}>История ставок</div>{history.slice(0, 10).map((item) => <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(22,22,28,.7)', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12 }}><span>{item.emoji} {item.name}</span><b>{fmt(item.amount)} 💰</b></div>)}</div>}
      </Div>
    </Panel>
  );
}

