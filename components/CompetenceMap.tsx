import React, { useState, useEffect } from 'react';
import { User, Skill, Company, UserProgress, Kudo, FlexArea } from '../types';
import { calculateRank, ranks } from '../utils/data';
import { LogOut, Lock, ChevronDown, ChevronRight, X, CheckCircle, Brain, Sparkles, Send, User as UserIcon, Lightbulb, BarChart2, Award, TrendingUp, AlertCircle, Star, Heart, ArrowRight, Check, Trophy, Medal } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSkills, getUserProgress, updateSkillProgress, updateProfile, getCompany, getAllProfiles } from '../src/lib/supabase-helpers';


interface CompetenceMapProps {
  currentUser: User;
  onLogout: () => void;
}

// --- UTILS ---
const countWords = (text: string) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const cleanJSON = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : '{}';
};

// --- TYPES ---
type SkillType = 'A' | 'B' | 'C' | 'D';

interface SkillContentA {
  type: 'A';
  theory: React.ReactNode;
  quiz: { pregunta: string; opciones: string[]; correcta: number }[];
}

interface SkillContentB {
  type: 'B';
  theory: React.ReactNode;
  minLength: number;
  evaluatorConfig: {
    promptGenerator: (response: string) => string;
    criteriaNames: string[];
  };
}

interface SkillContentC {
  type: 'C';
  scenario: {
    roleName: string;
    title: string;
    description: string;
    goal: string;
    headerGradient: string;
    initialMessage: string;
    userRole: string;
    personality: string;
    situation: string;
  };
  promptGenerator: (history: { rol: string, texto: string }[], lastUserMessage: string, scenario: any) => string;
};

interface SkillContentD {
  type: 'D';
  title: string;
  description: string;
  questions: string[];
  promptGenerator: (answers: string[]) => string;
}

type SkillContent = SkillContentA | SkillContentB | SkillContentC | SkillContentD;

// --- DATA: SKILL CONTENT MAP ---
export const SKILL_CONTENT: Record<string, SkillContent> = {
  // --- COMUNICACIÓN (TIPO A) ---
  c1: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">Las distinciones del lenguaje son observaciones que hacemos sobre cómo hablamos y escuchamos.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Conceptos Clave:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li><strong>Juicios:</strong> Afirmaciones sobre personas o situaciones</li>
          <li><strong>Hechos:</strong> Descripciones verificables</li>
          <li><strong>Declaraciones:</strong> Crean nueva realidad al decirse</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "¿Cuál de las siguientes es un JUICIO?", opciones: ["María es una excelente líder", "María coordinó 3 proyectos exitosos", "María tiene 5 años en la empresa", "María reportó los resultados ayer"], correcta: 0 },
      { pregunta: "Un HECHO se caracteriza por ser:", opciones: ["Una opinión personal", "Verificable y objetivo", "Una promesa a futuro", "Una interpretación"], correcta: 1 },
      { pregunta: "¿Cuál es una DECLARACIÓN?", opciones: ["Creo que funcionará", "El proyecto está atrasado", "Te declaro aprobado", "Probablemente llueva"], correcta: 2 },
      { pregunta: "Transformar 'Pedro es conflictivo' a un hecho sería:", opciones: ["Pedro siempre causa problemas", "Pedro tuvo 2 desacuerdos esta semana", "Pedro tiene mala actitud", "Pedro no colabora"], correcta: 1 },
      { pregunta: "Las distinciones del lenguaje nos ayudan a:", opciones: ["Hablar más rápido", "Evitar conversaciones", "Comunicarnos con mayor precisión", "Dar órdenes efectivas"], correcta: 2 }
    ]
  },
  c2: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">Los actos lingüísticos son acciones que realizamos al hablar. No solo describimos la realidad, sino que la creamos.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Los 5 Actos Lingüísticos:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Afirmaciones, Declaraciones, Pedidos, Ofertas, Promesas.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "¿Cuál es un ejemplo de DECLARACIÓN?", opciones: ["El proyecto avanza bien", "Te nombro coordinador del equipo", "¿Puedes ayudarme?", "Terminaré esto hoy"], correcta: 1 },
      { pregunta: "Un PEDIDO se caracteriza por:", opciones: ["Describir una situación", "Comprometerse a algo", "Solicitar algo a alguien", "Ofrecer ayuda"], correcta: 2 },
      { pregunta: "'Terminaré el informe el viernes' es un ejemplo de:", opciones: ["Afirmación", "Pedido", "Promesa", "Declaración"], correcta: 2 },
      { pregunta: "Una OFERTA es:", opciones: ["Pedir algo a otro", "Proponer algo a alguien", "Describir un hecho", "Crear nueva realidad"], correcta: 1 },
      { pregunta: "¿Cuál NO es un acto lingüístico?", opciones: ["Pedidos", "Promesas", "Suposiciones", "Ofertas"], correcta: 2 }
    ]
  },
  c3: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La escucha activa va más allá de oír palabras. Es comprender el mundo del otro.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Niveles de Escucha:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Pasiva, Activa, Ontológica.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "La escucha ontológica busca comprender:", opciones: ["Solo las palabras que dice", "El SER de la persona", "Los datos objetivos", "Las tareas pendientes"], correcta: 1 },
      { pregunta: "Parafrasear en la escucha activa significa:", opciones: ["Repetir exactamente lo mismo", "Reformular con tus palabras para confirmar", "Cambiar el tema", "Dar tu opinión"], correcta: 1 },
      { pregunta: "¿Cuál es una barrera para la escucha activa?", opciones: ["Hacer preguntas", "Contacto visual", "Juzgar mientras escuchas", "Tomar notas"], correcta: 2 },
      { pregunta: "Una pregunta de escucha activa sería:", opciones: ["Deberías hacer esto", "Yo en tu lugar haría", "¿Qué es lo que más te preocupa?", "Eso está mal"], correcta: 2 },
      { pregunta: "El lenguaje corporal en la escucha activa debe ser:", opciones: ["Cerrado y defensivo", "Abierto y receptivo", "Distraído", "No importa"], correcta: 1 }
    ]
  },
  c4: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La indagación es el arte de hacer preguntas poderosas.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Tipos de Preguntas:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Cerradas, Abiertas, Poderosas.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "Una pregunta PODEROSA es:", opciones: ["¿Terminaste o no?", "¿Por qué no lo hiciste?", "¿Qué aprendiste de esta experiencia?", "Deberías hacer esto, ¿verdad?"], correcta: 2 },
      { pregunta: "Las preguntas cerradas:", opciones: ["Invitan a reflexionar profundamente", "Solo admiten sí/no", "Son las más poderosas", "Generan nuevas posibilidades"], correcta: 1 },
      { pregunta: "¿Cuál pregunta genera más reflexión?", opciones: ["¿Lo lograste?", "¿Hiciste lo que te pedí?", "¿Qué obstáculos encontraste?", "¿Sí o no?"], correcta: 2 },
      { pregunta: "Una buena pregunta de indagación debe:", opciones: ["Juzgar al otro", "Tener respuesta obvia", "Empoderar y abrir posibilidades", "Ser rápida de responder"], correcta: 2 },
      { pregunta: "'¿Qué te impide lograrlo?' es una pregunta:", opciones: ["Cerrada", "Poderosa", "Básica", "Inútil"], correcta: 1 }
    ]
  },
  c5: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">Las conversaciones para la acción nos permiten coordinar tareas y compromisos.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Ciclo de Coordinación:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Preparación → Pedido/Oferta → Negociación → Promesa → Ejecución → Satisfacción</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "El ciclo de coordinación comienza con:", opciones: ["Una promesa", "Una preparación", "Una declaración", "Una ejecución"], correcta: 1 },
      { pregunta: "La negociación en el ciclo sirve para:", opciones: ["Evitar el compromiso", "Acordar condiciones satisfactorias", "Cancelar el pedido", "Juzgar al otro"], correcta: 1 },
      { pregunta: "Una conversación para coordinación efectiva requiere:", opciones: ["Solo dar órdenes", "Evitar compromisos claros", "Pedidos y promesas claras", "Ambigüedad en los plazos"], correcta: 2 },
      { pregunta: "La declaración de satisfacción ocurre:", opciones: ["Al inicio", "Durante la negociación", "Al completar la tarea", "No es necesaria"], correcta: 2 },
      { pregunta: "¿Qué pasa si no hay promesa clara?", opciones: ["Todo fluye mejor", "Hay confusión y conflictos", "No importa", "Se mejora la comunicación"], correcta: 1 }
    ]
  },
  c6: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La comunicación asertiva es expresar tus ideas, necesidades y emociones de manera clara y respetuosa.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">💡 Fórmula Asertiva:</h3>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 font-medium text-indigo-900 mb-4">
          "Cuando [conducta], me siento [emoción], porque [razón]. Necesito/Propongo [petición]"
        </div>
      </div>
    ),
    quiz: [
      { pregunta: "La comunicación asertiva busca:", opciones: ["Imponer tu punto de vista", "Evitar conflictos callándote", "Expresar respetando a ambos", "Ser siempre amable aunque te moleste"], correcta: 2 },
      { pregunta: "¿Cuál es un ejemplo de comunicación asertiva?", opciones: ["Como tú digas...", "¡Tú nunca entiendes!", "Me siento incómodo con esto, propongo que...", "No importa lo que piense"], correcta: 2 },
      { pregunta: "La comunicación pasiva se caracteriza por:", opciones: ["Expresar claramente tus necesidades", "No expresar lo que piensas o sientes", "Ser agresivo", "Ser directo"], correcta: 1 },
      { pregunta: "Decir 'Cuando llegas tarde, me preocupo' es:", opciones: ["Agresivo", "Pasivo", "Asertivo", "Manipulador"], correcta: 2 },
      { pregunta: "La asertividad requiere:", opciones: ["Gritar para que te escuchen", "Callarte tus opiniones", "Claridad y respeto mutuo", "Evitar a toda costa el conflicto"], correcta: 2 }
    ]
  },

  // --- LIDERAZGO ---
  l1: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La empatía es la capacidad de comprender y sentir las emociones del otro. Como líder, conectar emocionalmente con tu equipo genera confianza y compromiso.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Niveles de Empatía:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Cognitiva, Emocional, Compasiva.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "La empatía compasiva implica:", opciones: ["Solo entender racionalmente", "Sentir y actuar para ayudar", "Ignorar las emociones", "Dar soluciones rápidas"], correcta: 1 },
      { pregunta: "Para conectar con tu equipo debes:", opciones: ["Mantener distancia profesional siempre", "Validar emociones y escuchar genuinamente", "Ser siempre positivo", "Evitar temas personales"], correcta: 1 },
      { pregunta: "¿Cuál respuesta muestra empatía?", opciones: ["No es para tanto", "Todos pasamos por eso", "Veo que esto te afecta, cuéntame más", "Tienes que ser más fuerte"], correcta: 2 },
      { pregunta: "Compartir tu propia vulnerabilidad como líder:", opciones: ["Te debilita", "Genera conexión y confianza", "Es poco profesional", "No importa"], correcta: 1 },
      { pregunta: "La escucha empática requiere:", opciones: ["Dar consejos rápido", "Interrumpir para ayudar", "Atención plena sin interrumpir", "Cambiar de tema"], correcta: 2 }
    ]
  },
  l2: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">Delegar no es solo asignar tareas, es empoderar a otros, desarrollar talento y multiplicar tu impacto como líder.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Niveles de Delegación:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Tarea específica, Investigación, Recomendación, Acción con informe, Acción libre.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "Delegar efectivamente significa:", opciones: ["Deshacerte de lo que no quieres hacer", "Empoderar y desarrollar a otros", "Controlar cada paso", "Asignar solo tareas simples"], correcta: 1 },
      { pregunta: "El nivel más alto de delegación es:", opciones: ["Haz exactamente esto", "Recomienda qué hacer", "Actúa libremente, informa si hay problema", "Pide permiso para todo"], correcta: 2 },
      { pregunta: "Al delegar debes dar:", opciones: ["Solo la tarea", "Tarea + contexto + recursos + autoridad", "Órdenes estrictas", "Libertad total sin guía"], correcta: 1 },
      { pregunta: "Un error común al delegar es:", opciones: ["Dar contexto del por qué", "Reconocer el esfuerzo", "Micromanagear cada paso", "Confiar en el equipo"], correcta: 2 },
      { pregunta: "Si alguien logra el resultado de forma diferente a la tuya:", opciones: ["Corregir su método", "Celebrar el resultado logrado", "Criticar el proceso", "Hacerlo tú la próxima vez"], correcta: 1 }
    ]
  },
  l3: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Dar Feedback Constructivo</h3>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <p className="font-bold text-blue-900 mb-2">Situación:</p>
          <p className="text-blue-800">Ana es una desarrolladora con excelentes habilidades técnicas. Sin embargo, interrumpe constantemente en las reuniones de equipo.</p>
          <p className="mt-4 font-bold text-blue-900 mb-2">Tu tarea:</p>
          <p className="text-blue-800">Escribe un mensaje de feedback constructivo para Ana.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Especificidad", "Empatía", "Accionabilidad", "Balance"],
      promptGenerator: (response) => `Eres un coach ejecutivo experto. Evalúa esta respuesta con criterios profesionales.
RESPUESTA DEL PARTICIPANTE: "${response}"
Responde SOLO este JSON: { "scores": [85, 70, 90, 80], "feedback": "...", "aprobado": true }`
    }
  },
  l4: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Mensaje Motivacional</h3>
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
          <p className="font-bold text-orange-900 mb-2">Situación:</p>
          <p className="text-orange-800">Tu equipo lleva 3 meses trabajando en un proyecto desafiante. Notas señales de cansancio. Faltan 2 semanas para el lanzamiento.</p>
          <p className="mt-4 font-bold text-orange-900 mb-2">Tu tarea:</p>
          <p className="text-orange-800">Escribe un mensaje motivacional para compartir con el equipo.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Reconocimiento", "Propósito", "Energía", "Inspiración"],
      promptGenerator: (response) => `Eres un coach de liderazgo. Evalúa este mensaje motivacional. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0, 0, 0, 0], "feedback": "...", "aprobado": true }`
    }
  },
  l5: {
    type: 'C',
    scenario: {
      roleName: 'Carlos',
      title: 'Gestión de Quiebres',
      description: 'Prometió entregar feature ayer, no está lista. Objetivo: Resolver sin dañar relación.',
      goal: 'Resolver el quiebre sin dañar la relación',
      headerGradient: 'from-orange-500 to-red-500',
      initialMessage: "Hola, sé que esperabas el feature ayer... lo siento, tuve algunos problemas técnicos.",
      userRole: 'Líder',
      personality: "Defensivo al principio, pero valora la honestidad.",
      situation: "Carlos está estresado y siente que falló."
    },
    promptGenerator: (history, lastUserMessage, scenario) => `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
  },
  l6: {
    type: 'C',
    scenario: {
      roleName: 'Laura',
      title: 'Desarrollo de Personas',
      description: 'Laura (Junior Dev) busca consejo sobre su carrera.',
      goal: 'Hacer preguntas poderosas para que descubra su camino',
      headerGradient: 'from-orange-500 to-yellow-500',
      initialMessage: "Hola, ¿tienes un momento? Quería hablarte sobre mi carrera. No estoy segura hacia dónde enfocarme...",
      userRole: 'Coach',
      personality: "Insegura pero ambiciosa. Busca validación y guía.",
      situation: "Laura siente que está estancada."
    },
    promptGenerator: (history, lastUserMessage, scenario) => `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
  },

  // --- AUTOLIDERAZGO ---
  a1: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">El autoconocimiento es la capacidad de reconocer tus fortalezas, debilidades, valores, emociones y patrones de comportamiento.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Áreas del Autoconocimiento:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Fortalezas, Áreas de desarrollo, Valores, Triggers emocionales, Patrones de pensamiento.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "El autoconocimiento te permite:", opciones: ["Evitar tus debilidades", "Identificar patrones para gestionarlos mejor", "Ser perfecto en todo", "No necesitar feedback de otros"], correcta: 1 },
      { pregunta: "Una práctica efectiva de autoconocimiento es:", opciones: ["Ignorar lo que no te gusta de ti", "Solo enfocarte en fortalezas", "Reflexionar después de eventos importantes", "Evitar el feedback de otros"], correcta: 2 },
      { pregunta: "Tus 'triggers emocionales' son:", opciones: ["Situaciones que te activan emocionalmente", "Tus fortalezas principales", "Cosas que no te importan", "Objetivos profesionales"], correcta: 0 },
      { pregunta: "El feedback 360° es útil porque:", opciones: ["Solo te dice lo que haces bien", "Te da perspectivas que no ves en ti mismo", "Es opcional para el autoconocimiento", "Reemplaza tu autoreflexión"], correcta: 1 },
      { pregunta: "Una persona con alto autoconocimiento:", opciones: ["Nunca comete errores", "No necesita mejorar en nada", "Reconoce sus patrones y puede ajustarlos", "Evitar situaciones desafiantes"], correcta: 2 }
    ]
  },
  a2: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La gestión emocional es la habilidad de reconocer, comprender y regular tus emociones.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Proceso de Gestión Emocional:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Reconocer, Nombrar, Comprender, Regular, Expresar.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "Gestionar emociones significa:", opciones: ["Suprimirlas y no sentirlas", "Reconocerlas y regularlas conscientemente", "Expresarlas siempre inmediatamente", "Ignorarlas hasta que pasen"], correcta: 1 },
      { pregunta: "La 'pausa de 6 segundos' sirve para:", opciones: ["Evitar sentir la emoción", "Crear espacio entre estímulo y respuesta", "Olvidar lo que pasó", "Reprimir la emoción"], correcta: 1 },
      { pregunta: "¿Cuál es una respuesta emocionalmente gestionada?", opciones: ["Explotar inmediatamente", "Guardar todo hasta que explotes después", "Reconocer la emoción y expresarla constructivamente", "Fingir que nada te afecta"], correcta: 2 },
      { pregunta: "El reencuadre cognitivo consiste en:", opciones: ["Negar la realidad", "Ver la situación desde otra perspectiva", "Culpar a otros", "Evitar pensar en ello"], correcta: 1 },
      { pregunta: "Una emoción bien gestionada:", opciones: ["Desaparece instantáneamente", "Se comunica en el momento y forma adecuada", "Nunca se expresa", "Se vuelve más intensa"], correcta: 1 }
    ]
  },
  a3: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Construyendo Resiliencia</h3>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <p className="font-bold text-purple-900 mb-2">Situación:</p>
          <p className="text-purple-800">Trabajaste 3 meses en una propuesta y eligieron a la competencia. Te sientes desanimado.</p>
          <p className="mt-4 font-bold text-purple-900 mb-2">Tu tarea:</p>
          <p className="text-purple-800">Escribe una reflexión sobre cómo manejarías esta situación aplicando resiliencia.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Reconocimiento", "Crecimiento", "Acción", "Perspectiva"],
      promptGenerator: (response) => `Evalúa esta reflexión sobre resiliencia. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
    }
  },
  a4: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Matriz de Eisenhower</h3>
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <p className="font-bold text-purple-900 mb-2">Situación:</p>
          <p className="text-purple-800">Tienes 8 tareas pendientes (emails, presentación CEO, team building, cliente molesto, redes sociales, estrategia Q2, impresora, coaching). Clasifícalas.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Clasificación", "Criterio", "Priorización", "Delegación"],
      promptGenerator: (response) => `Evalúa esta clasificación Eisenhower. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
    }
  },
  a5: {
    type: 'D',
    title: "Autorregulación",
    description: "La autorregulación es tu capacidad de pausar, elegir y responder conscientemente.",
    questions: [
      "Describe una situación reciente donde reaccionaste impulsivamente.",
      "¿Cómo responderías de forma más consciente?",
      "¿Qué señales internas te indican que estás a punto de reaccionar?"
    ],
    promptGenerator: (answers) => `Eres un mentor sabio. Lee estas reflexiones: 1: "${answers[0]}" 2: "${answers[1]}" 3: "${answers[2]}". Genera un insight profundo que conecte sus respuestas y sugiera una práctica de mindfulness. Tono cálido.`
  },
  a6: {
    type: 'D',
    title: "Influencia Personal",
    description: "Reflexiona sobre cómo impactas a otros.",
    questions: [
      "Describe un momento de impacto positivo en alguien.",
      "¿Qué valores tuyos impactan más a tu equipo?",
      "¿Cómo podrías amplificar tu influencia positiva?"
    ],
    promptGenerator: (answers) => `Eres un mentor de liderazgo. Reflexiones del usuario: ${JSON.stringify(answers)}. Genera un insight sobre su estilo de influencia y cómo potenciarlo.`
  },

  // --- NEGOCIACIÓN ---
  n1: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La negociación efectiva busca acuerdos donde ambas partes ganen.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Principios Fundamentales:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Separar personas del problema, Intereses no posiciones, Opciones mutuas, Criterios objetivos, BATNA.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "El enfoque Win-Win en negociación significa:", opciones: ["Yo gano, tú pierdes", "Buscar acuerdos que beneficien a ambas partes", "Ceder en todo para mantener la relación", "Imponer mi solución de forma amable"], correcta: 1 },
      { pregunta: "Separar personas del problema implica:", opciones: ["Ignorar las emociones del otro", "Ser duro con las personas", "Atacar el desafío, no a la persona", "Evitar el conflicto siempre"], correcta: 2 },
      { pregunta: "BATNA es:", opciones: ["Tu posición inicial en la negociación", "Tu mejor alternativa si no hay acuerdo", "El objetivo ideal que buscas", "Una técnica de persuasión"], correcta: 1 },
      { pregunta: "Enfocarse en intereses vs posiciones significa:", opciones: ["Mantener firme tu posición inicial", "Preguntar 'por qué' quiere eso", "Ceder rápido en tus posiciones", "Negociar solo en términos de precio"], correcta: 1 },
      { pregunta: "Los criterios objetivos en negociación son útiles para:", opciones: ["Imponer tu punto de vista", "Evitar negociar", "Basar decisiones en estándares justos", "Manipular al otro"], correcta: 2 }
    ]
  },
  n2: {
    type: 'A',
    theory: (
      <div className="prose prose-lg text-slate-700">
        <p className="mb-4">La negociación se gana en la preparación.</p>
        <h3 className="text-xl font-bold text-slate-900 mb-2 mt-6">📌 Pasos de Preparación:</h3>
        <ul className="list-disc pl-5 space-y-1 mb-6">
          <li>Intereses, BATNA, Investigación, ZOPA, Opciones.</li>
        </ul>
      </div>
    ),
    quiz: [
      { pregunta: "La preparación en negociación es importante porque:", opciones: ["Improvisar genera mejores resultados", "Te permite identificar opciones y límites claros", "Es opcional si eres buen negociador", "Solo la usa el lado más débil"], correcta: 1 },
      { pregunta: "ZOPA (Zona de Posible Acuerdo) es:", opciones: ["Tu posición inicial", "El rango donde ambos pueden estar satisfechos", "Una técnica de presión", "El mínimo que aceptas"], correcta: 1 },
      { pregunta: "Si no hay ZOPA en una negociación:", opciones: ["Debes ceder más", "Presionas al otro", "Usas tu BATNA", "Terminas la relación"], correcta: 2 },
      { pregunta: "Investigar a la otra parte sirve para:", opciones: ["Encontrar sus debilidades y atacarlas", "Comprender sus intereses y generar opciones", "Copiar su estrategia", "Intimidarlos con información"], correcta: 1 },
      { pregunta: "Preparar opciones creativas antes de negociar:", opciones: ["Te hace parecer débil", "No es necesario si conoces tu objetivo", "Aumenta posibilidades de acuerdo Win-Win", "Confunde a la otra parte"], correcta: 2 }
    ]
  },
  n3: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Responder Objeciones</h3>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <p className="font-bold text-green-900 mb-2">Situación:</p>
          <p className="text-green-800">Negocias un contrato de $50k. Cliente dice: "La competencia cobra $35k".</p>
          <p className="mt-4 font-bold text-green-900 mb-2">Tu tarea:</p>
          <p className="text-green-800">Escribe tu respuesta manejando esta objeción.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Validación", "Diferenciación", "Evidencia", "Propuesta"],
      promptGenerator: (response) => `Evalúa esta manejo de objeción. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
    }
  },
  n4: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className="prose prose-lg text-slate-700">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 Ejercicio Práctico: Cerrar Negociación</h3>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <p className="font-bold text-green-900 mb-2">Situación:</p>
          <p className="text-green-800">Acuerdo verbal alcanzado: $45k, 90 días, soporte incluido. Proveedor: "Coordinemos pasos".</p>
          <p className="mt-4 font-bold text-green-900 mb-2">Tu tarea:</p>
          <p className="text-green-800">Escribe tu respuesta de cierre formalizando compromisos.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ["Resumen", "Claridad", "Plazos", "Formalización"],
      promptGenerator: (response) => `Evalúa este cierre de negociación. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
    }
  },
  n5: {
    type: 'C',
    scenario: {
      roleName: 'Roberto Martínez',
      title: 'Negociación con Cliente Difícil',
      description: 'Cliente quiere reducir 30% el presupuesto.',
      goal: 'Defender valor y buscar opciones creativas',
      headerGradient: 'from-green-500 to-teal-500',
      initialMessage: "Hola. Necesitamos renovar pero con presupuesto 30% menor.",
      userRole: 'Proveedor',
      personality: "Duro, enfocado en números, impaciente.",
      situation: "Roberto tiene presión de arriba para cortar costos."
    },
    promptGenerator: (history, lastUserMessage, scenario) => `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
  },
  n6: {
    type: 'C',
    scenario: {
      roleName: 'Patricia Gómez',
      title: 'Negociación Interna - Recursos',
      description: 'Necesitas 2 recursos, presupuesto congelado.',
      goal: 'Conseguir recursos o alternativas',
      headerGradient: 'from-green-500 to-blue-500',
      initialMessage: "Hola, vi tu pedido de 2 personas. El presupuesto está congelado, no será posible.",
      userRole: 'Empleado',
      personality: "Estricta con las normas pero razonable si hay valor.",
      situation: "Patricia cuida el presupuesto celosamente."
    },
    promptGenerator: (history, lastUserMessage, scenario) => `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
  }
};

export const CompetenceMap: React.FC<CompetenceMapProps> = ({ currentUser, onLogout }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [currentXP, setCurrentXP] = useState<number>(currentUser.xp || 0);
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

  // Exercise States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [textResponse, setTextResponse] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<{ scores: number[], feedback: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ rol: string, texto: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [chatFinished, setChatFinished] = useState(false);
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>([]);
  const [insightResult, setInsightResult] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [viewingChatHistory, setViewingChatHistory] = useState(false);

  useEffect(() => {
    if (currentUser.role !== 'participante') return;
    const storedKudos = JSON.parse(localStorage.getItem('kudos') || '[]');
    const leidos = JSON.parse(localStorage.getItem('kudosLeidos') || '[]');
    const misKudos = storedKudos.filter((k: any) =>
      k.to === currentUser.username || k.to === 'todos' || k.to === 'Todo el Equipo'
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setKudosRecibidos(misKudos);
    const unreadCount = misKudos.filter((k: any) => !leidos.includes(k.id)).length;
    setKudosNoLeidos(unreadCount);
    if (unreadCount > 0 && !sessionStorage.getItem('kudosModalShown')) {
      setTimeout(() => {
        setShowKudosModal(true);
        sessionStorage.setItem('kudosModalShown', 'true');
      }, 1500);
    }
  }, [currentUser]);

  const marcarKudosComoLeidos = () => {
    const leidos = JSON.parse(localStorage.getItem('kudosLeidos') || '[]');
    const ids = kudosRecibidos.map(k => k.id);
    const nuevos = Array.from(new Set([...leidos, ...ids]));
    localStorage.setItem('kudosLeidos', JSON.stringify(nuevos));
    setKudosNoLeidos(0);
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
        const mappedSkills: Skill[] = dbSkills.map((s: any) => ({
          id: s.id,
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
          const mappedProgress: UserProgress = {};
          Object.keys(progress).forEach(skillId => {
            const p = progress[skillId];
            mappedProgress[skillId] = {
              status: (p.status === 'completada' || p.status === 'completed') ? 'conquered' : p.status,
              xpEarned: p.xp_ganada || 0,
              score: p.score,
              conqueredAt: p.completed_at
            } as any;
          });
          setUserProgress(mappedProgress);
        }

        // Logic for FlexArea (still from localStorage or library if needed, but keeping existing logic structure)
        if (userCompany && userCompany.activeAreas.includes('custom')) {
          const empresaAreas = JSON.parse(localStorage.getItem('empresaAreas') || '{}');
          const companyConfig = empresaAreas[userCompany.id];
          if (companyConfig?.flexAreaId) {
            const library = JSON.parse(localStorage.getItem('flexAreasLibrary') || '[]');
            const flex = library.find((fa: FlexArea) => fa.id === companyConfig.flexAreaId);
            setFlexArea(flex || null);
          }
        }

      } catch (error) {
        console.error("❌ Error cargando datos de Supabase en CompetenceMap:", error);
      }
    };

    loadAppData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedSkill) {
      setCurrentQuestionIndex(0);
      setSelectedQuizOption(null);
      setQuizScore(0);
      setQuizFinished(false);
      setTextResponse('');
      setEvaluationResult(null);
      setChatHistory([]);
      setChatInput('');
      setTurnCount(0);
      setChatFinished(false);
      setReflectionAnswers(new Array(3).fill(''));
      setInsightResult(null);
      setViewingChatHistory(false);
      const content = SKILL_CONTENT[selectedSkill.contentKey];
      if (content && content.type === 'C') {
        setChatHistory([{ rol: content.scenario.roleName, texto: content.scenario.initialMessage }]);
      }
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (showProgressDashboard) {
      calcularDashboardStats();
    }
  }, [showProgressDashboard]);

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
        Object.keys(miProgreso).filter(id => id.startsWith(prefix) && (miProgreso[id].status === 'conquered' || miProgreso[id].status === 'completed')).length;

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

  const completeSkill = async (xp: number, score: number = 100) => {
    if (!selectedSkill || !currentUser.id) return;

    // 1. Update Progress in Supabase
    const result = await updateSkillProgress(currentUser.id, selectedSkill.id, 'conquered', 100);

    if (result) {
      // 2. Update Local State
      const newProgress = {
        ...userProgress,
        [selectedSkill.id]: {
          status: 'conquered' as const,
          xpEarned: xp,
          score: score,
          conqueredAt: new Date().toISOString()
        }
      };
      setUserProgress(newProgress);

      // 3. Update XP in Supabase
      const newXP = (currentUser.xp || 0) + xp;
      await updateProfile(currentUser.id, { xp: newXP });

      // 4. Update Local XP State
      setCurrentXP(newXP);

      console.log('✅ Habilidad completada y guardada en Supabase');
    } else {
      console.error('❌ Error guardando progreso en Supabase');
    }
  };

  // ... (Exercise handlers kept as is) ...
  const handleQuizOptionSelect = (optIndex: number, correctIndex: number, quizLength: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optIndex);
    let currentScore = quizScore;
    if (optIndex === correctIndex) {
      setQuizScore(prev => prev + 1);
      currentScore += 1;
    }
    setTimeout(() => {
      if (currentQuestionIndex < quizLength - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedQuizOption(null);
      } else {
        setQuizFinished(true);
        const finalScorePercent = Math.round((currentScore / quizLength) * 100);
        completeSkill(50, finalScorePercent);
      }
    }, 1500);
  };

  const handleGeminiEval = async (content: SkillContentB) => {
    if (countWords(textResponse) < 150) return;
    setIsEvaluating(true);
    try {
      const ai = new GoogleGenerativeAI(process.env.API_KEY || 'demo_key');
      const prompt = content.evaluatorConfig.promptGenerator(textResponse);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      let result;
      try {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        result = JSON.parse(cleanJSON(text || '{}'));
      } catch (e) {
        console.log("Mocking AI response", e);
        result = { scores: [85, 90, 80, 85], feedback: "Excelente respuesta demostrando empatía y claridad.", aprobado: true };
      }
      setEvaluationResult(result);
      if (result.aprobado || result.scores[0] > 60) {
        const avgScore = Math.round(result.scores.reduce((a: number, b: number) => a + b, 0) / result.scores.length);
        completeSkill(50, avgScore);
      }
    } catch (e) { console.error(e); } finally { setIsEvaluating(false); }
  };

  const handleChatSend = async (content: SkillContentC) => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { rol: 'user', texto: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    if (newTurnCount >= 5) {
      setChatFinished(true);
      completeSkill(50, 100);
      setIsTyping(false);
      return;
    }
    try {
      const ai = new GoogleGenerativeAI(process.env.API_KEY || 'demo_key');
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      let responseText = "...";
      try {
        const prompt = content.promptGenerator(newHistory, chatInput, content.scenario);
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonRes = JSON.parse(cleanJSON(text || '{}'));
        responseText = jsonRes.respuesta || "Interesante punto.";
      } catch (e) { responseText = "Entiendo tu punto. ¿Podrías elaborar más?"; }
      setChatHistory([...newHistory, { rol: content.scenario.roleName, texto: responseText }]);
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  const handleReflectionSubmit = async (content: SkillContentD) => {
    setIsGeneratingInsight(true);
    try {
      const ai = new GoogleGenerativeAI(process.env.API_KEY || 'demo_key');
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = content.promptGenerator(reflectionAnswers);
      let insight;
      try {
        const response = await model.generateContent(prompt);
        insight = response.response.text();
      } catch (e) { insight = "Tus reflexiones demuestran un buen nivel de autoconciencia."; }
      setInsightResult(insight || '');
      completeSkill(50, 100);
    } catch (e) { console.error(e); } finally { setIsGeneratingInsight(false); }
  };

  const areas = [
    { id: 'comunicacion', name: 'Comunicación Efectiva', color: 'purple', gradient: 'from-purple-400 to-pink-500', emoji: '💬', border: 'border-purple-400', shadow: 'shadow-purple-200/50' },
    { id: 'liderazgo', name: 'Liderazgo Consciente', color: 'cyan', gradient: 'from-cyan-400 to-blue-500', emoji: '👑', border: 'border-cyan-400', shadow: 'shadow-cyan-200/50' },
    { id: 'autoliderazgo', name: 'Autoliderazgo', color: 'green', gradient: 'from-green-400 to-teal-500', emoji: '⚡', border: 'border-green-400', shadow: 'shadow-green-200/50' },
    { id: 'negociacion', name: 'Negociación', color: 'pink', gradient: 'from-pink-400 to-rose-500', emoji: '🤝', border: 'border-pink-400', shadow: 'shadow-pink-200/50' }
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
            <span className="group-hover:rotate-12 transition-transform duration-300">📊</span>
            <span>Mi Progreso</span>
          </button>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10">
            <div className="text-right">
              <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">Nivel {calculateRank(currentXP).name}</div>
              <div className="text-sm font-black">{currentXP} XP</div>
            </div>
            <div className="text-2xl drop-shadow-md">{calculateRank(currentXP).emoji}</div>
          </div>
        </div>
      </header>

      {/* MODAL CELEBRATORIO DE KUDOS */}
      {showKudosModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl animate-scaleIn border border-white/50">
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-10 text-white text-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-float">🎉</div>
                <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
              </div>
              <div className="relative z-10">
                <div className="text-8xl mb-4 animate-bounce drop-shadow-lg">💌</div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">¡Reconocimientos!</h2>
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
                      <div className="text-4xl bg-pink-50 p-3 rounded-2xl h-fit shadow-inner">🎉</div>
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
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Aún no tienes mensajes. ¡Sigue brillando!</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 text-center">
              <button
                onClick={() => { marcarKudosComoLeidos(); setShowKudosModal(false); }}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 hover:scale-105 transition-transform"
              >
                ¡Gracias Equipo! 🚀
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
                <h2 className="text-4xl font-black flex items-center gap-3 tracking-tight">📊 Mi Tablero <span className="bg-white/20 text-sm px-3 py-1 rounded-full backdrop-blur-md border border-white/20">v5.1</span></h2>
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
                    <div className="text-4xl group-hover:scale-110 transition-transform">✅</div>
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{dashboardStats.habilidadesCompletadas}<span className="text-slate-300 text-3xl">/24</span></div>
                  <div className="text-slate-400 font-medium text-sm">Habilidades Listas</div>
                </div>

                {/* Card: Experience (Used as "En Progreso" context) - Orange Border */}
                <div className="bg-white p-6 rounded-2xl border-2 border-orange-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-orange-500 font-black text-xs uppercase tracking-wider">Experiencia</div>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🎯</div>
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{currentXP}</div>
                  <div className="text-slate-400 font-medium text-sm">XP Total Acumulado</div>
                </div>

                {/* Card: Kudos (Replaces Profile for visual balance with prompt) - Pink Border */}
                <div className="bg-white p-6 rounded-2xl border-2 border-pink-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-pink-500 font-black text-xs uppercase tracking-wider">Reconocimiento</div>
                    <div className="text-4xl group-hover:scale-110 transition-transform">💝</div>
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-1">{kudosRecibidos.length}</div>
                  <div className="text-slate-400 font-medium text-sm">Kudos Recibidos</div>
                </div>

                {/* Card: Rank - Cyan/Blue default */}
                <div className="bg-white p-6 rounded-2xl border-2 border-blue-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-blue-500 font-black text-xs uppercase tracking-wider">Rango</div>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🏅</div>
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
              <h2 className="text-3xl font-black tracking-tight mb-2">🏆 Ranking Completo</h2>
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
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-6xl shadow-inner border border-white/20">
                    {area.emoji}
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
                            {isCompleted ? '🎉' : skill.order}
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
                <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 text-4xl border border-slate-100">
                  {areas.find(a => a.id === selectedSkill.area)?.emoji || '✨'}
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{selectedSkill.name}</h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">{selectedSkill.description}</p>
              </div>

              <div className="p-10">
                {SKILL_CONTENT[selectedSkill.contentKey] ? (
                  <div className="space-y-10">
                    {/* THEORY CARD */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'A' && (SKILL_CONTENT[selectedSkill.contentKey] as SkillContentA).theory}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'B' && (SKILL_CONTENT[selectedSkill.contentKey] as SkillContentB).theory}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'C' && (
                        <div>
                          <div className={`bg-gradient-to-r ${(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC).scenario.headerGradient} p-8 rounded-2xl text-white mb-6 shadow-lg`}>
                            <h3 className="text-3xl font-black mb-2">Roleplay: {(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC).scenario.title}</h3>
                            <p className="opacity-90 text-lg">{(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC).scenario.description}</p>
                          </div>
                          <div className="flex gap-6 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-indigo-500" /> Tu rol: <span className="text-slate-900">{(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC).scenario.userRole}</span></div>
                            <div className="flex items-center gap-2"><Award className="w-5 h-5 text-indigo-500" /> Objetivo: <span className="text-slate-900">{(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC).scenario.goal}</span></div>
                          </div>
                        </div>
                      )}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'D' && (
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 mb-4">{(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentD).title}</h3>
                          <p className="text-lg text-slate-600 leading-relaxed">{(SKILL_CONTENT[selectedSkill.contentKey] as SkillContentD).description}</p>
                        </div>
                      )}
                    </div>

                    {/* PRACTICE CARD */}
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner">
                      {/* TIPO A: LINEAR QUIZ */}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'A' && (() => {
                        const content = SKILL_CONTENT[selectedSkill.contentKey] as SkillContentA;
                        if (quizFinished) {
                          const total = content.quiz.length;
                          const score = quizScore;

                          let message = "";
                          let colorClass = "";
                          let emoji = "";

                          if (score === total) {
                            message = "¡Perfecto!";
                            colorClass = "text-emerald-500";
                            emoji = "🎯";
                          } else if (score >= total * 0.8) { // 4/5
                            message = "¡Muy bien!";
                            colorClass = "text-emerald-500";
                            emoji = "⭐";
                          } else if (score >= total * 0.6) { // 3/5
                            message = "¡Bien!";
                            colorClass = "text-yellow-500";
                            emoji = "👍";
                          } else {
                            message = "¡Sigue practicando!";
                            colorClass = "text-orange-500";
                            emoji = "💪";
                          }

                          return (
                            <div className="text-center py-12">
                              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce bg-slate-50 border-4 ${colorClass.replace('text', 'border')}`}>
                                <span className="text-5xl">{emoji}</span>
                              </div>
                              <h3 className={`text-4xl font-black mb-2 ${colorClass}`}>{message}</h3>
                              <p className="text-slate-600 text-2xl font-bold mb-2">Puntaje: <span className={colorClass}>{score}/{total}</span> respuestas correctas</p>
                              <p className="text-slate-500 text-lg mb-8">Has demostrado dominar estos conceptos.</p>
                              <button onClick={() => setSelectedSkill(null)} className="px-10 py-4 bg-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-cyan-200 hover:scale-105 transition-transform">Volver al Mapa</button>
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-8">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Progreso</span>
                              <span className="text-sm font-black text-slate-700">{currentQuestionIndex + 1} / {content.quiz.length}</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 mb-8 shadow-sm border border-slate-200">
                              <div className="bg-cyan-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / content.quiz.length) * 100}%` }} />
                            </div>
                            <h3 className="font-bold text-2xl text-slate-900 leading-snug">{content.quiz[currentQuestionIndex].pregunta}</h3>
                            <div className="space-y-4">
                              {content.quiz[currentQuestionIndex].opciones.map((opt, idx) => (
                                <button key={idx} onClick={() => handleQuizOptionSelect(idx, content.quiz[currentQuestionIndex].correcta, content.quiz.length)} disabled={selectedQuizOption !== null} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center text-lg ${selectedQuizOption === idx ? idx === content.quiz[currentQuestionIndex].correcta ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800' : selectedQuizOption !== null && idx === content.quiz[currentQuestionIndex].correcta ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md'}`}>
                                  {opt}
                                  {selectedQuizOption === idx && (idx === content.quiz[currentQuestionIndex].correcta ? <CheckCircle className="w-6 h-6" /> : <X className="w-6 h-6" />)}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* TIPO B: TEXTO ABIERTO + ESTRELLAS */}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'B' && (() => {
                        const content = SKILL_CONTENT[selectedSkill.contentKey] as SkillContentB;
                        const wordCount = countWords(textResponse);
                        return (
                          <div className="space-y-6">
                            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Brain className="w-6 h-6 text-purple-500" /> Tu Respuesta</h3>
                            <textarea value={textResponse} onChange={(e) => setTextResponse(e.target.value)} placeholder="Escribe tu análisis aquí..." className="w-full h-56 p-6 rounded-2xl border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none resize-none text-lg leading-relaxed shadow-sm transition-all" />
                            <div className="flex justify-end"><span className={`text-sm font-bold ${wordCount < 150 ? 'text-orange-500' : 'text-green-600'}`}>{wordCount} / 150 palabras</span></div>

                            {!evaluationResult ? (
                              <button onClick={() => handleGeminiEval(content)} disabled={wordCount < 150 || isEvaluating} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isEvaluating ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                Enviar mi respuesta ✨
                              </button>
                            ) : (
                              <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl animate-fade-in">
                                <h4 className="font-black text-2xl text-indigo-900 mb-8 flex items-center gap-3"><Award className="w-8 h-8 text-yellow-500" /> Resultados del Análisis</h4>
                                <div className="space-y-6 mb-8">
                                  {content.evaluatorConfig.criteriaNames.map((crit, i) => {
                                    let rawScore = evaluationResult.scores[i];
                                    if (rawScore <= 10) rawScore *= 10;

                                    let stars = 1;
                                    let label = "Necesita trabajo";

                                    if (rawScore >= 90) { stars = 5; label = "Excelente"; }
                                    else if (rawScore >= 80) { stars = 4; label = "Muy bien"; }
                                    else if (rawScore >= 70) { stars = 3; label = "Bien"; }
                                    else if (rawScore >= 60) { stars = 2; label = "Puede mejorar"; }

                                    return (
                                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-4 last:border-0 gap-2">
                                        <div className="font-bold text-slate-700 w-full md:w-1/3 uppercase text-xs tracking-wider">{crit}</div>
                                        <div className="flex items-center gap-4 flex-1">
                                          <div className="flex text-yellow-400 gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                              <Star key={s} className={`w-5 h-5 ${s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                                            ))}
                                          </div>
                                          <div className="font-bold text-sm text-slate-600">
                                            {stars}/5 - <span className="text-slate-800">{label}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-2xl text-indigo-900 text-lg italic mb-8 border border-indigo-100">"{evaluationResult.feedback}"</div>
                                <button onClick={() => setSelectedSkill(null)} className="w-full py-4 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-all">Continuar</button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* TIPO C: CHAT */}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'C' && (() => {
                        const content = SKILL_CONTENT[selectedSkill.contentKey] as SkillContentC;

                        // If finished and not viewing history, show Feedback Screen
                        if (chatFinished && !viewingChatHistory) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                              {/* Celebration Icon */}
                              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce text-5xl">
                                🎊
                              </div>
                              <h3 className="text-4xl font-black text-slate-900 mb-2">¡Simulación Completada!</h3>
                              <div className="flex gap-4 mb-8">
                                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">✅ +50 XP Ganados</span>
                                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold">🎯 5 Turnos</span>
                              </div>

                              {/* Evaluation Card */}
                              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg w-full max-w-lg mb-8 text-left">
                                <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">📊 Evaluación de Desempeño</h4>
                                <div className="space-y-3 mb-6">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Comunicación</span>
                                    <div className="flex text-yellow-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 text-slate-200" /></div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Negociación</span>
                                    <div className="flex text-yellow-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Manejo de Objeciones</span>
                                    <div className="flex text-yellow-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 text-slate-200" /></div>
                                  </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-xl">
                                  <p className="text-xs font-bold text-indigo-500 uppercase mb-1">💬 Feedback del Coach</p>
                                  <p className="text-sm text-indigo-900 italic">"Excelente manejo de la situación. Lograste mantener la calma y proponer soluciones constructivas sin ceder en los puntos críticos."</p>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <button
                                  onClick={() => setViewingChatHistory(true)}
                                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                  📜 Ver Conversación
                                </button>
                                <button
                                  onClick={() => setSelectedSkill(null)}
                                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                                >
                                  🗺️ Volver al Mapa
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col h-[600px] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm relative">
                            {/* STICKY HEADER */}
                            <div className={`bg-gradient-to-r ${content.scenario.headerGradient} p-4 text-white sticky top-0 z-10 shadow-md`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Roleplay</span>
                                    <h3 className="font-bold text-lg leading-none">{content.scenario.title}</h3>
                                  </div>
                                  <div className="flex gap-4 text-xs font-medium opacity-90">
                                    <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {content.scenario.roleName}</span>
                                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Objetivo: {content.scenario.goal}</span>
                                  </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-3 py-2 rounded-lg text-center min-w-[80px]">
                                  <div className="text-[10px] uppercase font-bold opacity-80">Turno</div>
                                  <div className="text-xl font-black">{Math.min(turnCount + 1, 5)}/5</div>
                                </div>
                              </div>
                            </div>

                            {/* CHAT HISTORY */}
                            <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6 scroll-smooth">
                              {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] p-5 rounded-3xl text-lg leading-relaxed shadow-sm ${msg.rol === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                                    <div className={`text-xs font-bold mb-1 opacity-70 ${msg.rol === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                                      {msg.rol === 'user' ? 'Tú' : content.scenario.roleName}
                                    </div>
                                    {msg.texto}
                                  </div>
                                </div>
                              ))}
                              {isTyping && <div className="flex justify-start"><div className="bg-white p-4 rounded-3xl rounded-bl-none shadow-sm border border-slate-200 flex gap-2"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" /></div></div>}
                              {chatFinished && !viewingChatHistory && <div className="text-center py-6 animate-fade-in"><div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold shadow-sm text-lg">🎉 Simulación Completada (+50 XP)</div></div>}
                            </div>

                            {/* INPUT AREA / FOOTER */}
                            {viewingChatHistory ? (
                              <div className="p-4 bg-white border-t border-slate-200 flex justify-center">
                                <button onClick={() => setViewingChatHistory(false)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">
                                  🔙 Volver a Resultados
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                                <input
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && !chatFinished && handleChatSend(content)}
                                  placeholder={chatFinished ? "Simulación finalizada" : "Escribe tu respuesta..."}
                                  disabled={chatFinished}
                                  className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-lg transition-all"
                                />
                                <button
                                  onClick={() => handleChatSend(content)}
                                  disabled={!chatInput.trim() || isTyping || chatFinished}
                                  className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-lg"
                                >
                                  <Send className="w-6 h-6" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* TIPO D: REFLEXIÓN */}
                      {SKILL_CONTENT[selectedSkill.contentKey].type === 'D' && (() => {
                        const content = SKILL_CONTENT[selectedSkill.contentKey] as SkillContentD;
                        const isValid = reflectionAnswers.every(ans => countWords(ans) >= 100);
                        return (
                          <div className="space-y-8">
                            {content.questions.map((q, i) => (
                              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <label className="block font-bold text-slate-800 mb-4 text-lg">{q}</label>
                                <textarea className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 ring-pink-500 outline-none text-base leading-relaxed" rows={4} value={reflectionAnswers[i] || ''} onChange={(e) => { const newAns = [...reflectionAnswers]; newAns[i] = e.target.value; setReflectionAnswers(newAns); }} placeholder="Escribe tu reflexión..." />
                                <div className={`text-xs text-right mt-2 font-bold ${countWords(reflectionAnswers[i] || '') < 100 ? 'text-orange-500' : 'text-green-600'}`}>{countWords(reflectionAnswers[i] || '')} / 100 palabras</div>
                              </div>
                            ))}
                            {!insightResult ? (
                              <button onClick={() => handleReflectionSubmit(content)} disabled={!isValid || isGeneratingInsight} className="w-full py-5 bg-pink-500 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xl hover:bg-pink-600 transition-all flex justify-center items-center gap-3 text-lg">
                                {isGeneratingInsight ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <><Lightbulb className="w-6 h-6" /> Enviar Reflexión</>}
                              </button>
                            ) : (
                              <div className="bg-pink-50 p-8 rounded-[2rem] border border-pink-100 animate-fade-in shadow-lg">
                                <div className="flex items-center gap-3 mb-4"><Sparkles className="w-6 h-6 text-pink-500" /><span className="font-black text-xl text-pink-700">Insight del Coach</span></div>
                                <p className="text-slate-800 text-lg leading-relaxed italic mb-6">"{insightResult}"</p>
                                <button onClick={() => setSelectedSkill(null)} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">¡Entendido! (+50 XP)</button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">Contenido no disponible.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};