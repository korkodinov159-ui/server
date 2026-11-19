import { useState, useEffect } from 'react';
import { Panel, PanelHeader, Div, Avatar, Button, Input } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { apiGet, apiPost } from '../api/client';
import { notify } from '../utils/notifications';

export function ClanDetails({ clanId, go }: { clanId: string; go: (p: string) => void }) {
  const { player } = useGame();
  const [clan, setClan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blacklistId, setBlacklistId] = useState('');

  const fetchClan = async () => {
    try {
      const data = await apiGet(`/clan/${clanId}`);
      setClan(data);
    } catch (e) {
      console.error(e);
      notify('Ошибка', 'Не удалось загрузить данные клана', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchClan(); 
  }, [clanId]);

  const handleAction = async (action: string, targetVkId?: string, extra = {}) => {
    try {
      await apiPost('/clan/action', { clanId, action, targetVkId, ...extra });
      notify('Успешно', 'Действие выполнено', 'success');
      fetchClan();
    } catch (e: any) { 
      notify('Ошибка', e.message || 'Не удалось выполнить действие', 'error'); 
    }
  };

  const handleLeave = async () => {
    try {
      await apiPost('/clan/leave', {});
      window.location.reload();
    } catch (e: any) { 
      notify('Ошибка', e.message || 'Не удалось выйти из клана', 'error'); 
    }
  };

  const handleJoin = async () => {
    try {
      await apiPost('/clan/join', { clanId });
      notify('Успешно', 'Вы вступили в клан!', 'success');
      window.location.reload();
    } catch (e: any) {
      notify('Ошибка', e.message || 'Не удалось вступить в клан', 'error');
    }
  };

  const handleBuy = async (item: string) => {
    try {
      await apiPost('/clan/shop', { clanId, item });
      notify('Куплено', 'Средства списаны из казны', 'success');
      fetchClan();
    } catch (e: any) { 
      notify('Ошибка', e.message || 'Не удалось купить', 'error'); 
    }
  };

  if (loading || !clan) {
    return <div style={{ textAlign: 'center', color: '#888', marginTop: 100 }}>Загрузка клана...</div>;
  }

  const myMemberData = clan.members.find((m: any) => m.vk_id === player.myRefCode);
  const isMember = !!myMemberData;
  const myRole = myMemberData?.clan_role || 'member';
  const isLeader = myRole === 'leader';
  const isDeputy = myRole === 'deputy';
  const canManage = isLeader || isDeputy;

  const myJoinTime = myMemberData?.clan_joined_at || 0;
  const isCooldown = Date.now() - myJoinTime < 24 * 3600 * 1000;

  return (
    <Panel id="clan_details" className="custom-app-bg">
      <PanelHeader before={<Button mode="tertiary" onClick={() => go('top')} style={{ color: '#fff' }}>‹ Назад</Button>}>
        Клан
      </PanelHeader>

      <Div style={{ paddingBottom: 100 }}>
        {/* ШАПКА КЛАНА */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #5a7af5', background: '#1a1a21', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {clan.avatar_url ? <img src={clan.avatar_url} alt="Аватар" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 40 }}>🛡️</div>}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{clan.name}</div>
          <div style={{ color: '#4ade80', fontSize: 14, marginTop: 4 }}>Ур. {clan.level} • +{clan.level}% к доходу</div>
          {isCooldown && isMember && (
            <div style={{ color: '#fbbf24', fontSize: 12, marginTop: 4 }}>⏳ Бонусы клана активируются через 24ч</div>
          )}
        </div>

        {/* КАЗНА */}
        <div className="glass-panel" style={{ padding: 16, marginBottom: 16, border: '1px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-value" style={{ color: '#fbbf24' }}>💰 Казна клана</span>
            <span className="text-value">{clan.treasury?.toLocaleString() || 0} 💰</span>
          </div>
          {canManage && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
               <button className="btn-primary" style={{ padding: 8, fontSize: 12 }} onClick={() => handleBuy('level_up')}>
                 Повысить уровень ({clan.level * 100000} 💰)
               </button>
               <button className="btn-primary" style={{ padding: 8, fontSize: 12, background: '#5a7af5' }} onClick={() => handleBuy('buff_income')}>
                 Буст (300к)
               </button>
            </div>
          )}
        </div>

        {/* МЕСТА */}
        <div className="glass-panel" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="text-value">Мест в клане</span>
            <span className="text-value">{clan.members.length} / {clan.limit}</span>
          </div>
          <div className="text-sub" style={{ fontSize: 12 }}>30 базовых + уровни + купленные</div>
          {canManage && clan.level >= 100 && clan.extra_members_bought < 20 && (
            <button className="btn-primary" style={{ padding: 8, fontSize: 12, marginTop: 12 }} onClick={() => handleBuy('buy_slot')}>
              Купить +1 место (500 000 💰)
            </button>
          )}
        </div>

        {/* УЧАСТНИКИ */}
        <div className="text-sub" style={{ marginBottom: 8, textTransform: 'uppercase' }}>Участники</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {clan.members.map((m: any) => (
            <div key={m.vk_id} className="glass-panel" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar size={40} src={m.avatar} />
                <div>
                  <div className="text-value" style={{ fontSize: 14 }}>
                    {m.name} {m.clan_role === 'leader' ? '👑' : m.clan_role === 'deputy' ? '🛡️' : ''}
                  </div>
                  <div className="text-sub" style={{ fontSize: 11 }}>{m.coins.toLocaleString()} 💰</div>
                </div>
              </div>
              
              {canManage && m.clan_role !== 'leader' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {isLeader && m.clan_role !== 'deputy' && (
                    <button style={{ background: '#5a7af5', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 10, color: '#fff' }} onClick={() => handleAction('set_role', m.vk_id, { role: 'deputy' })}>
                      В замы
                    </button>
                  )}
                  {isLeader && m.clan_role === 'deputy' && (
                    <button style={{ background: '#888', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 10, color: '#fff' }} onClick={() => handleAction('set_role', m.vk_id, { role: 'member' })}>
                      Снять
                    </button>
                  )}
                  {isLeader && (
                    <button style={{ background: '#fbbf24', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 10, color: '#000' }} onClick={() => handleAction('transfer_leader', m.vk_id)}>
                      Глава
                    </button>
                  )}
                  <button style={{ background: '#ef4444', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 10, color: '#fff' }} onClick={() => handleAction('kick', m.vk_id)}>
                    Кик
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ЧС (Черный список) */}
        {canManage && (
          <div style={{ marginBottom: 24 }}>
            <div className="text-sub" style={{ marginBottom: 8, textTransform: 'uppercase' }}>Черный список</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input placeholder="VK ID" value={blacklistId} onChange={e => setBlacklistId(e.target.value)} style={{ background: '#1a1a21', color: '#fff' }} />
              <Button onClick={() => { handleAction('blacklist', blacklistId); setBlacklistId(''); }}>Добавить</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {clan.blacklist?.map((id: string) => (
                <div key={id} style={{ background: 'rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: 8, fontSize: 12, display: 'flex', gap: 6 }}>
                  {id} <span style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleAction('blacklist', id)}>×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* КНОПКИ ДЕЙСТВИЙ (Выйти / Вступить) */}
        {isMember ? (
          !isLeader && (
            <button className="btn-primary" style={{ background: '#ef4444', color: '#fff', marginTop: 16 }} onClick={handleLeave}>
              Выйти из клана
            </button>
          )
        ) : (
          <button className="btn-primary" style={{ background: '#4ade80', color: '#000', marginTop: 24, fontWeight: 800 }} onClick={handleJoin}>
            Вступить в клан
          </button>
        )}

      </Div>
    </Panel>
  );
}