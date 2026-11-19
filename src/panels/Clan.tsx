import { useState, useEffect } from 'react';
import { Panel, PanelHeader, Div, Input } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { apiGet, apiPost } from '../api/client';
import { notify } from '../utils/notifications';

export function Clan({ onOpenClan }: { onOpenClan: (id: string) => void }) {
  const { player, createClan } = useGame();
  const [name, setName] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [allClans, setAllClans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClans = async () => {
    try {
      const data = await apiGet('/clans');
      setAllClans(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchClans(); }, []);

  const handleCreate = async () => {
    if (!name || !groupLink) return notify('Ошибка', 'Заполни все поля!', 'error');
    await createClan(name, groupLink);
  };

  const handleJoin = async (clanId: string) => {
    try {
      await apiPost('/clan/join', { clanId });
      notify('Успешно', 'Вы вступили в клан!', 'success');
      window.location.reload(); // Перезагрузка для обновления клана в сторе
    } catch (e: any) {
      notify('Отказ', e.message, 'error');
    }
  };

  if (player.clanId) {
    return (
      <Panel id="clan" className="custom-app-bg">
        <PanelHeader style={{ background: 'transparent', color: '#fff' }}>Мой Клан</PanelHeader>
        <Div style={{ paddingBottom: 100, textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛡️</div>
          <div className="text-title" style={{ fontSize: 24, marginBottom: 32 }}>Ты в клане</div>
          <button className="btn-primary" style={{ maxWidth: 300, margin: '0 auto' }} onClick={() => onOpenClan(player.clanId!)}>
            Перейти в мой клан
          </button>
        </Div>
      </Panel>
    );
  }

  return (
    <Panel id="clan" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent', color: '#fff' }}>Кланы</PanelHeader>
      <Div style={{ paddingBottom: 100 }}>
        <div className="glass-panel" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 16, marginBottom: 24 }}>
          <div className="text-title" style={{ fontSize: 20, marginBottom: 12 }}>Создать клан (500 💰)</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" style={{ background: '#1a1a21', borderRadius: 12, border: 'none', color: '#fff' }} />
          <Input value={groupLink} onChange={(e) => setGroupLink(e.target.value)} placeholder="Ссылка на группу ВК" style={{ background: '#1a1a21', borderRadius: 12, border: 'none', color: '#fff', marginTop: 12 }} />
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleCreate} disabled={!name || !groupLink || player.coins < 500}>Создать</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="text-sub" style={{ textTransform: 'uppercase' }}>Существующие кланы</div>
        </div>

        {loading ? <div>Загрузка...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allClans.map((c) => (
              <div key={c.id} className="glass-panel" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                     {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                  </div>
                  <div>
                    <div className="text-value">{c.name}</div>
                    <div className="text-sub" style={{ fontSize: 13 }}>Ур. {c.level} • {c.members_count}/{c.limit} мест</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, marginTop: 0 }} onClick={() => onOpenClan(c.id)}>Инфо</button>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, marginTop: 0, background: '#4ade80', color: '#000' }} onClick={() => handleJoin(c.id)}>Вступить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Div>
    </Panel>
  );
}