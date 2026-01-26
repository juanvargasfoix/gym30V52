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
  if (!localStorage.getItem('companies')) {
    localStorage.setItem('companies', JSON.stringify([{
      id: "empresa_demo",
      name: "Tech Solutions SA",
      activeAreas: ["comunicacion", "liderazgo"],
      createdAt: new Date().toISOString()
    }]));
  }
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { username: "admin", password: "admin123", role: "admin", fullName: "Admin Sistema" },
      { username: "coord1", password: "coord123", role: "supervisor", company: "empresa_demo", fullName: "María González" },
      { username: "juan", password: "pass123", role: "participante", company: "empresa_demo", supervisor: "coord1", fullName: "Juan Pérez", onboardingCompleted: false, leaderProfile: null, xp: 0, rank: "aprendiz" }
    ]));
  }
  
  if (!localStorage.getItem('skills')) {
    localStorage.setItem('skills', JSON.stringify([
      // COMUNICACIÓN (6)
      { id: "c1", area: "comunicacion", name: "Distinciones del Lenguaje", description: "Comprendé la diferencia entre hechos, juicios y opiniones", order: 1, isCustom: false },
      { id: "c2", area: "comunicacion", name: "Actos Lingüísticos", description: "Dominá afirmaciones, declaraciones, pedidos, ofertas y promesas", order: 2, isCustom: false },
      { id: "c3", area: "comunicacion", name: "Escucha Activa y Ontológica", description: "Escuchá no solo las palabras, sino las emociones e inquietudes", order: 3, isCustom: false },
      { id: "c4", area: "comunicacion", name: "Indagación Profunda", description: "Hacé preguntas poderosas que generen reflexión", order: 4, isCustom: false },
      { id: "c5", area: "comunicacion", name: "Conversaciones para Coordinación", description: "Gestioná pedidos, ofertas y compromisos efectivamente", order: 5, isCustom: false },
      { id: "c6", area: "comunicacion", name: "Comunicación Asertiva", description: "Expresá tus ideas con claridad y respeto", order: 6, isCustom: false },
      
      // LIDERAZGO (6)
      { id: "l1", area: "liderazgo", name: "Empatía y Conexión", description: "Conectá auténticamente con tu equipo", order: 1, isCustom: false },
      { id: "l2", area: "liderazgo", name: "Delegación Efectiva", description: "Asigná tareas potenciando a tu equipo", order: 2, isCustom: false },
      { id: "l3", area: "liderazgo", name: "Feedback y Coaching", description: "Da retroalimentación que impulse el crecimiento", order: 3, isCustom: false },
      { id: "l4", area: "liderazgo", name: "Motivación de Equipos", description: "Inspirá y movilizá a otros hacia objetivos compartidos", order: 4, isCustom: false },
      { id: "l5", area: "liderazgo", name: "Gestión de Quiebres", description: "Convertí conflictos en oportunidades de aprendizaje", order: 5, isCustom: false },
      { id: "l6", area: "liderazgo", name: "Desarrollo de Personas", description: "Ayudá a otros a descubrir y potenciar sus talentos", order: 6, isCustom: false },
      
      // AUTOLIDERAZGO (6)
      { id: "a1", area: "autoliderazgo", name: "El Observador", description: "Reconocé cómo tu perspectiva moldea tu realidad", order: 1, isCustom: false },
      { id: "a2", area: "autoliderazgo", name: "Estados de Ánimo", description: "Gestioná tus emociones de fondo que colorean tu día", order: 2, isCustom: false },
      { id: "a3", area: "autoliderazgo", name: "Emociones y Acción", description: "Comprendé cómo las emociones habilitan o limitan tu acción", order: 3, isCustom: false },
      { id: "a4", area: "autoliderazgo", name: "Creencias Limitantes", description: "Identificá y transformá creencias que te frenan", order: 4, isCustom: false },
      { id: "a5", area: "autoliderazgo", name: "Autorregulación", description: "Desarrollá la capacidad de pausar y elegir tu respuesta", order: 5, isCustom: false },
      { id: "a6", area: "autoliderazgo", name: "Influencia Personal", description: "Expandí tu capacidad de influir en tu entorno", order: 6, isCustom: false },
      
      // NEGOCIACIÓN (6)
      { id: "n1", area: "negociacion", name: "Indagación SPIN", description: "Hacé preguntas que descubran necesidades profundas", order: 1, isCustom: false },
      { id: "n2", area: "negociacion", name: "Proposición de Valor", description: "Comunicá el valor de tu oferta de forma convincente", order: 2, isCustom: false },
      { id: "n3", area: "negociacion", name: "Manejo de Objeciones", description: "Convertí resistencias en oportunidades", order: 3, isCustom: false },
      { id: "n4", area: "negociacion", name: "Negociación Colaborativa", description: "Buscá soluciones ganar-ganar", order: 4, isCustom: false },
      { id: "n5", area: "negociacion", name: "Pedidos, Ofertas y Compromisos", description: "Coordiná acciones efectivamente", order: 5, isCustom: false },
      { id: "n6", area: "negociacion", name: "Cierre y Acuerdos", description: "Concretá negociaciones con acuerdos claros", order: 6, isCustom: false }
    ]));
  }
  
  if (!localStorage.getItem('kudos')) {
    localStorage.setItem('kudos', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('userProgress')) {
    localStorage.setItem('userProgress', JSON.stringify({}));
  }
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