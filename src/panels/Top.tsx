import { useEffect, useMemo, useState } from 'react';
import { Panel, PanelHeader, Div, Avatar } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { useProfile } from '../context/ProfileContext';
import { useGame } from '../store/gameStore';
import { apiGet } from '../api/client';
import { Icon24Users, Icon24CupOutline } from '@vkontakte/icons';

interface TopPlayer {
  vk_id: string;
  name: string;
  avatar: string;
  coins: number;
  income: number;
  slaves: any[];
  total_earned: number;
  hasShield: boolean;
  clan_name?: string | null;
}

interface TopClan {
  id: string;
  name: string;
  avatar_url?: string;
  total_earned: number;
}

const RANK_COLORS = ['#fbbf24', '#cbd5e1', '#cd7f32'];
const RANK_LABELS = ['#1', '#2', '#3'];

function getSeasonEnd(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 0, 0, 0).getTime();
}

function formatMoney(num: number): string {
  const n = Number(num) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toString();
}

function formatTimeLeft(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { d, h, m, s };
}

export function Top({ go, onOpenClan }: { go: (p: string) => void; onOpenClan: (id: string) => void }) {
  const { openProfile } = useProfile();
  const { player } = useGame();
  const [myVkId, setMyVkId] = useState<string>('');

  useEffect(() => {
    bridge
      .send('VKWebAppGetUserInfo')
      .then((info) => setMyVkId(info.id.toString()))
      .catch(() => setMyVkId(''));
  }, []);

  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [topClans, setTopClans] = useState<TopClan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'players' | 'clans' | 'auction'>('players');
  const [nowTs, setNowTs] = useState(Date.now());

  const seasonEnd = useMemo(() => getSeasonEnd(), []);
  const seasonStart = useMemo(() => seasonEnd - 7 * 24 * 60 * 60 * 1000, [seasonEnd]);
  const seasonProgress = Math.min(100, Math.max(0, ((nowTs - seasonStart) / (seasonEnd - seasonStart)) * 100));
  const timeLeft = formatTimeLeft(seasonEnd - nowTs);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = () => {
      Promise.all([
        apiGet<TopPlayer[]>('/top').catch(() => []),
        apiGet<TopClan[]>('/clans').catch(() => []),
      ])
        .then(([pd, cd]) => {
          const serverPlayers = Array.isArray(pd) ? pd : [];
          const serverClans = Array.isArray(cd) ? cd : [];
          const playersById = new Map(serverPlayers.map((item) => [item.vk_id, item]));
          const clansById = new Map(serverClans.map((item) => [item.id, item]));
          setTopPlayers([...playersById.values()].sort((a, b) => b.coins - a.coins));
          setTopClans([...clansById.values()].sort((a, b) => b.total_earned - a.total_earned));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    load();
    const refresh = setInterval(load, 30000);
    return () => clearInterval(refresh);
  }, []);

  const isCurrentPlayer = (candidate: TopPlayer) =>
    candidate.vk_id === myVkId ||
    (!!player.name && candidate.name === player.name) ||
    (!!player.avatar && candidate.avatar === player.avatar) ||
    (player.name !== 'Загрузка...' && candidate.name === player.name) ||
    (player.coins > 0 && candidate.coins === player.coins);

  const top3 = topPlayers.slice(0, 3);
  const rest = topPlayers.slice(3).filter((p) => !isCurrentPlayer(p));
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as TopPlayer[];
  const myRank = useMemo(
    () => topPlayers.findIndex((p) => isCurrentPlayer(p)),
    [topPlayers, myVkId, player.name, player.avatar],
  );

  const openPlayer = (p: TopPlayer) =>
    openProfile({
      vk_id: p.vk_id,
      name: p.name,
      avatar: p.avatar,
      coins: p.coins,
      income: p.income,
      slaves: p.slaves || [],
      clanName: p.clan_name || undefined,
    });

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: '12px 0',
    textAlign: 'center' as const,
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    background: active ? '#1a1a21' : 'transparent',
    border: active ? '2px solid #5a7af5' : '1px solid rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#8e8e9a',
  });

  const timeFmt =
    String(timeLeft.h).padStart(2, '0') +
    ':' +
    String(timeLeft.m).padStart(2, '0') +
    ':' +
    String(timeLeft.s).padStart(2, '0');
  const seasonHint =
    timeLeft.d > 0
      ? 'Сезон завершится через ' + timeLeft.d + ' д ' + timeLeft.h + ' ч'
      : 'Финал сезона через ' + timeLeft.h + ' ч ' + timeLeft.m + ' мин';

  const SeasonBanner = ({ hint }: { hint: string }) => (
    <div className="season-banner">
      <div className="season-banner-top">
        <span className="season-banner-title">
          <Icon24CupOutline style={{ verticalAlign: 'middle', marginRight: 4 }} />
          До конца сезона
        </span>
        <span className="season-banner-time">
          {timeLeft.d > 0 ? timeLeft.d + 'д ' : ''}
          {timeFmt}
        </span>
      </div>
      <div className="season-progress">
        <div className="season-progress-fill" style={{ width: seasonProgress + '%' }} />
      </div>
      <div className="season-banner-hint">{hint}</div>
    </div>
  );

  return (
    <Panel id="top" className="custom-app-bg">
      <PanelHeader style={{ background: 'transparent' }}>Рейтинг</PanelHeader>
      <Div className="page-shell ranking-page" style={{ padding: '0 16px', paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="text-title" style={{ fontSize: 28 }}>
            Рейтинг
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={tabStyle(activeTab === 'players')} onClick={() => setActiveTab('players')}>
            Игроки
          </div>
          <div style={tabStyle(activeTab === 'clans')} onClick={() => setActiveTab('clans')}>
            Кланы
          </div>
          <div style={tabStyle(activeTab === 'auction')} onClick={() => setActiveTab('auction')}>
            Аукцион
          </div>
        </div>

        {activeTab === 'players' && (
          <>
            <SeasonBanner hint={seasonHint} />

            {loading ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 50 }}>Загрузка...</div>
            ) : topPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 50 }}>Рейтинг пока пуст</div>
            ) : (
              <>
                <div className="podium">
                  {podiumOrder.map((p) => {
                    const place = top3.indexOf(p) + 1;
                    const isMe = p.vk_id === myVkId;
                    const isFirst = place === 1;
                    const cls = 'podium-item' + (isFirst ? ' podium-first' : '') + (isMe ? ' is-me' : '');
                    return (
                      <div key={p.vk_id} className={cls} onClick={() => openPlayer(p)}>
                        {isFirst && <div className="podium-crown">👑</div>}
                        <div className="podium-avatar-wrap" style={{ borderColor: RANK_COLORS[place - 1] }}>
                          <Avatar size={isFirst ? 80 : 64} src={p.avatar} />
                          <div className="podium-rank-badge" style={{ background: RANK_COLORS[place - 1] }}>
                            {RANK_LABELS[place - 1]}
                          </div>
                        </div>
                        <div className="podium-name">{p.name}</div>
                        <div className="podium-coins">{formatMoney(p.coins)} 💰</div>
                        {isMe && <div className="podium-you-tag">ВЫ</div>}
                      </div>
                    );
                  })}
                </div>

                {myRank >= 0 && (
                  <div className="my-rank-card my-rank-sticky">
                    <div className="my-rank-avatar">
                      <Avatar size={40} src={player.avatar} />
                    </div>
                    <div className="my-rank-info">
                      <div className="my-rank-name">
                        {player.name} <span className="my-rank-you">Это вы</span>
                      </div>
                      <div className="my-rank-meta">
                        <span>{formatMoney(player.coins)} 💰</span>
                        <span>
                          <Icon24Users width={12} height={12} /> {player.characters ? player.characters.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className="my-rank-pos">#{myRank + 1}</div>
                  </div>
                )}

                <div className="top-list ranking-scroll-list">
                  {rest.map((p, index) => {
                    const place = index + 4;
                    const cls = 'top-row';
                    return (
                      <div key={p.vk_id} className={cls} onClick={() => openPlayer(p)}>
                        <div className="top-row-place">#{place}</div>
                        <div className="top-row-avatar">
                          <Avatar size={44} src={p.avatar} />
                        </div>
                        <div className="top-row-main">
                          <div className="top-row-name">
                            {p.name}
                            {p.hasShield ? ' 🛡️' : ''}
                            {isCurrentPlayer(p) && <span className="top-row-you">Вы</span>}
                          </div>
                          <div className="top-row-meta">
                            <span>{formatMoney(p.coins)} 💰</span>
                            <span>
                              <Icon24Users width={12} height={12} /> {p.slaves ? p.slaves.length : 0}
                            </span>
                          </div>
                        </div>
                        {place <= 10 && <div className="top-row-hot">🔥</div>}
                      </div>
                    );
                  })}
                </div>

                {myRank < 0 && <div className="top-list-hint">Сыграй ещё, чтобы попасть в рейтинг</div>}
              </>
            )}
          </>
        )}

        {activeTab === 'clans' && (
          <>
            <SeasonBanner hint="Рейтинг кланов по суммарному нафармленному" />
            <div className="clan-podium">
              {[topClans[1], topClans[0], topClans[2]].filter(Boolean).map((c) => {
                const place = topClans.indexOf(c) + 1;
                const isMine = c.id === player.clanId;
                return (
                  <div
                    key={c.id}
                    className={`clan-podium-item${place === 1 ? ' clan-podium-first' : ''}${isMine ? ' is-me' : ''}`}
                    onClick={() => onOpenClan(c.id)}
                  >
                    {place === 1 && <div className="clan-podium-crown">👑</div>}
                    <div className="clan-emblem" style={{ borderColor: RANK_COLORS[place - 1] }}>
                      {c.avatar_url ? <img src={c.avatar_url} alt="" /> : <span>🛡️</span>}
                      <div className="clan-rank-badge" style={{ background: RANK_COLORS[place - 1] }}>
                        {RANK_LABELS[place - 1]}
                      </div>
                    </div>
                    <div className="clan-podium-name">{c.name}</div>
                    <div className="clan-podium-coins">{formatMoney(c.total_earned || 0)} 💰</div>
                    {isMine && <div className="podium-you-tag">ВАШ КЛАН</div>}
                  </div>
                );
              })}
            </div>

            {player.clanId && topClans.some((c) => c.id === player.clanId) && (
              <div className="my-rank-card clan-my-rank">
                <div className="clan-my-emblem">🛡️</div>
                <div className="my-rank-info">
                  <div className="my-rank-name">
                    {topClans.find((c) => c.id === player.clanId)?.name}{' '}
                    <span className="my-rank-you">Ваш клан</span>
                  </div>
                  <div className="my-rank-meta">
                    <span>{formatMoney(topClans.find((c) => c.id === player.clanId)?.total_earned || 0)} 💰</span>
                  </div>
                </div>
                <div className="my-rank-pos">#{topClans.findIndex((c) => c.id === player.clanId) + 1}</div>
              </div>
            )}

            <div className="top-list">
              {topClans.slice(3).map((c, index) => {
                const place = index + 4;
                const isMine = c.id === player.clanId;
                return (
                  <div key={c.id} className={`top-row${isMine ? ' is-me' : ''}`} onClick={() => onOpenClan(c.id)}>
                    <div className="top-row-place">#{place}</div>
                    <div className="top-row-avatar clan">
                      {c.avatar_url ? <img src={c.avatar_url} alt="" /> : <span style={{ fontSize: 22 }}>🛡️</span>}
                    </div>
                    <div className="top-row-main">
                      <div className="top-row-name">
                        {c.name}
                        {isMine && <span className="top-row-you">Ваш клан</span>}
                      </div>
                      <div className="top-row-meta">
                        <span>{formatMoney(c.total_earned || 0)} 💰</span>
                      </div>
                    </div>
                    {place <= 10 && <div className="top-row-hot">🔥</div>}
                  </div>
                );
              })}
            </div>
            <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => go('clan')}>
              Создать клан
            </button>
          </>
        )}

        {activeTab === 'auction' && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <div style={{ fontSize: 48 }}>🔨</div>
            <div className="text-value" style={{ fontSize: 20, marginTop: 10 }}>Великий аукцион</div>
            <div className="text-sub" style={{ marginTop: 8 }}>Откройте вкладку «Аукцион», чтобы участвовать в торгах.</div>
            <button className="btn-primary" style={{ marginTop: 18 }} onClick={() => go('auction')}>Перейти к торгам</button>
          </div>
        )}
      </Div>
    </Panel>
  );
}