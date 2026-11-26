import { ImageSourcePropType } from 'react-native';
import {
  User,
  Flame,
  Trophy,
  Crown,
  Shield,
  Zap,
  Sparkles,
  Star,
  LucideIcon,
} from 'lucide-react-native';

export interface ProfileAvatarOption {
  id: string;
  label: string;
  defaultBg: string;
  icon: LucideIcon;
  /**
   * Drop local bundled avatar images into `assets/images/avatars/` and bind
   * `source: require('../../assets/images/avatars/<file>.png')` here when ready.
   */
  source?: ImageSourcePropType;
}

export const AVATAR_COLORS: string[] = [
  '#7650F6', // BALLIVE Violet
  '#E11D48', // Crimson Striker
  '#0284C7', // Pitch Blue
  '#16A34A', // Turf Emerald
  '#D97706', // Championship Amber
];

export const PROFILE_AVATARS: ProfileAvatarOption[] = [
  {
    id: 'striker',
    label: 'Striker',
    defaultBg: '#7650F6',
    icon: Flame,
  },
  {
    id: 'playmaker',
    label: 'Playmaker',
    defaultBg: '#0284C7',
    icon: Sparkles,
  },
  {
    id: 'captain',
    label: 'Captain',
    defaultBg: '#D97706',
    icon: Crown,
  },
  {
    id: 'keeper',
    label: 'Keeper',
    defaultBg: '#16A34A',
    icon: Shield,
  },
  {
    id: 'mvp',
    label: 'MVP',
    defaultBg: '#E11D48',
    icon: Trophy,
  },
  {
    id: 'legend',
    label: 'Legend',
    defaultBg: '#4F46E5',
    icon: Star,
  },
  {
    id: 'wingback',
    label: 'Speedster',
    defaultBg: '#0D9488',
    icon: Zap,
  },
  {
    id: 'classic',
    label: 'Classic',
    defaultBg: '#7650F6',
    icon: User,
  },
];

export function resolveProfileAvatar(avatarId?: string | null): ProfileAvatarOption {
  const clean = (avatarId || '').trim().toLowerCase();
  return PROFILE_AVATARS.find(a => a.id === clean) || PROFILE_AVATARS[0];
}
