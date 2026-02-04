import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowRight, Check, Sparkles, Map as MapIcon, Award, ChevronRight, Star } from 'lucide-react';

interface OnboardingProps {
  currentUser: User;
  onComplete: (updatedUser: User) => void;
}

const profileDescriptions: Record<string, string> = {
  "Resultados": "Eres un líder orientado a la acción y al cumplimiento de metas. Te caracterizas por tu pragmatismo, velocidad en la toma de decisiones y enfoque en la eficiencia.",
  "Colaborativo": "Eres el pegamento que mantiene unido al equipo. Valoras la armonía, la inclusión y que todas las voces sean escuchadas.",
  "Inspirador": "Movilizas a las personas a través de una visión contagiosa y energía positiva. Tu entusiasmo es tu superpoder.",
  "Coach": "Tu enfoque está en el desarrollo humano. Ves el potencial en cada persona y dedicas tiempo a mentorizarlos."
};

const profileEmojis: Record<string, string> = {
  "Resultados": "🚀",
  "Colaborativo": "🤝",
  "Inspirador": "✨",
  "Coach": "🌱"
};

const questions = [
  // --- COMUNICACIÓN (3) ---
  {
    id: 1,
    category: "Comunicación",
    question: "¿Qué es lo más importante para ti en una reunión de equipo?",
    options: [
      { text: "Que salgamos con un plan de acción claro y fechas", profile: "Resultados" },
      { text: "Que todos hayan tenido oportunidad de opinar", profile: "Colaborativo" },
      { text: "Que el equipo salga motivado y con energía", profile: "Inspirador" },
      { text: "Que hayamos aprendido algo nuevo juntos", profile: "Coach" }
    ]
  },
  {
    id: 2,
    category: "Comunicación",
    question: "Tienes que dar una mala noticia al equipo. ¿Cómo lo abordas?",
    options: [
      { text: "Voy directo al grano y explico los pasos a seguir", profile: "Resultados" },
      { text: "Reúno al grupo para contenerlos emocionalmente", profile: "Colaborativo" },
      { text: "Enfoco la conversación en el futuro y la esperanza", profile: "Inspirador" },
      { text: "Uso la situación como una oportunidad de aprendizaje", profile: "Coach" }
    ]
  },
  {
    id: 3,
    category: "Comunicación",
    question: "Alguien no está de acuerdo contigo. Tu reacción es...",
    options: [
      { text: "Mostrar datos y hechos que respalden mi postura", profile: "Resultados" },
      { text: "Buscar un punto medio donde ambos ganemos", profile: "Colaborativo" },
      { text: "Intentar persuadirlos con mi visión del proyecto", profile: "Inspirador" },
      { text: "Preguntarles por qué piensan así para entender su lógica", profile: "Coach" }
    ]
  },
  // --- TRABAJO EN EQUIPO (3) ---
  {
    id: 4,
    category: "Equipo",
    question: "Cuando un miembro del equipo no cumple con las expectativas, tú...",
    options: [
      { text: "Le explicas claramente los datos y el impacto en los resultados", profile: "Resultados" },
      { text: "Buscas entender si hay problemas personales afectándolo", profile: "Colaborativo" },
      { text: "Le recuerdas la importancia de su rol para la visión general", profile: "Inspirador" },
      { text: "Preguntas qué obstáculos enfrenta y cómo puedes ayudar", profile: "Coach" }
    ]
  },
  {
    id: 5,
    category: "Equipo",
    question: "¿Cómo prefieres celebrar un éxito?",
    options: [
      { text: "Analizando las métricas alcanzadas y el ROI", profile: "Resultados" },
      { text: "Con una comida o salida todos juntos", profile: "Colaborativo" },
      { text: "Con un reconocimiento público y aplausos", profile: "Inspirador" },
      { text: "Destacando el crecimiento personal de cada uno", profile: "Coach" }
    ]
  },
  {
    id: 6,
    category: "Equipo",
    question: "Llega un proyecto nuevo y urgente. ¿Qué haces?",
    options: [
      { text: "Asigno tareas rápidamente según quién es más rápido", profile: "Resultados" },
      { text: "Lo conversamos entre todos para dividir la carga", profile: "Colaborativo" },
      { text: "Hago un discurso motivacional para arrancar con todo", profile: "Inspirador" },
      { text: "Evalúo quién necesita desarrollar qué habilidad con esto", profile: "Coach" }
    ]
  },
  // --- AUTOLIDERAZGO (2) ---
  {
    id: 7,
    category: "Autoliderazgo",
    question: "Cometiste un error importante. ¿Qué piensas primero?",
    options: [
      { text: "¿Cómo soluciono esto ya mismo?", profile: "Resultados" },
      { text: "¿A quién afecté y cómo pido disculpas?", profile: "Colaborativo" },
      { text: "No pasa nada, de todo se sale adelante", profile: "Inspirador" },
      { text: "¿Qué aprendí de esto para que no pase de nuevo?", profile: "Coach" }
    ]
  },
  {
    id: 8,
    category: "Autoliderazgo",
    question: "Sientes mucho estrés por la carga de trabajo. Tú...",
    options: [
      { text: "Priorizo ruthlessly y elimino lo que no da valor", profile: "Resultados" },
      { text: "Pido ayuda a mis colegas de confianza", profile: "Colaborativo" },
      { text: "Visualizo la meta final para recargar energía", profile: "Inspirador" },
      { text: "Me tomo un tiempo para reflexionar y meditar", profile: "Coach" }
    ]
  },
  // --- NEGOCIACIÓN (2) ---
  {
    id: 9,
    category: "Negociación",
    question: "Un cliente te dice que 'NO'. Tú...",
    options: [
      { text: "Le muestro estadísticas de por qué se equivoca", profile: "Resultados" },
      { text: "Trato de mantener la buena relación a largo plazo", profile: "Colaborativo" },
      { text: "Le pinto un cuadro de lo increíble que sería el futuro juntos", profile: "Inspirador" },
      { text: "Indago profundamente para entender su objeción real", profile: "Coach" }
    ]
  },
  {
    id: 10,
    category: "Negociación",
    question: "Estás negociando presupuesto. Tu foco es...",
    options: [
      { text: "Maximizar la rentabilidad y eficiencia", profile: "Resultados" },
      { text: "Que ambas partes sientan que el trato es justo", profile: "Colaborativo" },
      { text: "Vender el valor intangible y la visión", profile: "Inspirador" },
      { text: "Entender las necesidades subyacentes de la otra parte", profile: "Coach" }
    ]
  }
];

import { updateProfile } from '../src/lib/supabase-helpers';

export const Onboarding: React.FC<OnboardingProps> = ({ currentUser, onComplete }) => {
  const [step, setStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [finalProfile, setFinalProfile] = useState<string>('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  useEffect(() => {
    console.log('🎯 Quiz inicializado con', questions.length, 'preguntas');
  }, []);

  const handleAnswer = (profile: string) => {
    const nextAnswers = { ...quizAnswers, [Object.keys(quizAnswers).length + 1]: profile };
    setQuizAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length < questions.length) {
      // Next question logic (handled by render)
    } else {
      const counts = Object.values(nextAnswers).reduce((acc: any, curr: string) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
      const result = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

      // We don't save to localStorage anymore
      setFinalProfile(result);
      setStep(2);
    }
  };

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleFinish = async () => {
    try {
      if (currentUser && currentUser.id) {
        // Al completar onboarding, actualizar el profile del usuario usando updateProfile()
        // Guardamos: onboardingCompleted: true, perfil: { areasInteres: [...] }, perfil_lider y XP
        const result = await updateProfile(currentUser.id, {
          onboarding_completed: true,
          perfil_lider: `Líder ${finalProfile}`,
          perfil: { areasInteres: selectedAreas },
          xp: (currentUser.xp || 0) + 100 // Bonus de bienvenida
        });

        if (result) {
          console.log('✅ Onboarding completado y guardado en Supabase');

          // Mapear el resultado de Supabase al tipo User de la app
          const updatedUser: User = {
            id: result.id,
            username: result.email,
            fullName: result.username,
            role: result.role,
            company: result.empresa_id,
            onboardingCompleted: result.onboarding_completed,
            leaderProfile: result.perfil_lider,
            xp: result.xp,
            rank: result.nivel
          };

          onComplete(updatedUser);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error guardando onboarding:', error);
    }

    // Fallback in case of error (with current data as best effort)
    onComplete(currentUser);
  };

  // --- STEP 1: QUIZ (Enhanced Visuals) ---
  if (step === 1) {
    const currentQIndex = Object.keys(quizAnswers).length;
    const currentQ = questions[currentQIndex];

    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 font-sans">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-3xl w-full relative z-10">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white shadow-sm border border-purple-100 text-purple-600 font-bold text-xs uppercase tracking-widest mb-4">
              🎯 Descubriendo tu Estilo
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Pregunta <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{currentQIndex + 1}</span> de {questions.length}
            </h2>

            {/* Progress Bar */}
            <div className="h-4 bg-slate-200 rounded-full w-full max-w-md mx-auto overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-purple-100/50 border border-white/50 backdrop-blur-sm">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 text-center leading-snug">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.profile)}
                  className="group relative p-6 bg-slate-50 hover:bg-white rounded-2xl border-2 border-slate-100 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-left flex items-center justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-lg font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    {opt.text}
                  </span>
                  <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-purple-500 group-hover:bg-purple-500 flex items-center justify-center transition-all shadow-sm group-hover:scale-110">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="mt-8 mx-auto flex text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 2: RESULT (Celebratory) ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in font-sans relative overflow-hidden">
        {/* Confetti / Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-20 w-32 h-32 bg-purple-500 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500 rounded-full blur-[80px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          <div className="inline-block mb-6 animate-bounce">
            <span className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {profileEmojis[finalProfile] || '✨'}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-xl">
            ¡Eres Líder <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{finalProfile}!</span>
          </h1>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl mb-12 transform hover:scale-[1.01] transition-transform duration-500">
            <p className="text-xl md:text-2xl text-cyan-50 font-light leading-relaxed italic">
              "{profileDescriptions[finalProfile]}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-6 rounded-3xl flex items-center gap-5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-green-400 font-black text-xl uppercase tracking-wide">Badge Desbloqueado</h3>
                <p className="text-white font-medium">Pionero Fundacional (+100 XP)</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 p-6 rounded-3xl flex items-center gap-5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                <MapIcon className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-pink-400 font-black text-xl uppercase tracking-wide">Mapa Activado</h3>
                <p className="text-white font-medium">Acceso Total Concedido</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="group relative px-10 py-5 bg-white text-slate-900 text-xl font-black rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              Explorar mi Ruta <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 3: AREAS (The "Step 1" in prompt - Visual Match) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* HEADER GRADIENT */}
      <div className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 pt-16 pb-32 px-6 rounded-b-[3rem] shadow-xl relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 opacity-90">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">Configuración Inicial</span>
              <Star className="w-4 h-4 text-yellow-300 fill-current animate-spin-slow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-md">
              ¡Bienvenido! 🎉 Elige tus áreas
            </h1>
            <p className="text-lg text-purple-100 font-medium max-w-xl">
              Selecciona las competencias que quieres priorizar en tu entrenamiento.
            </p>
          </div>

          <button onClick={() => setStep(2)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl backdrop-blur-md font-bold transition-all border border-white/20">
            ← Volver
          </button>
        </div>
      </div>

      {/* CARDS CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { id: 'comunicacion', icon: '💬', name: 'Comunicación', desc: 'Hablar y escuchar', color: 'purple', gradient: 'from-purple-500 to-pink-500' },
            { id: 'liderazgo', icon: '👑', name: 'Liderazgo', desc: 'Inspirar a otros', color: 'cyan', gradient: 'from-cyan-400 to-blue-500' },
            { id: 'autoliderazgo', icon: '⚡', name: 'Autoliderazgo', desc: 'Gestión personal', color: 'green', gradient: 'from-green-400 to-teal-500' },
            { id: 'negociacion', icon: '🤝', name: 'Negociación', desc: 'Acuerdos win-win', color: 'pink', gradient: 'from-pink-500 to-rose-500' }
          ].map((area) => {
            const isSelected = selectedAreas.includes(area.id);
            return (
              <div
                key={area.id}
                onClick={() => toggleArea(area.id)}
                className={`
                            relative bg-white rounded-[2.5rem] p-8 cursor-pointer transition-all duration-500 group
                            ${isSelected
                    ? `ring-8 ring-${area.color}-100 shadow-2xl shadow-${area.color}-200 scale-105 z-10`
                    : `hover:scale-105 hover:shadow-xl shadow-lg shadow-slate-200 border border-slate-100`
                  }
                        `}
              >
                {isSelected && (
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${area.gradient} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform scale-110 animate-bounce`}>
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className={`text-7xl mb-6 transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 drop-shadow-sm`}>
                    {area.icon}
                  </div>
                  <h3 className={`text-2xl font-black mb-2 transition-colors ${isSelected ? `text-${area.color}-600` : 'text-slate-800'}`}>
                    {area.name}
                  </h3>
                  <p className="text-slate-400 font-medium text-sm group-hover:text-slate-500 transition-colors">
                    {area.desc}
                  </p>
                </div>

                {/* Sutil background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-b ${area.gradient} opacity-0 group-hover:opacity-5 rounded-[2.5rem] transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            );
          })}
        </div>

        {/* FOOTER ACTION */}
        <div className="mt-16 text-center animate-fade-in-up">
          {selectedAreas.length === 0 ? (
            <div className="inline-block px-8 py-4 bg-white rounded-2xl shadow-lg border border-slate-100">
              <p className="text-slate-500 font-bold flex items-center gap-2">
                <span className="text-2xl">😊</span> ¡Selecciona al menos 1 área para continuar!
              </p>
            </div>
          ) : (
            <button
              onClick={handleFinish}
              className="px-16 py-6 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xl font-black rounded-[2rem] shadow-xl shadow-green-200 hover:shadow-2xl hover:shadow-green-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto group"
            >
              ¡Comenzar mi entrenamiento! <span className="group-hover:rotate-12 transition-transform text-2xl">💪</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};