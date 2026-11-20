import { useState } from 'react';
import { AppRoot, ConfigProvider, AdaptivityProvider } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import './styles.css';

import { GameProvider, useGame } from './store/gameStore';
import { ProfileProvider } from './context/ProfileContext';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { ToastViewport } from './components/ToastViewport';

import { Market } from './panels/Market';
import { Profile } from './panels/Profile';
import { Top } from './panels/Top';
import { Auction } from './panels/Auction';
import { Shop } from './panels/Shop';

import { Regions } from './panels/Regions';


import { ClanDetails } from './panels/ClanDetails';
import { Clan } from './panels/Clan';

import { Icon24SartOutline, Icon24Market, Icon24CupOutline, Icon24User, Icon24CubeBoxOutline } from '@vkontakte/icons';

// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ РїРѕРєР°Р· РµР¶РµРґРЅРµРІРЅРѕР№ РЅР°РіСЂР°РґС‹ РїСЂРё Р·Р°С…РѕРґРµ
function DailyAutoOpener() {
  const { dailyStatus } = useGame();
  const [closed, setClosed] = useState(false);
  if (closed || !dailyStatus.isNewDay) return null;
  return <DailyRewardModal forceOpen onClose={() => setClosed(true)} />;
}

export function App() {
  // РўРµРїРµСЂСЊ СЃС‚Р°СЂС‚РѕРІР°СЏ РїР°РЅРµР»СЊ вЂ” profile
  const [activePanel, setActivePanel] = useState('profile');
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <GameProvider>
            <ProfileProvider>

              {activePanel === 'profile' && <Profile go={setActivePanel} />}
              {activePanel === 'market' && <Market />}
              {activePanel === 'top' && (
                <Top
                  go={setActivePanel}
                  onOpenClan={(id) => {
                    setSelectedClanId(id);
                    setActivePanel('clan_details');
                  }}
                />
              )}
              {activePanel === 'clan' && (
                <Clan
                  onOpenClan={(id) => {
                    setSelectedClanId(id);
                    setActivePanel('clan_details');
                  }}
                />
              )}
              {activePanel === 'clan_details' && selectedClanId && (
                <ClanDetails clanId={selectedClanId} go={setActivePanel} />
              )}
              {activePanel === 'auction' && <Auction />}
              {activePanel === 'regions' && <Regions />}

              {activePanel === 'shop' && <Shop />}

              <DailyAutoOpener />
              <PlayerProfileModal />
              <ToastViewport />

              <nav className="custom-tabbar" aria-label="РћСЃРЅРѕРІРЅР°СЏ РЅР°РІРёРіР°С†РёСЏ">
                <button type="button" className={`tab-item ${activePanel === 'profile' ? 'active' : ''}`} aria-current={activePanel === 'profile' ? 'page' : undefined} onClick={() => setActivePanel('profile')}>
                  <span className="tab-icon" aria-hidden="true"><Icon24User /></span><span>РџСЂРѕС„РёР»СЊ</span>
                </button>
                <button type="button" className={`tab-item ${activePanel === 'top' || activePanel === 'clan_details' || activePanel === 'clan' ? 'active' : ''}`} aria-current={activePanel === 'top' || activePanel === 'clan_details' || activePanel === 'clan' ? 'page' : undefined} onClick={() => setActivePanel('top')}>
                  <span className="tab-icon" aria-hidden="true"><Icon24CupOutline /></span><span>РўРѕРї</span>
                </button>
                <button type="button" className={`tab-item ${activePanel === 'auction' ? 'active' : ''}`} aria-current={activePanel === 'auction' ? 'page' : undefined} onClick={() => setActivePanel('auction')}>
                  <span className="tab-icon" aria-hidden="true"><Icon24CubeBoxOutline /></span><span>РђСѓРєС†РёРѕРЅ</span>
                </button>
                <button type="button" className={`tab-item ${activePanel === 'market' ? 'active' : ''}`} aria-current={activePanel === 'market' ? 'page' : undefined} onClick={() => setActivePanel('market')}>
                  <span className="tab-icon" aria-hidden="true"><Icon24SartOutline /></span><span>Р С‹РЅРѕРє</span>
                </button>
                <button type="button" className={`tab-item ${activePanel === 'shop' ? 'active' : ''}`} onClick={() => setActivePanel('shop')}><span className="tab-icon" aria-hidden="true"><Icon24Market /></span><span>РњР°РіР°Р·РёРЅ</span></button>
                <button type="button" className={`tab-item ${activePanel === 'regions' ? 'active' : ''}`} onClick={() => setActivePanel('regions')}><span className="tab-icon" aria-hidden="true">рџ—єпёЏ</span><span>Р РµРіРёРѕРЅС‹</span></button>
              </nav>

            </ProfileProvider>
          </GameProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}
