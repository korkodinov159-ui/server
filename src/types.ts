export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CharType = 'player' | 'bot';

export interface Character {
  id: string;
  name: string;
  avatar: string;
  type: CharType;
  rarity: Rarity;
  level: number;
  basePower: number;
  income: number;
  resaleCount: number;
  boughtBySelf: boolean;
  ownerName?: string;
  ownerAvatar?: string;
  ownerVkId?: string | null;
  originalOwnerVkId?: string | null;
}

export interface MarketLot {
  id: string;
  character: Character;
  sellerName: string;
  sellerVkId: string;
}

export interface Clan {
  id: string;
  name: string;
  emoji: string;
  members: string[];
  bonusPercent: number;
  owner_vk_id?: string;
}

export interface ReferralInfo {
  vk_id: string;
  name: string;
  avatar: string;
  totalEarned: number;
  joinedAt: number;
  bonusPaid: number;
}

export interface Region {
  id: number;
  type: 'lumber' | 'mine' | 'farm' | 'port';
  level: number;
  rate: number;
  meta: { name: string; emoji: string; resource: string; baseRate: number; cost: number };
  last_collected_at: number;
}

export interface Resources {
  coins: number;
  ore: number;
  wood: number;
  food: number;
}

  name: string;
  avatar: string;
  coins: number;
  gems: number;
  votes: number;
  characters: Character[];
  clanId: string | null;
  lastCollectAt: number;
  maxCharacters: number;
  limitLevel: number;

  hasWhip: boolean;
  hasChains: boolean;
  hasShield: boolean;
  hasUmbrella: boolean;
  avatarFrame: 'none' | 'gold' | 'neon' | 'flame';
  lastChestOpen: number;
  totalEarned: number;

  lastDailyClaimAt: number;
  dailyStreak: number;
  lastDailyDay: string;

  myRefCode: string;
  invitedBy: string | null;
  referrals: ReferralInfo[];
  referralEarned: number;

  careerLevel: number;
  lastStoryShareAt: number;
  adViewsToday: number;
  lastAdViewDay: string;

  ownedByVkId: string | null;
  adIncomeBuffMultiplier: number;
  adIncomeBuffExpiresAt: number;
  isDonutPatron: boolean;
}