export type Role = 'admin' | 'supervisor' | 'participante';
export type AreaType = 'comunicacion' | 'liderazgo' | 'autoliderazgo' | 'negociacion' | string; // Extended for flex/custom
export type SkillStatus = 'locked' | 'available' | 'in_progress' | 'conquered';

export interface User {
  username: string;
  password?: string;
  role: Role;
  fullName: string;
  company?: string;
  supervisor?: string;
  onboardingCompleted?: boolean;
  leaderProfile?: string | null;
  xp?: number;
  rank?: string;
}

export interface Company {
  id: string;
  name: string;
  activeAreas: AreaType[];
  createdAt: string;
}

export interface Skill {
  id: string;
  area: AreaType;
  name: string;
  description: string;
  order: number;
  isCustom: boolean;
}

export interface Kudo {
  id: string;
  from: string;
  to: string;
  message: string;
  value: string;
  createdAt: string;
  company?: string;
}

export interface UserProgress {
  [skillId: string]: {
    status: SkillStatus;
    xpEarned: number;
    conqueredAt: string | null;
  };
}

export interface Rank {
  name: string;
  min: number;
  max: number;
  emoji: string;
  color: string;
}

// --- NEW TYPES FOR ADMIN PANEL V2 ---

export interface GymConfig {
  areas: {
    [key: string]: { enabled: boolean; description: string };
  };
  points: {
    xpPerSkill: number;
    xpNextLevel: number;
  };
  badges: {
    enabled: boolean;
    list: string[];
  };
}

export interface FlexSkill {
  id: string;
  name: string;
  level: string;
}

export interface FlexArea {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  skills: FlexSkill[];
}