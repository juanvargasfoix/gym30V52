// Mapa centralizado de ilustraciones unDraw
// Todas las SVGs están en /public/undraw/ y se sirven como assets estáticos

export const ILLUSTRATIONS = {
  // General / Landing
  workingTogether: '/undraw/undraw_working-together_r43a.svg',
  conferenceSpeaker: '/undraw/undraw_conference-speaker_kl0d.svg',
  learning: '/undraw/undraw_learning_qt7d.svg',

  // Perfiles de líder (Onboarding)
  solutionMindset: '/undraw/undraw_solution-mindset_pit7.svg',
  foundingTeam: '/undraw/undraw_founding-team_8uhm.svg',
  bookLover: '/undraw/undraw_book-lover_m9n3.svg',

  // Áreas de competencia
  visualExplanation: '/undraw/undraw_visual-explanation_vd4l.svg',
  multitasking: '/undraw/undraw_multitasking_i2bv.svg',
  coffeeWithFriends: '/undraw/undraw_coffee-with-friends_ocg2.svg',

  // Modals y features
  recruiterSuggestions: '/undraw/undraw_recruiter-suggestions_afdd.svg',
  socialFriends: '/undraw/undraw_social-friends_mt6k.svg',
  sportsScores: '/undraw/undraw_sports-scores_ezlu.svg',
  scrumBoard: '/undraw/undraw_scrum-board_7bgh.svg',
  ourSolution: '/undraw/undraw_our-solution_qv3b.svg',
  blogging: '/undraw/undraw_blogging_38kl.svg',

  // Admin
  designingComponents: '/undraw/undraw_designing-components_kb05.svg',
  inTheOffice: '/undraw/undraw_in-the-office_e7pg.svg',
  mindMap: '/undraw/undraw_mind-map_i9bv.svg',
} as const;

// Mapeo de áreas a ilustraciones (consistente en toda la app)
export const AREA_ILLUSTRATIONS: Record<string, string> = {
  comunicacion: ILLUSTRATIONS.visualExplanation,
  liderazgo: ILLUSTRATIONS.conferenceSpeaker,
  autoliderazgo: ILLUSTRATIONS.multitasking,
  negociacion: ILLUSTRATIONS.coffeeWithFriends,
};

// Mapeo de perfiles de líder a ilustraciones
export const PROFILE_ILLUSTRATIONS: Record<string, string> = {
  Resultados: ILLUSTRATIONS.solutionMindset,
  Colaborativo: ILLUSTRATIONS.foundingTeam,
  Inspirador: ILLUSTRATIONS.conferenceSpeaker,
  Coach: ILLUSTRATIONS.bookLover,
};
