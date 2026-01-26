import React, { useState, useEffect } from 'react';
import { User, Kudo, UserProgress } from '../types';
import { calculateRank } from '../utils/data';
import { LogOut, Heart, Award, TrendingUp, Users, X, Send, Medal, Star } from 'lucide-react';

interface SupervisorDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ currentUser, onLogout }) => {
  const [team, setTeam] = useState<User[]>([]);
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [showKudoModal, setShowKudoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [kudoMessage, setKudoMessage] = useState('');
  const [kudoValue, setKudoValue] = useState('Colaboración');
  const [showTeamDashboard, setShowTeamDashboard] = useState(false);
  const [miEquipo, setMiEquipo] = useState<any[]>([]);
  const [equipoStats, setEquipoStats] = useState({ totalParticipantes: 0, progresoPromedio: 0, xpTotal: 0, totalBadges: 0 });
  const [kudosDestinatario, setKudosDestinatario] = useState('');
  const [kudosMensaje, setKudosMensaje] = useState('');
  const [analyticsEquipo, setAnalyticsEquipo] = useState({ topPerformers: [] as any[], necesitanApoyo: [] as any[], topHabilidades: [] as any[], areasMasCompletadas: [] as any[] });
  const [showMapaParticipante, setShowMapaParticipante] = useState(false);
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setTeam(allUsers.filter((u: User) => u.supervisor === currentUser.username));
    setKudos(JSON.parse(localStorage.getItem('kudos') || '[]'));
  }, [currentUser.username]);

  const getNombreEmpresa = () => {
    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    const empresa = companies.find((c: any) => c.id === currentUser.company);
    return empresa ? empresa.name : 'Tu Empresa';
  };

  const calcularEquipoStats = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const participantes = users.filter((u: User) => u.role === 'participante' && u.company === currentUser.company);
    const equipoData = participantes.map((u: User) => {
        const progreso = userProgress[u.username] || {};
        const completadas = Object.values(progreso).filter((h: any) => h.status === 'conquered' || h.status === 'completed').length;
        return { username: u.username, fullName: u.fullName, xp: u.xp || 0, rango: u.rank || 'Aprendiz', habilidadesCompletadas: completadas };
    });
    const totalParticipantes = equipoData.length;
    const progresoPromedio = totalParticipantes > 0 ? Math.round(equipoData.reduce((acc: number, p: any) => acc + p.habilidadesCompletadas, 0) / totalParticipantes / 24 * 100) : 0;
    const xpTotal = equipoData.reduce((acc: number, p: any) => acc + p.xp, 0);
    let totalBadges = 0;
    participantes.forEach((p: User) => {
        const progreso = userProgress[p.username] || {};
        if (p.onboardingCompleted) totalBadges++;
        Object.values(progreso).forEach((h: any) => { if ((h.status === 'conquered' || h.status === 'completed') && (h.score || 0) >= 90) totalBadges++; });
    });
    setEquipoStats({ totalParticipantes, progresoPromedio, xpTotal, totalBadges });
    setMiEquipo(equipoData);
  };

  const enviarKudo = () => {
    if (!kudosDestinatario || !kudosMensaje.trim()) return;
    const storedKudos = JSON.parse(localStorage.getItem('kudos') || '[]');
    const nuevoKudo = {
      id: `k${Date.now()}`,
      from: currentUser.username,
      // @ts-ignore
      deNombre: currentUser.fullName,
      to: kudosDestinatario === 'todos' ? 'Todo el Equipo' : kudosDestinatario,
      message: kudosMensaje,
      value: 'Reconocimiento Especial',
      createdAt: new Date().toISOString(),
      company: currentUser.company
    };
    storedKudos.push(nuevoKudo);
    localStorage.setItem('kudos', JSON.stringify(storedKudos));
    setKudos(storedKudos);
    setKudosDestinatario('');
    setKudosMensaje('');
    alert('✅ ¡Reconocimiento enviado con éxito!');
  };

  const calcularAnalyticsEquipo = () => {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const topPerformers = [...miEquipo].sort((a, b) => b.xp - a.xp).slice(0, 3);
    const necesitanApoyo = miEquipo.filter(p => p.habilidadesCompletadas < 3);
    const areasCounts = { c: 0, l: 0, a: 0, n: 0 };
    const areasTotal = miEquipo.length * 6;
    miEquipo.forEach(p => {
      const progreso = userProgress[p.username] || {};
      Object.keys(progreso).forEach(skillId => {
        const h = progreso[skillId];
        if (h.status === 'completed' || h.status === 'conquered') {
          const prefix = skillId.charAt(0) as keyof typeof areasCounts;
          if (areasCounts[prefix] !== undefined) areasCounts[prefix]++;
        }
      });
    });
    const areasMasCompletadas = [
      { nombre: 'Comunicación', porcentaje: areasTotal > 0 ? Math.round((areasCounts.c / areasTotal) * 100) : 0 },
      { nombre: 'Liderazgo', porcentaje: areasTotal > 0 ? Math.round((areasCounts.l / areasTotal) * 100) : 0 },
      { nombre: 'Autoliderazgo', porcentaje: areasTotal > 0 ? Math.round((areasCounts.a / areasTotal) * 100) : 0 },
      { nombre: 'Negociación', porcentaje: areasTotal > 0 ? Math.round((areasCounts.n / areasTotal) * 100) : 0 }
    ].sort((a, b) => b.porcentaje - a.porcentaje);
    setAnalyticsEquipo({ topPerformers, necesitanApoyo, topHabilidades: [], areasMasCompletadas });
  };

  const verMapaParticipante = (username: string) => {
    setParticipanteSeleccionado(username);
    setShowMapaParticipante(true);
  };

  const renderMapaParticipante = (username: string) => {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const progreso = userProgress[username] || {};
    const areas = [ { nombre: 'Comunicación', prefix: 'c', color: 'cyan' }, { nombre: 'Liderazgo', prefix: 'l', color: 'orange' }, { nombre: 'Autoliderazgo', prefix: 'a', color: 'purple' }, { nombre: 'Negociación', prefix: 'n', color: 'green' } ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map(area => {
          const habilidadesArea = Object.keys(progreso).filter(id => id.startsWith(area.prefix) && (progreso[id].status === 'completed' || progreso[id].status === 'conquered'));
          return (
            <div key={area.nombre} className={`bg-${area.color}-50 p-6 rounded-3xl border border-${area.color}-200`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-800">{area.nombre}</h4>
                <span className={`text-xs font-black bg-${area.color}-100 text-${area.color}-700 px-2 py-1 rounded-lg`}>{habilidadesArea.length}/6</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 mb-4 border border-slate-100">
                <div className={`bg-${area.color}-500 h-3 rounded-full`} style={{width: `${(habilidadesArea.length / 6) * 100}%`}} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(num => {
                  const skillId = `${area.prefix}${num}`;
                  const h = progreso[skillId];
                  return (
                    <div key={skillId} className={`h-2 rounded-full ${h?.status === 'conquered' || h?.status === 'completed' ? `bg-${area.color}-400` : 'bg-slate-200'}`} title={`Habilidad ${num}`}></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => { if (showTeamDashboard && currentUser.role === 'supervisor') calcularEquipoStats(); }, [showTeamDashboard]);
  useEffect(() => { if (miEquipo.length > 0) calcularAnalyticsEquipo(); }, [miEquipo]);

  const handleSendKudo = () => {
    const newKudo: Kudo = {
      id: `k${Date.now()}`,
      from: currentUser.username,
      to: selectedUser,
      message: kudoMessage.replace(/[<>]/g, ''),
      value: kudoValue,
      createdAt: new Date().toISOString(),
      company: currentUser.company || ''
    };
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = allUsers.findIndex((u: User) => u.username === selectedUser);
    if (userIndex >= 0) {
      allUsers[userIndex].xp = (allUsers[userIndex].xp || 0) + 10;
      allUsers[userIndex].rank = calculateRank(allUsers[userIndex].xp).name;
      localStorage.setItem('users', JSON.stringify(allUsers));
      setTeam(allUsers.filter((u: User) => u.supervisor === currentUser.username));
    }
    const updatedKudos = [newKudo, ...kudos];
    setKudos(updatedKudos);
    localStorage.setItem('kudos', JSON.stringify(updatedKudos));
    setShowKudoModal(false);
    setKudoMessage('');
  };

  const getTeamTotalXP = () => team.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  const getKudosSentCount = () => kudos.filter(k => k.from === currentUser.username).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-30"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* HEADER SPEC: Purple -> Blue -> Cyan */}
      <header className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-xl backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-6">
           <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-md font-bold hover:scale-105">
              <span className="text-xl">←</span>
              <span className="text-sm">Volver</span>
           </button>
          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-white tracking-tight">DASHBOARD</h1>
            <span className="text-xs font-bold text-cyan-100 tracking-wider uppercase">{currentUser.company?.replace('_', ' ')}</span>
          </div>
          {currentUser.role === 'supervisor' && (
            <button onClick={() => setShowTeamDashboard(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl hover:scale-105 transition shadow-lg font-black group">
                <span className="group-hover:rotate-12 transition-transform">👥</span>
                <span>Mi Equipo</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-white">
            <div className="font-bold text-lg">{currentUser.fullName}</div>
            <div className="text-xs text-cyan-200 font-bold opacity-80 uppercase tracking-widest">Supervisor</div>
          </div>
          <button onClick={onLogout} className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-white hover:rotate-90">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-12 relative z-10">
        {/* STATS CARDS - GRADIENTS & EMOJIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] p-8 text-white shadow-2xl hover:-translate-y-2 transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><TrendingUp className="w-8 h-8" /></div>
              <span className="text-cyan-100 text-xs font-black uppercase tracking-widest">Total Equipo</span>
            </div>
            <div className="text-6xl font-black mb-1 relative z-10 tracking-tight">{getTeamTotalXP()}</div>
            <div className="text-cyan-100 font-medium relative z-10">Puntos de Experiencia (XP)</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-[2rem] p-8 text-white shadow-2xl hover:-translate-y-2 transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><Users className="w-8 h-8" /></div>
              <span className="text-orange-100 text-xs font-black uppercase tracking-widest">Miembros</span>
            </div>
            <div className="text-6xl font-black mb-1 relative z-10 tracking-tight">{team.length}</div>
            <div className="text-orange-100 font-medium relative z-10">Activos en plataforma</div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-2xl hover:-translate-y-2 transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><Heart className="w-8 h-8" /></div>
              <span className="text-pink-100 text-xs font-black uppercase tracking-widest">Kudos</span>
            </div>
            <div className="text-6xl font-black mb-1 relative z-10 tracking-tight">{getKudosSentCount()}</div>
            <div className="text-pink-100 font-medium relative z-10">Enviados por ti</div>
          </div>
        </div>

        {/* TEAM GRID */}
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
             <span className="text-4xl">👥</span> Mi Equipo <span className="bg-slate-200 text-slate-600 text-sm font-bold px-3 py-1 rounded-full">{team.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map(member => {
              const rankInfo = calculateRank(member.xp || 0);
              return (
                <div key={member.username} className="bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-${rankInfo.color}-500`}></div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">{member.fullName}</h3>
                      <p className="text-sm text-slate-400 font-medium">@{member.username}</p>
                    </div>
                    <div className="text-center bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-slate-100 transition-colors">
                      <div className="text-3xl animate-bounce">{rankInfo.emoji}</div>
                    </div>
                  </div>

                  <div className="mb-8 bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
                     <span className="text-slate-400 text-xs font-black uppercase tracking-wider">XP Total</span>
                     <span className="text-3xl font-black text-slate-800">{member.xp || 0}</span>
                  </div>

                  {member.leaderProfile ? (
                     <div className="mb-8">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-2">Perfil de Líder</div>
                        <div className="text-sm font-bold text-slate-700 bg-cyan-50 border border-cyan-100 px-4 py-3 rounded-xl flex items-center gap-3">
                           <span className="text-xl">✨</span> {member.leaderProfile}
                        </div>
                     </div>
                  ) : (
                    <div className="mb-8">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-2">Estado</div>
                        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 italic">
                           En Onboarding...
                        </div>
                     </div>
                  )}

                  <button 
                    onClick={() => { setSelectedUser(member.username); setShowKudoModal(true); }}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5 fill-white/20" /> Enviar Kudo
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY / KUDOS - TIMELINE STYLE */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">💌</span> Actividad Reciente
          </h2>
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
            {/* Timeline Line */}
            <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100 z-0"></div>
            
            {kudos.filter(k => k.from === currentUser.username).length === 0 ? (
               <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                   <Heart className="w-20 h-20 text-slate-100 mb-4" />
                   <p className="font-medium text-lg">No has enviado reconocimientos aún.</p>
               </div>
            ) : (
               <div className="relative z-10">
                  {kudos.filter(k => k.from === currentUser.username).map((kudo, idx) => (
                    <div key={kudo.id} className="p-8 flex items-start gap-8 hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                       <div className="w-16 h-16 bg-white border-4 border-pink-100 rounded-full flex items-center justify-center text-3xl shadow-sm z-10 group-hover:scale-110 transition-transform">
                          🎁
                       </div>
                       <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-3">
                             <h4 className="font-bold text-slate-800 text-lg">Para: <span className="text-purple-600">{team.find(u => u.username === kudo.to)?.fullName || kudo.to}</span></h4>
                             <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{new Date(kudo.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 text-lg italic leading-relaxed mb-4">"{kudo.message}"</p>
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-700 text-xs rounded-lg font-black border border-purple-100 uppercase tracking-wider">
                             <Star className="w-3 h-3 fill-current" /> {kudo.value}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL KUDO */}
      {showKudoModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn border border-white/20">
               <div className="bg-gradient-to-r from-pink-500 to-red-500 p-8 text-white text-center">
                  <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                     <Heart className="w-10 h-10 fill-white animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black">Enviar Reconocimiento</h3>
                  <p className="text-pink-100 font-medium mt-1">Celebra los logros de tu equipo</p>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                     <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Valor Demostrado</label>
                     <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-pink-500 font-bold text-slate-700" value={kudoValue} onChange={(e) => setKudoValue(e.target.value)}>
                        <option>Colaboración</option><option>Iniciativa</option><option>Excelencia</option><option>Innovación</option><option>Liderazgo</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tu Mensaje</label>
                     <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-pink-500 h-32 resize-none text-slate-600" placeholder="Ej: ¡Gracias por tu increíble apoyo en el proyecto!" value={kudoMessage} onChange={(e) => setKudoMessage(e.target.value)}></textarea>
                  </div>
                  <div className="flex gap-4 pt-2">
                     <button onClick={() => setShowKudoModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                     <button onClick={handleSendKudo} className="flex-1 py-4 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 shadow-lg shadow-pink-200 hover:scale-105 transition-all">Enviar ❤️</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* MODAL MI EQUIPO DETALLADO */}
      {currentUser.role === 'supervisor' && showTeamDashboard && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-[3rem] max-w-7xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn relative shadow-2xl border-4 border-white">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-10 rounded-t-[2.5rem] text-white sticky top-0 z-20 shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black flex items-center gap-4 tracking-tight">
                       👥 Mi Equipo <span className="bg-white/20 text-base px-4 py-1.5 rounded-full backdrop-blur-md font-bold border border-white/20">{equipoStats.totalParticipantes} miembros</span>
                    </h2>
                    <p className="text-blue-200 mt-2 font-medium text-lg opacity-80">{getNombreEmpresa()}</p>
                </div>
                <button onClick={() => setShowTeamDashboard(false)} className="bg-white/10 hover:bg-white/20 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl backdrop-blur-md transition">✕</button>
            </div>
            
            <div className="p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   {[
                      { l: 'Participantes', v: equipoStats.totalParticipantes, c: 'cyan' },
                      { l: 'Progreso Promedio', v: `${equipoStats.progresoPromedio}%`, c: 'green' },
                      { l: 'XP Total', v: equipoStats.xpTotal, c: 'orange' },
                      { l: 'Badges', v: equipoStats.totalBadges, c: 'purple' }
                   ].map((s, i) => (
                      <div key={i} className={`bg-white p-8 rounded-[2rem] border-l-8 border-${s.c}-400 shadow-lg hover:-translate-y-1 transition-transform`}>
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{s.l}</p>
                         <p className={`text-5xl font-black text-${s.c}-600`}>{s.v}</p>
                      </div>
                   ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3"><span className="text-4xl">📋</span> Detalle de Participantes</h3>
                        {miEquipo.length > 0 ? (
                            <div className="space-y-5">
                            {miEquipo.map((participante: any) => (
                                <div key={participante.username} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-cyan-300 hover:shadow-xl transition-all group flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-110 transition-transform">
                                       {participante.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                       <p className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{participante.fullName}</p>
                                       <div className="flex gap-4 text-sm text-slate-500 font-bold mt-1">
                                          <span className="bg-slate-100 px-3 py-1 rounded-lg">⚡ {participante.xp} XP</span>
                                          <span className="bg-slate-100 px-3 py-1 rounded-lg uppercase">{participante.rango}</span>
                                       </div>
                                    </div>
                                    <div className="w-48 text-right">
                                        <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wide">{participante.habilidadesCompletadas} / 24 Habs.</p>
                                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden"><div className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all" style={{width: `${Math.round((participante.habilidadesCompletadas / 24) * 100)}%`}} /></div>
                                    </div>
                                    <button onClick={() => verMapaParticipante(participante.username)} className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all ml-2 shadow-sm" title="Ver Mapa"><span className="text-2xl">🗺️</span></button>
                                </div>
                            ))}
                            </div>
                        ) : <div className="text-center py-20 text-slate-400 italic">No hay participantes.</div>}
                    </div>

                    <div className="space-y-10">
                        {/* LEADERBOARD WITH MEDALS */}
                        <div className="bg-gradient-to-b from-yellow-50 to-white p-8 rounded-[2.5rem] border border-yellow-200 shadow-xl">
                            <h3 className="font-black text-2xl mb-8 flex items-center gap-3 text-yellow-800"><Medal className="w-8 h-8"/> Leaderboard</h3>
                            {analyticsEquipo.topPerformers.map((p, idx) => (
                                <div key={p.username} className={`flex items-center gap-4 p-4 rounded-2xl border-2 mb-4 transition-all hover:scale-105 ${idx === 0 ? 'bg-yellow-100 border-yellow-400 shadow-md' : idx === 1 ? 'bg-slate-100 border-slate-300' : 'bg-orange-50 border-orange-200'}`}>
                                    <div className="text-4xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                                    <div className="flex-1"><span className="font-bold text-slate-800 block text-lg">{p.fullName}</span><span className="text-xs font-black opacity-60 uppercase">{p.xp} XP</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg">
                            <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-3">🎯 Áreas Fuertes</h3>
                            {analyticsEquipo.areasMasCompletadas.slice(0, 3).map((area, idx) => (
                                <div key={idx} className="mb-4 last:mb-0">
                                    <div className="flex justify-between text-xs font-black text-slate-500 mb-2 uppercase tracking-wide"><span>{area.nombre}</span><span className="text-blue-600">{area.porcentaje}%</span></div>
                                    <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full transition-all" style={{width: `${area.porcentaje}%`}} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
      )}

      {/* MODAL VER MAPA */}
      {showMapaParticipante && participanteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl border border-white/20">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-t-[2.5rem] text-white sticky top-0 z-10 flex justify-between items-center shadow-md">
                <div><h3 className="text-3xl font-black flex items-center gap-3">🗺️ Mapa de Competencias</h3><p className="text-cyan-100 mt-1 font-medium text-lg">{miEquipo.find(p => p.username === participanteSeleccionado)?.fullName}</p></div>
                <button onClick={() => setShowMapaParticipante(false)} className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition backdrop-blur-md">✕</button>
            </div>
            <div className="p-10 bg-slate-50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center bg-white py-3 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto px-6">Modo Solo Lectura</p>
                {renderMapaParticipante(participanteSeleccionado)}
            </div>
            </div>
        </div>
      )}
    </div>
  );
};