/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { User, Skill, Company, UserProgress, Kudo, FlexArea } from '../types';
import { calculateRank, ranks } from '../utils/data';
import { LogOut, Lock, ChevronDown, X, CheckCircle, BarChart2, Award, TrendingUp, Heart, ArrowRight, Check, Trophy, Medal } from 'lucide-react';
import { getSkills, getUserProgress, updateSkillProgress, updateProfile, getCompany, getAllProfiles, getKudos, getCompanyFlexConfig, getKudosReadIds, setKudosReadIds } from '../src/lib/supabase-helpers';
import { ILLUSTRATIONS, AREA_ILLUSTRATIONS } from '../utils/illustrations';
import { ExerciseRunner } from './exercises/ExerciseRunner';
import { launchConfetti } from '../src/lib/confetti';

interface CompetenceMapProps {
  currentUser: User;
  onLogout: () => void;
}

export const CompetenceMap: React.FC<CompetenceMapProps> = ({ currentUser, onLogout }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [currentXP, setCurrentXP] = useState<number>(currentUser.xp || 0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<Set<string>>(new Set());
  const [flexArea, setFlexArea] = useState<FlexArea | null>(null);
  const [collapsedAreas, setCollapsedAreas] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('collapsedAreas');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [kudosRecibidos, setKudosRecibidos] = useState<Kudo[]>([]);
  const [kudosNoLeidos, setKudosNoLeidos] = useState(0);
  const [showKudosModal, setShowKudosModal] = useState(false);

  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false); // NEW STATE FOR RANKING
  const [dashboardStats, setDashboardStats] = useState({
    habilidadesCompletadas: 0,
    porArea: [] as { nombre: string, completadas: number, porcentaje: number, color: string }[],
    badges: [] as { emoji: string, nombre: string, descripcion: string }[],
    nombreEmpresa: '',
    ranking: [] as { username: string, nombre: string, xp: number, rango: string, habilidades: number, esUsuarioActual: boolean }[],
    promedioScores: 0,
    areaFuerte: '',
    proximoRango: '',
    xpFaltante: 0
  });

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const isAlreadyCompleted = selectedSkill && (userProgress[selectedSkill.id]?.status === 'conquered' || userProgress[selectedSkill.id]?.status === 'completed');

  useEffect(() => {
    if (currentUser.role !== 'participante' || !currentUser.id) return;
    const loadKudos = async () => {
      // Cargar kudos desde Supabase
      const dbKudos = await getKudos(currentUser.id!);
      const misKudos: Kudo[] = (dbKudos || []).map((k: any) => ({
        id: k.id,
        from: k.from_user_id || '',
        to: currentUser.username,
        message: k.message,
        value: k.value || 'Reconocimiento',
        createdAt: k.created_at,
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setKudosRecibidos(misKudos);

      // kudosLeidos: ahora persistido en Supabase (profiles.kudos_read_ids).
      // El helper hace fallback transparente a localStorage si la columna
      // todavía no existe en este entorno.
      const leidos = await getKudosReadIds(currentUser.id!);
      const unreadCount = misKudos.filter((k: any) => !leidos.includes(k.id)).length;
      setKudosNoLeidos(unreadCount);
      if (unreadCount > 0 && !sessionStorage.getItem('kudosModalShown')) {
        setTimeout(() => {
          setShowKudosModal(true);
          sessionStorage.setItem('kudosModalShown', 'true');
        }, 1500);
      }
    };
    loadKudos();
  }, [currentUser]);

  const marcarKudosComoLeidos = async () => {
    if (!currentUser.id) {
      setKudosNoLeidos(0);
      return;
    }
    // UI optimista: bajamos el contador antes de la persistencia para que el
    // usuario vea la respuesta inmediata. Si Supabase falla, el helper hace
    // fallback a localStorage para no perder el estado.
    setKudosNoLeidos(0);
    const leidos = await getKudosReadIds(currentUser.id);
    const ids = kudosRecibidos.map(k => k.id);
    const nuevos = Array.from(new Set([...leidos, ...ids]));
    await setKudosReadIds(currentUser.id, nuevos);
  };

  useEffect(() => {
    const loadAppData = async () => {
      try {
        // 1. Get Company from Supabase
        let userCompany: Company | null = null;
        const companyId = currentUser.company || (currentUser as any).empresa_id;
        if (companyId) {
          const dbCompany = await getCompany(companyId);
          if (dbCompany) {
            userCompany = {
              id: dbCompany.id,
              name: dbCompany.nombre,
              activeAreas: dbCompany.areas_activas || [],
              createdAt: dbCompany.created_at
            };
            setCompany(userCompany);
          }
        }

        // 2. Get Skills from Supabase
        const dbSkills = await getSkills(currentUser.company);
        const mappedSkills: any[] = dbSkills.map((s: any) => ({
          uuid: s.id,
          id: s.content_key || s.id,
          name: s.nombre,
          area: s.area,
          description: s.descripcion || '',
          order: s.nivel || 0,
          isCustom: s.is_custom || false,
          contentKey: s.content_key || ''
        }));

        if (userCompany) {
          const active = userCompany.activeAreas || [];
          // Si la empresa tiene 'custom', permitimos ver todas las skills que no tengan empresa_id o tengan el de la empresa
          // Pero aquí filtramos por las áreas que la empresa declaró como "activas" en su config de UI
          const filtered = mappedSkills.filter((s: Skill) => active.includes(s.area));
          setSkills(filtered);
        } else {
          setSkills(mappedSkills);
        }

        // 3. Get User Progress from Supabase
        if (currentUser.id) {
          const progress = await getUserProgress(currentUser.id);
          // Mapear el progreso de Supabase al formato que espera la app
          // IMPORTANTE: progress viene indexado por skill UUID, pero la app usa content_key como skill.id
          // Necesitamos traducir UUID -> content_key para que getSkillStatus() funcione correctamente
          const mappedProgress: UserProgress = {};
          Object.keys(progress).forEach(key => {
            const p = progress[key];
            const skillUuid = p.skill_id || key;
            // Buscar la skill por UUID para obtener su content_key
            const matchingSkill = mappedSkills.find((s: any) => s.uuid === skillUuid);
            const progressKey = matchingSkill ? matchingSkill.id : skillUuid;
            mappedProgress[progressKey] = {
              status: (p.status === 'completada' || p.status === 'completed') ? 'conquered' : p.status,
              xpEarned: p.xp_ganada || 0,
              score: p.score,
              conqueredAt: p.completed_at,
              // Pasar evaluation_data crudo (puede ser null si la columna
              // no existe todavía o si la skill se completó antes de que
              // existiera la columna). RoleplayChat lo usa para rehidratar.
              evaluation_data: p.evaluation_data ?? null,
            } as any;
          });
          setUserProgress(mappedProgress);
        }

        // Logic for FlexArea - cargar desde Supabase (company.flex_area_config)
        if (userCompany && userCompany.activeAreas.includes('custom') && companyId) {
          const flexConfig = await getCompanyFlexConfig(companyId);
          if (flexConfig) {
            setFlexArea(flexConfig as FlexArea);
          }
        }

      } catch (error) {
        console.error("❌ Error cargando datos de Supabase en CompetenceMap:", error);
      }
    };

    loadAppData();
  }, [currentUser]);

  useEffect(() => {
    if (showProgressDashboard) {
      calcularDashboardStats();
    }
  }, [showProgressDashboard, userProgress]);

  const calcularDashboardStats = async () => {
    const companyId = currentUser.company || (currentUser as any).empresa_id;
    if (!companyId) return;

    try {
      // 1. Get all profiles of the same company
      const companyProfiles = await getAllProfiles(companyId);

      // 2. Get all progress entries for the company
      // const companyProgress = await getCompanyProgress(companyId);

      // 3. Current User Stats
      const miProgreso = userProgress; // already loaded in useEffect
      const completadas = Object.values(miProgreso).filter((h: any) => h.status === 'conquered' || h.status === 'completed').length;

      const countCompletedInArea = (prefix: string) =>
        Object.keys(miProgreso).filter(key => {
          const skill = skills.find((s: any) => s.uuid === key || s.id === key);
          const skillId = skill ? skill.id : key;
          return skillId && skillId.startsWith(prefix) && (miProgreso[key].status === 'conquered' || miProgreso[key].status === 'completed');
        }).length;

      const porArea = [
        { nombre: 'Comunicación', completadas: countCompletedInArea('c'), porcentaje: Math.round((countCompletedInArea('c') / 6) * 100), color: 'purple' },
        { nombre: 'Liderazgo', completadas: countCompletedInArea('l'), porcentaje: Math.round((countCompletedInArea('l') / 6) * 100), color: 'cyan' },
        { nombre: 'Autoliderazgo', completadas: countCompletedInArea('a'), porcentaje: Math.round((countCompletedInArea('a') / 6) * 100), color: 'green' },
        { nombre: 'Negociación', completadas: countCompletedInArea('n'), porcentaje: Math.round((countCompletedInArea('n') / 6) * 100), color: 'pink' }
      ];

      // 4. Badges
      const badges = [];
      if ((currentUser as any).onboarding_completed) badges.push({ emoji: '🌟', nombre: 'Fundacional', descripcion: 'Completaste el onboarding' });

      Object.entries(miProgreso).forEach(([id, habilidad]) => {
        const h = habilidad as any;
        if (h.status === 'conquered' || h.status === 'completed') {
          const score = h.score || 0;
          if (score >= 90) badges.push({ emoji: '🏆', nombre: `Maestro: ${id}`, descripcion: `Score ${score}%` });
        }
      });

      // 5. Ranking
      const rankingData = companyProfiles.map(u => {
        // const uProgress = companyProgress.filter(p => p.user_id === u.id);
        // const uHabilidades = uProgress.filter(p => p.status === 'completada').length;
        const uHabilidades = 0;
        return {
          username: u.email,
          nombre: u.username,
          xp: u.xp || 0,
          rango: u.nivel || 'aprendiz',
          habilidades: uHabilidades,
          esUsuarioActual: u.id === currentUser.id
        };
      }).sort((a, b) => b.xp - a.xp);

      // 6. Scores averages
      const habilidadesConScore = (Object.values(miProgreso) as any[]).filter((h: any) => h.score !== undefined);
      const promedioScores = habilidadesConScore.length > 0 ? Math.round(habilidadesConScore.reduce<number>((acc, h: any) => acc + (Number(h.score) || 0), 0) / habilidadesConScore.length) : 0;

      const mejorArea = porArea.reduce((max, area) => area.porcentaje > max.porcentaje ? area : max, porArea[0]);
      const areaFuerte = mejorArea.porcentaje > 0 ? mejorArea.nombre : 'Explorando';

      const currentRank = calculateRank(currentXP);
      const allRankNames = ranks.map(r => r.name);
      const idxActual = currentRank ? allRankNames.indexOf(currentRank.name) : 0;
      const proximoRango = idxActual < allRankNames.length - 1 ? allRankNames[idxActual + 1] : 'Líder (Máximo)';
      const nextRank = (idxActual >= 0 && idxActual < ranks.length - 1) ? ranks[idxActual + 1] : null;
      const xpFaltante = nextRank ? nextRank.min - currentXP : 0;

      const nombreEmpresa = company?.name || 'Tu Empresa';

      setDashboardStats({
        habilidadesCompletadas: completadas,
        porArea,
        badges,
        nombreEmpresa,
        ranking: rankingData,
        promedioScores,
        areaFuerte,
        proximoRango: proximoRango.charAt(0).toUpperCase() + proximoRango.slice(1),
        xpFaltante: Math.max(0, xpFaltante)
      });

    } catch (error) {
      console.error("❌ Error calculando stats desde Supabase:", error);
    }
  };

  const getSkillStatus = (skill: Skill) => {
    if (skill.isCustom) return 'available';
    const prog = userProgress[skill.id];
    if (prog?.status === 'conquered' || (prog?.status as any) === 'completed') return 'conquered';
    const areaSkills = skills.filter(s => s.area === skill.area).sort((a, b) => a.order - b.order);
    const myIndex = areaSkills.findIndex(s => s.id === skill.id);
    if (myIndex === 0) return 'available';
    const prevSkill = areaSkills[myIndex - 1];
    const prevProg = userProgress[prevSkill.id];
    return (prevProg?.status === 'conquered' || (prevProg?.status as any) === 'completed') ? 'available' : 'locked';
  };

  const handleSkillClick = (skill: Skill) => {
    if (getSkillStatus(skill) === 'locked') return;
    setSelectedSkill(skill);
  };

  const toggleAreaCollapse = (areaName: string) => {
    const newCollapsed = collapsedAreas.includes(areaName) ? collapsedAreas.filter(a => a !== areaName) : [...collapsedAreas, areaName];
    setCollapsedAreas(newCollapsed);
    localStorage.setItem('collapsedAreas', JSON.stringify(newCollapsed));
  };

  const completeSkill = async (xp: number, score: number = 100, evaluationData?: any) => {
    if (!selectedSkill || !currentUser.id) return;

    // 1. Update Progress in Supabase. Si viene evaluationData (Tipo C
    //    actualmente), se persiste también en user_progress.evaluation_data
    //    para poder rehidratar la pantalla de resultados al re-entrar.
    const skillUuid = (skills.find(s => s.id === selectedSkill.id) as any)?.uuid || selectedSkill.id;
    const result = await updateSkillProgress(currentUser.id, skillUuid, 'conquered', 100, evaluationData);

    if (result) {
      // Feedback visual inmediato — antes de cualquier await adicional
      launchConfetti();
      setXpGainAmount(xp);
      setShowXPGain(true);
      setTimeout(() => setShowXPGain(false), 1800);

      // 2. Update Local State
      const statusWith = (skill: Skill, prog: UserProgress) => {
        if (skill.isCustom) return 'available';
        const p = prog[skill.id];
        if (p?.status === 'conquered' || (p?.status as any) === 'completed') return 'conquered';
        const areaSkills = skills.filter(s => s.area === skill.area).sort((a, b) => a.order - b.order);
        const myIndex = areaSkills.findIndex(s => s.id === skill.id);
        if (myIndex === 0) return 'available';
        const prev = areaSkills[myIndex - 1];
        const prevProg = prog[prev.id];
        return (prevProg?.status === 'conquered' || (prevProg?.status as any) === 'completed') ? 'available' : 'locked';
      };
      const prevLocked = new Set(skills.filter(s => statusWith(s, userProgress) === 'locked').map(s => s.id));

      const newProgress = {
        ...userProgress,
        [selectedSkill.id]: {
          status: 'conquered' as const,
          xpEarned: xp,
          score: score,
          conqueredAt: new Date().toISOString(),
          // Persistir local también — si el usuario revisita la skill en
          // la misma sesión sin recargar, RoleplayChat puede rehidratar.
          evaluation_data: evaluationData ?? null,
        } as any
      };
      setUserProgress(newProgress);

      const newlyUnlocked = skills.filter(s => prevLocked.has(s.id) && statusWith(s, newProgress) === 'available').map(s => s.id);
      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedIds(new Set(newlyUnlocked));
        setTimeout(() => setNewlyUnlockedIds(new Set()), 900);
      }

      // 3. Update XP in Supabase y estado local
      const newXP = (currentUser.xp || 0) + xp;
      setCurrentXP(newXP);
      await updateProfile(currentUser.id, { xp: newXP });
    } else {
      console.error('❌ Error guardando progreso en Supabase');
    }
  };

  const areas = [
    { id: 'comunicacion', name: 'Comunicación Efectiva', color: 'purple', gradient: 'from-purple-400 to-pink-500', border: 'border-purple-400', shadow: 'shadow-purple-200/50' },
    { id: 'liderazgo', name: 'Liderazgo Consciente', color: 'cyan', gradient: 'from-cyan-400 to-blue-500', border: 'border-cyan-400', shadow: 'shadow-cyan-200/50' },
    { id: 'autoliderazgo', name: 'Autoliderazgo', color: 'green', gradient: 'from-green-400 to-teal-500', border: 'border-green-400', shadow: 'shadow-green-200/50' },
    { id: 'negociacion', name: 'Negociación', color: 'pink', gradient: 'from-pink-400 to-rose-500', border: 'border-pink-400', shadow: 'shadow-pink-200/50' }
  ];

  // Helper to render ranking row
  const renderRankingRow = (user: any, index: number, isCompact: boolean = false) => {
    const isTop3 = index < 3;
    const isMe = user.esUsuarioActual;

    return (
      <div key={user.username} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isMe ? 'bg-cyan-50 border-2 border-cyan-200 shadow-sm' : 'border border-transparent hover:bg-slate-50'}`}>
        <div className={`w-8 h-8 flex items-center justify-center font-black text-lg ${isTop3 ? '' : 'text-slate-400'}`}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold truncate ${isMe ? 'text-cyan-700' : 'text-slate-700'}`}>
              {user.nombre} {isMe && '(Tú)'}
            </span>
            {isMe && <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">🎯</span>}
          </div>
          <div className="text-xs text-slate-400 font-medium capitalize">{user.rango}</div>
        </div>

        <div className="text-right">
          <div className="font-black text-slate-800">{user.xp} <span className="text-[10px] text-slate-400 font-bold">XP</span></div>
          {!isCompact && (
            <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden ml-auto">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.min(100, (user.habilidades / 24) * 100)}%` }}></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[100px] opacity-20 blob-shape"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] opacity-20 blob-shape" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* HEADER WITH VIBRANT GRADIENT */}
      <header className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 border-b border-white/20 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-bold backdrop-blur-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Salir</span>
          </button>
          <div className="h-8 w-px bg-white/30 hidden md:block"></div>
          <div className="text-white hidden md:block">
            <h1 className="text-xl font-black tracking-tight drop-shadow-sm">
              MAPA DE COMPETENCIAS
            </h1>
            <p className="text-xs text-cyan-50 font-bold opacity-90">
              {company?.name} • {currentUser.leaderProfile || 'Perfil no definido'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {currentUser.role === 'participante' && (
            <button
              onClick={() => setShowKudosModal(true)}
              className="relative group bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all backdrop-blur-md"
            >
              <div className="text-2xl group-hover:scale-110 transition transform">❤️</div>
              {kudosNoLeidos > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce shadow-md border-2 border-transparent">
                  {kudosNoLeidos}
                </div>
              )}
            </button>
          )}

          <button
            onClick={() => setShowProgressDashboard(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl hover:scale-105 transition shadow-lg font-bold group"
          >
            <BarChart2 className="w-5 h-5" />
            <span>Mi Progreso</span>
          </button>

          <div className="relative">
            {showXPGain && (
              <div className="xp-float-badge absolute -top-1 left-1/2 pointer-events-none z-50 bg-yellow-400 text-yellow-900 font-black text-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                +{xpGainAmount} XP
              </div>
            )}
            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10">
              <div className="text-right">
                <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">Nivel {calculateRank(currentXP).name}</div>
                <div className="text-sm font-black">{currentXP} XP</div>
              </div>
              <div className="text-2xl drop-shadow-md">{calculateRank(currentXP).emoji}</div>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL CELEBRATORIO DE KUDOS */}
      {showKudosModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl animate-scaleIn border border-white/50">
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-10 text-white text-center overflow-hidden">
              <div className="relative z-10">
                <img src={ILLUSTRATIONS.recruiterSuggestions} alt="Reconocimientos" className="w-28 h-28 mx-auto mb-4 drop-shadow-lg" loading="lazy" />
                <h2 className="text-4xl font-black mb-2 tracking-tight">Reconocimientos</h2>
                <p className="text-pink-100 text-lg font-medium">
                  {kudosRecibidos.length} mensaje{kudosRecibidos.length !== 1 ? 's' : ''} inspiradores de tu equipo
                </p>
              </div>
              <button
                onClick={() => setShowKudosModal(false)}
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-10 h-10 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 max-h-[50vh] overflow-y-auto bg-slate-50 space-y-4">
              {kudosRecibidos.length > 0 ? (
                kudosRecibidos.map((kudo, idx) => (
                  <div key={kudo.id} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg border border-pink-100 transition-all hover:-translate-y-1 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex gap-4">
                      <div className="bg-pink-50 p-3 rounded-2xl h-fit shadow-inner">
                        <img src={ILLUSTRATIONS.socialFriends} alt="Kudo" className="w-10 h-10" loading="lazy" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-slate-800 text-lg">{kudo.from === currentUser.username ? 'Yo' : (kudo as any).deNombre || kudo.from}</h4>
                          <span className="text-xs font-bold text-pink-400 bg-pink-50 px-2 py-1 rounded-lg">{new Date(kudo.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 italic mb-3 leading-relaxed">"{kudo.message}"</p>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-lg shadow-sm">
                          {kudo.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <img src={ILLUSTRATIONS.coffeeWithFriends} alt="Sin kudos aún" className="w-40 h-40 mx-auto mb-4 opacity-30" loading="lazy" />
                  <p>Aún no tienes mensajes. Sigue adelante.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 text-center">
              <button
                onClick={() => { marcarKudosComoLeidos(); setShowKudosModal(false); }}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:scale-105 transition-transform"
              >
                Gracias, Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD MODAL */}
      {showProgressDashboard && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-[3rem] max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl relative border-4 border-white">
            <div className="sticky top-0 z-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-8 rounded-t-[2.5rem] flex justify-between items-center shadow-lg text-white">
              <div>
                <h2 className="text-4xl font-black flex items-center gap-3 tracking-tight"><img src={ILLUSTRATIONS.scrumBoard} alt="" className="w-10 h-10" loading="lazy" /> Mi Tablero <span className="bg-white/20 text-sm px-3 py-1 rounded-full backdrop-blur-md border border-white/20">v5.2</span></h2>
                <p className="text-cyan-100 font-medium mt-1 opacity-90">{currentUser.fullName}</p>
              </div>
              <button onClick={() => setShowProgressDashboard(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition backdrop-blur-md">✕</button>
            </div>

            <div className="p-10 space-y-12">
              {/* STATS CARDS - VIBRANT & COLORFUL */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Card: Achievements (Habilidades Completadas) - Green Border */}
                <div className="bg-white p-6 rounded-2xl border-2 border-green-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-green-500 font-black text-xs uppercase tracking-wider">Logros</div>
                    <CheckCircle className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{dashboardStats.habilidadesCompletadas}<span className="text-slate-300 text-3xl">/24</span></div>
                  <div className="text-slate-400 font-medium text-sm">Habilidades Listas</div>
                </div>

                {/* Card: Experience - Orange Border */}
                <div className="bg-white p-6 rounded-2xl border-2 border-orange-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-orange-500 font-black text-xs uppercase tracking-wider">Experiencia</div>
                    <TrendingUp className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{currentXP}</div>
                  <div className="text-slate-400 font-medium text-sm">XP Total Acumulado</div>
                </div>

                {/* Card: Kudos - Pink Border */}
                <div className="bg-white p-6 rounded-2xl border-2 border-pink-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-pink-500 font-black text-xs uppercase tracking-wider">Reconocimiento</div>
                    <Heart className="w-8 h-8 text-pink-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{kudosRecibidos.length}</div>
                  <div className="text-slate-400 font-medium text-sm">Kudos Recibidos</div>
                </div>

                {/* Card: Rank - Blue */}
                <div className="bg-white p-6 rounded-2xl border-2 border-blue-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-blue-500 font-black text-xs uppercase tracking-wider">Rango</div>
                    <Medal className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl font-black text-slate-800 capitalize leading-tight mb-2">{calculateRank(currentXP).name}</div>
                  <div className="text-slate-400 font-medium text-sm">Nivel de Seniority</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* NEW: LEADERBOARD COLUMN (Left - 5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Trophy className="w-7 h-7 text-yellow-500" /> Ranking
                      </h3>
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                        Tu posición: #{dashboardStats.ranking.findIndex(u => u.esUsuarioActual) + 1} de {dashboardStats.ranking.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {dashboardStats.ranking.slice(0, 5).map((user, idx) => renderRankingRow(user, idx))}

                      {/* Separator if user is not in top 5 */}
                      {dashboardStats.ranking.findIndex(u => u.esUsuarioActual) >= 5 && (
                        <>
                          <div className="text-center text-slate-300 text-xl leading-none my-1">...</div>
                          {renderRankingRow(dashboardStats.ranking.find(u => u.esUsuarioActual), dashboardStats.ranking.findIndex(u => u.esUsuarioActual))}
                        </>
                      )}
                    </div>

                    {dashboardStats.ranking.length > 5 && (
                      <button
                        onClick={() => setShowFullRanking(true)}
                        className="w-full mt-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm"
                      >
                        Ver Ranking Completo
                      </button>
                    )}
                  </div>
                </div>

                {/* EXISTING: PROGRESS & KUDOS (Right - 7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  {/* PROGRESS BARS */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -z-0"></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10"><BarChart2 className="w-6 h-6 text-indigo-500" /> Progreso por Área</h3>
                    <div className="space-y-6 relative z-10">
                      {dashboardStats.porArea.map((area, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between mb-2 font-bold text-slate-700">
                            <span>{area.nombre}</span>
                            <span className={`text-${area.color}-600`}>{area.porcentaje}%</span>
                          </div>
                          <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                            <div className={`h-full bg-gradient-to-r from-${area.color}-400 to-${area.color}-500 rounded-full transition-all duration-1000 group-hover:opacity-90 shadow-[0_0_15px_rgba(0,0,0,0.2)]`} style={{ width: `${area.porcentaje}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KUDOS RECIENTES */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><Award className="w-8 h-8 text-pink-500" /> Kudos Recientes</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {kudosRecibidos.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-8 italic bg-slate-50 rounded-2xl">Aún no hay kudos recientes. ¡Sigue así!</div>
                      ) : (
                        kudosRecibidos.slice(0, 3).map((kudo, idx) => (
                          <div key={kudo.id} className="bg-white p-4 rounded-2xl border border-pink-100 shadow-lg shadow-pink-200/50 hover:scale-105 transition-transform flex gap-4 items-center">
                            <div className="text-3xl bg-pink-50 p-2 rounded-full">🎉</div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{kudo.from === currentUser.username ? 'Yo' : (kudo as any).deNombre || kudo.from}</p>
                              <p className="text-xs text-slate-500 italic truncate w-48">"{kudo.message}"</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FULL RANKING */}
      {showFullRanking && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] flex flex-col relative overflow-hidden animate-scaleIn shadow-2xl border border-white/20">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-white text-center shadow-md shrink-0">
              <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center justify-center gap-3"><img src={ILLUSTRATIONS.sportsScores} alt="" className="w-10 h-10" loading="lazy" /> Ranking Completo</h2>
              <p className="opacity-90 font-medium">Comparativa de XP en {dashboardStats.nombreEmpresa}</p>
              <button onClick={() => setShowFullRanking(false)} className="absolute top-6 right-6 bg-black/20 hover:bg-black/30 rounded-full w-10 h-10 flex items-center justify-center transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-3">
              {dashboardStats.ranking.map((user, idx) => renderRankingRow(user, idx))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 text-center shrink-0">
              <button onClick={() => setShowFullRanking(false)} className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - THE MAP */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-16 relative z-10">
        {areas.map((area) => {
          const areaSkills = skills.filter(s => s.area === area.id).sort((a, b) => a.order - b.order);
          if (areaSkills.length === 0) return null;
          const isCollapsed = collapsedAreas.includes(area.id);

          return (
            <div key={area.id} className="relative group/area">
              {/* Decorative Background Shapes */}
              <div className={`absolute -inset-4 bg-${area.color}-100/30 rounded-[3rem] -z-10 opacity-0 group-hover/area:opacity-100 transition-opacity duration-700 blur-xl`}></div>
              <div className={`absolute top-0 right-0 w-64 h-64 bg-${area.color}-100 rounded-full blur-[80px] opacity-20 -z-10 pointer-events-none`}></div>

              {/* AREA HEADER CARD */}
              <div
                onClick={() => toggleAreaCollapse(area.id)}
                className={`
                        relative overflow-hidden cursor-pointer select-none bg-gradient-to-r ${area.gradient}
                        p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-${area.color}-200/40 
                        transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl
                        flex items-center justify-between mb-10 text-white
                     `}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 p-2">
                    <img src={AREA_ILLUSTRATIONS[area.id] || ILLUSTRATIONS.ourSolution} alt={area.name} className="w-16 h-16" loading="lazy" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 drop-shadow-sm">{area.name}</h2>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-48 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${(areaSkills.filter(s => getSkillStatus(s) === 'conquered').length / areaSkills.length) * 100}%` }}></div>
                      </div>
                      <span className="font-bold text-sm opacity-90">{areaSkills.filter(s => getSkillStatus(s) === 'conquered').length} / {areaSkills.length} Completadas</span>
                    </div>
                  </div>
                </div>

                <div className={`bg-white/20 p-3 rounded-full backdrop-blur-md transition-transform duration-500 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                  <ChevronDown className="w-8 h-8 text-white" />
                </div>
              </div>

              {!isCollapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 animate-fade-in">
                  {areaSkills.map((skill) => {
                    const status = getSkillStatus(skill);
                    const isLocked = status === 'locked';
                    const isCompleted = status === 'conquered';
                    const isAvailable = status === 'available';

                    // Determine level badge color based on skill order
                    let levelColor = 'bg-green-100 text-green-700'; // Basic
                    let levelLabel = 'Básico';
                    if (skill.order > 2) { levelColor = 'bg-yellow-100 text-yellow-700'; levelLabel = 'Intermedio'; }
                    if (skill.order > 4) { levelColor = 'bg-orange-100 text-orange-700'; levelLabel = 'Avanzado'; }

                    return (
                      <button
                        key={skill.id}
                        onClick={() => handleSkillClick(skill)}
                        disabled={isLocked}
                        className={`
                                    relative p-8 rounded-[2.5rem] text-left border-[3px] transition-all duration-300 group overflow-hidden flex flex-col h-full
                                    ${isLocked
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed grayscale'
                            : isCompleted
                              ? `bg-white border-green-400 shadow-xl shadow-green-200/50 ring-4 ring-green-50 scale-[1.02]`
                              : `bg-white ${area.border} shadow-lg ${area.shadow} hover:scale-105 hover:shadow-2xl`
                          }
                                    ${newlyUnlockedIds.has(skill.id) ? 'skill-pop' : ''}
                                 `}
                      >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 z-20">
                          {isCompleted && (
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                              <Check className="w-3 h-3" /> Completada
                            </span>
                          )}
                          {isAvailable && (
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md animate-pulse">
                              ¡Nueva!
                            </span>
                          )}
                          {isLocked && <Lock className="w-6 h-6 text-slate-300" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative z-10">
                          <div className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-inner
                                        ${isLocked ? 'bg-slate-200 text-slate-400' : isCompleted ? 'bg-green-100 text-green-600' : `bg-${area.color}-50 text-${area.color}-600`}
                                     `}>
                            {isCompleted ? <Check className="w-6 h-6" /> : skill.order}
                          </div>

                          <h3 className={`text-2xl font-black mb-3 leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                            {skill.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${levelColor}`}>
                              {levelLabel}
                            </span>
                            {skill.isCustom && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600">Custom</span>}
                          </div>

                          <p className={`text-sm leading-relaxed ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                            {skill.description}
                          </p>
                        </div>

                        {/* Footer Action */}
                        {!isLocked && (
                          <div className={`mt-6 pt-6 border-t ${isCompleted ? 'border-green-100' : 'border-slate-100'} flex items-center justify-between`}>
                            <span className={`text-xs font-black uppercase tracking-wider ${isCompleted ? 'text-green-600' : `text-${area.color}-600`}`}>
                              {isCompleted ? 'Repasar Lección' : 'Comenzar'}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${isCompleted ? 'bg-green-100 text-green-600' : `bg-${area.color}-50 text-${area.color}-600`}`}>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* SKILL MODAL (PRESERVED FUNCTIONALITY) */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col relative overflow-hidden animate-scaleIn shadow-2xl border border-white/20">
            <button onClick={() => setSelectedSkill(null)} className="absolute top-6 right-6 z-10 w-12 h-12 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-slate-700 transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-gradient-to-b from-slate-50 to-white p-10 text-center">
                <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 border border-slate-100 p-3">
                  <img src={AREA_ILLUSTRATIONS[selectedSkill.area] || ILLUSTRATIONS.ourSolution} alt="" className="w-14 h-14" loading="lazy" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{selectedSkill.name}</h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">{selectedSkill.description}</p>
              </div>

              <div className="p-10">
                <ExerciseRunner
                  key={selectedSkill.contentKey}
                  contentKey={selectedSkill.contentKey}
                  isAlreadyCompleted={!!isAlreadyCompleted}
                  pastEvaluation={
                    // Hidratación: si la skill ya fue completada y guardó
                    // evaluation_data (Tipo C), pasamos los datos al panel
                    // para mostrar resultados directos en lugar de chat.
                    (userProgress[selectedSkill.id] as any)?.evaluation_data || null
                  }
                  onComplete={(pct, evalData) => completeSkill(50, pct, evalData)}
                  onBack={() => setSelectedSkill(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};