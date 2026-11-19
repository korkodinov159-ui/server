import React, { createContext, useContext, useState } from 'react';

interface PlayerData {
  vk_id: string;
  name: string;
  avatar: string;
  coins: number;
  income: number;
  slaves: any[];
  clanName?: string;
}

interface ProfileContextType {
  selectedPlayer: PlayerData | null;
  openProfile: (player: PlayerData) => void;
  closeProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  return (
    <ProfileContext.Provider value={{
      selectedPlayer,
      openProfile: setSelectedPlayer,
      closeProfile: () => setSelectedPlayer(null)
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider');
  return ctx;
}