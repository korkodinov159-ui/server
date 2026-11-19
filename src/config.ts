import type { Rarity } from './types';

export const START_COINS = 100000;
export const START_GEMS = 50;
export const CLAN_CREATE_COST = 500;

export const RARITY_MULT: Record<Rarity, number> = {
  Common: 1,
  Rare: 1.5,
  Epic: 2.2,
  Legendary: 3.5,
};

export function calcPower(basePower: number, level: number, rarity: Rarity): number {
  return Math.round(basePower * (1 + 0.15 * (level - 1)) * RARITY_MULT[rarity]);
}

export function upgradeCost(level: number, rarity: Rarity): number {
  return Math.round(50 * level * RARITY_MULT[rarity]);
}

// ================== ЭКОНОМИКА ПОДДАННЫХ ==================

export const MAX_BASE_INCOME = 500;
export const PURCHASE_PRICE_MULTIPLIER = 2.2;
export const SELLER_SHARE = 0.5;
export const GIVE_AWAY_SHARE = 0.2273;
export const GIVE_AWAY_MAX_PRICE = 500_000;
export const MARKET_HIDE_THRESHOLD = 20_000_000;
export const ACCUMULATION_HOURS_DEFAULT = 24;
export const ACCUMULATION_HOURS_DONUT = 36;
export const AD_INCOME_MULTIPLIER = 1.5;
export const AD_DAILY_LIMIT = 10;
export const UNDER_OWNER_INCOME_MULTIPLIER = 0.5;
export const INCOME_STEP = 1.3;

export function calcBasePrice(income: number): number {
  if (income < 1) income = 1;
  return Math.max(100, Math.floor(Math.pow(income, 3) * 0.07));
}

export function calcCurrentPrice(income: number, resaleCount: number, boughtBySelf = false): number {
  const base = calcBasePrice(income);
  const resaleMult = Math.pow(PURCHASE_PRICE_MULTIPLIER, Math.min(resaleCount, 30));
  const selfMult = boughtBySelf ? PURCHASE_PRICE_MULTIPLIER : 1;
  return Math.floor(base * resaleMult * selfMult);
}

export function nextIncome(currentIncome: number): number {
  return Math.min(MAX_BASE_INCOME, Math.max(1, Math.ceil(currentIncome * INCOME_STEP)));
}

export function calcSellerPayout(income: number): number {
  return Math.floor(calcBasePrice(income) * SELLER_SHARE);
}

export function calcGiveAwayPayout(
  income: number,
  resaleCount: number,
  boughtBySelf: boolean,
  isJudgmentDay: boolean,
): number {
  const current = calcCurrentPrice(income, resaleCount, boughtBySelf);
  if (current >= GIVE_AWAY_MAX_PRICE) return 0;
  const payout = Math.floor(current * GIVE_AWAY_SHARE);
  return isJudgmentDay ? Math.floor(payout / 2) : payout;
}

export function calcSelfBuyoutPrice(income: number, resaleCount: number): number {
  return Math.floor(calcCurrentPrice(income, resaleCount) * 0.5);
}

export function getAccumulationHours(isDonutPatron: boolean): number {
  return isDonutPatron ? ACCUMULATION_HOURS_DONUT : ACCUMULATION_HOURS_DEFAULT;
}

export function isJudgmentDayNow(): boolean {
  return new Date().getDay() === 0;
}

export const NAMES = [
  'Екатерина Никитина', 'Зоя Королёва', 'Алла Иванова', 'Елена Максимова',
  'Ника Егорова', 'Юрий Орлов', 'Вадим Степанов', 'Алекс', 'Бот-77',
];

export const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nolan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Peanut',
];

export const CLAN_NAMES = ['Стальные', 'Ночные', 'Альфа', 'Легион'];