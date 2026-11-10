export interface UserBVBProfile {
  username: string;
  avatarUrl: string;
  favoritePlayerId: string;
  osPreference: 'windows' | 'cachyos';
  soundEnabled: boolean;
  cheerVolume: number; // 0.0 - 1.0
  notificationsEnabled: boolean;
  notifyCategories: {
    transfers: boolean;
    news: boolean;
    injuries: boolean;
    ticker: boolean;
  };
  customFeedKeywords: string[];
  // Digital Member Card & Fan Rank fields (Idee 1)
  memberNumber: string;
  memberSince: string;
  fanRank: string;
  favoriteBlock: string;
  // Achievements & Trophy Cabinet (Idee 3)
  unlockedBadgeIds: string[];
}

const PROFILE_KEY = 'bvb_desktop_user_profile_v1';

export const DEFAULT_USER_PROFILE: UserBVBProfile = {
  username: 'Südtribüne Fan #09',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  favoritePlayerId: 'p-14', // Serhou Guirassy
  osPreference: 'cachyos', // CachyOS Arch Linux default / switchable to Windows
  soundEnabled: true,
  cheerVolume: 0.85,
  notificationsEnabled: true,
  notifyCategories: {
    transfers: true,
    news: true,
    injuries: true,
    ticker: true,
  },
  customFeedKeywords: ['Guirassy', 'Schlotterbeck', 'Gittens', 'Gerücht', 'Champions League'],
  memberNumber: 'BVB-09-81365',
  memberSince: '19.12.1909',
  fanRank: 'Südtribünen-Legende',
  favoriteBlock: 'Block 13 (Südtribüne)',
  unlockedBadgeIds: ['echte-liebe-1909', 'suedtribuene-legende', 'gesangssicher', 'derby-held', 'archivar-09', 'app-pwa-pioneer'],
};

export function getUserProfile(): UserBVBProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      notifyCategories: {
        ...DEFAULT_USER_PROFILE.notifyCategories,
        ...(parsed.notifyCategories || {}),
      },
      unlockedBadgeIds: parsed.unlockedBadgeIds || DEFAULT_USER_PROFILE.unlockedBadgeIds,
    };
  } catch (e) {
    console.warn("User profile load error:", e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserBVBProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("User profile save error:", e);
  }
}

