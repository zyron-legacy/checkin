export interface RewardConfig {
  dailyReward: number;
  bonusDay: number;
  bonusReward: number;
}

export const REWARD_CONFIG: RewardConfig = {
  dailyReward: 8,    // रोज़ 8 ZP
  bonusDay: 14,      // 14वें दिन
  bonusReward: 30,   // 14वें दिन 30 ZP बोनस
};