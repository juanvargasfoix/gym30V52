import { Rank } from '../types';

export const ranks: Rank[] = [
  { name: 'aprendiz', min: 0, max: 500, emoji: '🌱', color: 'green' },
  { name: 'explorador', min: 501, max: 1500, emoji: '🔵', color: 'blue' },
  { name: 'practicante', min: 1501, max: 3000, emoji: '🟣', color: 'purple' },
  { name: 'especialista', min: 3001, max: 5000, emoji: '🟠', color: 'orange' },
  { name: 'maestro', min: 5001, max: 8000, emoji: '🔴', color: 'red' },
  { name: 'lider', min: 8001, max: 999999, emoji: '🟡', color: 'yellow' }
];

export function calculateRank(xp: number = 0) {
  return ranks.find(r => xp >= r.min && xp <= r.max) || ranks[0];
}

export function initializeDefaultData() {
  // Datos ahora vienen de Supabase.
  // Esta función se mantiene vacía por compatibilidad pero ya no inicializa localStorage.
}

export function formatDate(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  return `Hace ${diffDays} días`;
}