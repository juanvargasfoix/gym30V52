import React from 'react';

// --- TYPES ---
export type SkillType = 'A' | 'B' | 'C' | 'D';

export interface SkillContentA {
  type: 'A';
  theory: React.ReactNode;
  quiz: { pregunta: string; opciones: string[]; correcta: number }[];
}

export interface SkillContentB {
  type: 'B';
  theory: React.ReactNode;
  minLength: number;
  evaluatorConfig: {
    promptGenerator: (response: string) => string;
    criteriaNames: string[];
  };
}

export interface SkillContentC {
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
    evaluationCriteria?: string[];
  };
  promptGenerator: (history: { rol: string, texto: string }[], lastUserMessage: string, scenario: any) => string;
};

export interface SkillContentD {
  type: 'D';
  title: string;
  description: string;
  questions: string[];
  promptGenerator: (answers: string[]) => string;
}

export type SkillContent = SkillContentA | SkillContentB | SkillContentC | SkillContentD;

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
      { pregunta: "Tu jefe dice 'Juan es muy lento con los reportes'. Esto es:", opciones: ["Un hecho porque lo dice el jefe", "Un juicio que requiere evidencia", "Una declaración oficial", "Un pedido implícito"], correcta: 1 },
      { pregunta: "¿Cuál de estas frases es un HECHO verificable?", opciones: ["El cliente está molesto con nosotros", "La reunión duró 47 minutos", "Este proyecto va a fracasar", "Somos el mejor equipo"], correcta: 1 },
      { pregunta: "En una reunión dices: 'A partir de hoy, María lidera el proyecto'. Esto es:", opciones: ["Un juicio sobre María", "Un hecho observable", "Una declaración que crea realidad", "Una opinión personal"], correcta: 2 },
      { pregunta: "Un colega dice 'Siempre llegas tarde'. Para convertirlo en hecho dirías:", opciones: ["Es verdad, soy impuntual", "Llegué 10 minutos tarde el lunes y miércoles", "No es cierto, exageras", "Tú también llegas tarde"], correcta: 1 },
      { pregunta: "¿Por qué distinguir entre juicios y hechos mejora la comunicación?", opciones: ["Permite ganar discusiones más fácilmente", "Evita malentendidos basados en interpretaciones", "Hace que otros acepten tu opinión", "Demuestra quién tiene la razón"], correcta: 1 }
    ]
  },
  c2: {
    type: 'B',
    minLength: 150,
    theory: (
      <div className='prose prose-lg text-slate-700'>
        <h3 className='text-2xl font-bold text-slate-900 mb-4'>🎯 Ejercicio Práctico: Actos Lingüísticos</h3>
        <div className='bg-green-50 p-6 rounded-xl border border-green-100'>
          <p className='font-bold text-green-900 mb-2'>Situación:</p>
          <p className='text-green-800'>Tu equipo no cumplió una entrega importante. Debes comunicarte con ellos para: (1) hacer una declaración sobre la situación, (2) hacer un pedido claro para la próxima entrega, y (3) obtener una promesa de compromiso.</p>
          <p className='mt-4 font-bold text-green-900 mb-2'>Tu tarea:</p>
          <p className='text-green-800'>Escribe el mensaje que enviarías a tu equipo incluyendo los tres actos lingüísticos: declaración, pedido y promesa esperada.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ['Declaración', 'Pedido', 'Promesa', 'Claridad'],
      promptGenerator: (response) => `Eres un experto en ontología del lenguaje y comunicación organizacional. Un participante debe escribir un mensaje a su equipo que incluya tres actos lingüísticos: una declaración, un pedido y una solicitud de promesa. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. DECLARACIÓN (0-100): ¿Incluye una declaración clara que establece una nueva realidad o posición? ¿Tiene autoridad y es apropiada al contexto? 2. PEDIDO (0-100): ¿Hace un pedido específico con condiciones claras (qué, quién, cuándo)? ¿Es un pedido genuino que permite negociación? 3. PROMESA (0-100): ¿Solicita o facilita una promesa de compromiso del equipo? ¿Crea condiciones para que el otro se comprometa? 4. CLARIDAD (0-100): ¿El mensaje es claro, profesional y mantiene la relación? ¿Evita ambigüedades y resentimientos? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [declaracion, pedido, promesa, claridad], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
    }
  },
  c3: {
    type: 'B',
    minLength: 100,
    theory: (
      <div className='prose prose-lg text-slate-700'>
        <h3 className='text-2xl font-bold text-slate-900 mb-4'>🎯 Ejercicio Práctico: Escucha Activa</h3>
        <div className='bg-green-50 p-6 rounded-xl border border-green-100'>
          <p className='font-bold text-green-900 mb-2'>Situación:</p>
          <p className='text-green-800 mb-3'>Lee esta conversación entre un líder (L) y su colaborador (C):</p>
          <div className='bg-white p-4 rounded-lg text-sm space-y-2 border'>
            <p><strong>C:</strong> "Estoy agotado. Llevo tres semanas con este proyecto y siento que no avanzo."</p>
            <p><strong>L:</strong> "Bueno, todos estamos ocupados. ¿Ya probaste organizarte mejor?"</p>
            <p><strong>C:</strong> "No es tema de organización... es que cada vez agregan más requisitos."</p>
            <p><strong>L:</strong> "Eso pasa siempre. Enfócate en lo importante y delega lo demás."</p>
          </div>
          <p className='mt-4 font-bold text-green-900 mb-2'>Tu tarea:</p>
          <p className='text-green-800'>Analiza qué hizo mal el líder en términos de escucha activa, y reescribe sus dos respuestas aplicando técnicas de escucha activa (validar, parafrasear, preguntar).</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ['Diagnóstico', 'Validación', 'Parafraseo', 'Indagación'],
      promptGenerator: (response) => `Eres un experto en comunicación y escucha activa. Un participante debe analizar una conversación donde el líder no escuchó bien, y reescribir las respuestas aplicando escucha activa. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. DIAGNÓSTICO (0-100): ¿Identifica correctamente los errores del líder? ¿Menciona que no validó emociones, interrumpió, dio consejos prematuros o no indagó? 2. VALIDACIÓN (0-100): ¿Las respuestas reescritas validan las emociones del colaborador? ¿Reconocen el agotamiento y la frustración sin minimizarlos? 3. PARAFRASEO (0-100): ¿Incluye parafraseo que demuestre comprensión? ¿Reformula lo que dijo el colaborador para confirmar entendimiento? 4. INDAGACIÓN (0-100): ¿Hace preguntas abiertas que inviten a profundizar? ¿Evita preguntas cerradas o que suenen a reproche? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [diagnostico, validacion, parafraseo, indagacion], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
    }
  },
  c4: {
    type: 'C',
    scenario: {
      roleName: 'Sofía Méndez',
      title: 'Práctica de Indagación',
      description: 'Tu colaboradora tiene un problema pero no lo expresa claramente.',
      goal: 'Usar preguntas poderosas para ayudarla a reflexionar',
      headerGradient: 'from-blue-500 to-cyan-500',
      initialMessage: 'Hola, ¿tienes un minuto? Quería comentarte algo... bueno, no sé si es importante, pero últimamente me siento un poco... no sé cómo explicarlo.',
      userRole: 'Líder',
      personality: 'Insegura, evasiva al principio, pero se abre si se siente escuchada. Responde mejor a preguntas abiertas que a consejos.',
      situation: 'Sofía está desmotivada pero no sabe identificar la causa. Necesita que alguien le ayude a reflexionar con buenas preguntas, no que le den soluciones.',
      evaluationCriteria: ['Preguntas Abiertas', 'Escucha Activa', 'Profundización']
    },
    promptGenerator: (history, lastUserMessage, scenario) => `Eres ${scenario.roleName}, una colaboradora que necesita ayuda para reflexionar sobre su situación. ${scenario.personality} Situación: ${scenario.situation}. 

IMPORTANTE: Evalúa si el usuario hace preguntas poderosas (abiertas, reflexivas) o si da consejos/soluciones directas.
- Si hace preguntas abiertas y reflexivas: ábrete más, reflexiona en voz alta, muestra progreso.
- Si da consejos o soluciones: responde con evasivas como "sí, puede ser..." pero sin abrirte realmente.
- Si hace preguntas cerradas (sí/no): responde brevemente sin profundizar.

Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". 

Responde EN PERSONAJE como Sofía. Responde SOLO JSON: { "respuesta": "texto de 1-3 oraciones", "score": numero del 0-100 basado en la calidad de indagación del usuario }`
  },
  c5: {
    type: 'B',
    minLength: 100,
    theory: (
      <div className='prose prose-lg text-slate-700'>
        <h3 className='text-2xl font-bold text-slate-900 mb-4'>🎯 Ejercicio Práctico: Conversaciones para la Acción</h3>
        <div className='bg-green-50 p-6 rounded-xl border border-green-100'>
          <p className='font-bold text-green-900 mb-2'>Situación:</p>
          <p className='text-green-800 mb-3'>Necesitas que el área de Sistemas implemente una nueva funcionalidad en el software antes del 15 del próximo mes. El líder de Sistemas es conocido por tener muchas prioridades y decir que sí a todo pero luego no cumplir.</p>
          <p className='mt-4 font-bold text-green-900 mb-2'>Tu tarea:</p>
          <p className='text-green-800'>Escribe el mensaje o conversación donde: (1) preparas el contexto, (2) haces un pedido claro y específico, (3) negocias condiciones de satisfacción, y (4) buscas obtener una promesa genuina con fecha y condiciones.</p>
        </div>
      </div>
    ),
    evaluatorConfig: {
      criteriaNames: ['Preparación', 'Pedido', 'Negociación', 'Promesa'],
      promptGenerator: (response) => `Eres un experto en coordinación de acciones y comunicación efectiva basada en actos del habla. Un participante debe escribir una conversación para coordinar una acción con otra área. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. PREPARACIÓN (0-100): ¿Establece contexto claro del por qué es importante? ¿Genera un espacio propicio para el pedido? 2. PEDIDO (0-100): ¿El pedido es específico con qué, quién, cuándo y condiciones de satisfacción? ¿Deja espacio para que el otro pueda negociar o declinar? 3. NEGOCIACIÓN (0-100): ¿Anticipa posibles obstáculos? ¿Muestra flexibilidad para negociar condiciones sin perder lo esencial? 4. PROMESA (0-100): ¿Busca obtener un compromiso explícito? ¿Establece mecanismos de seguimiento o confirmación? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [preparacion, pedido, negociacion, promesa], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
    }
  },
  c6: {
    type: 'D',
    title: 'Comunicación Asertiva',
    description: 'La asertividad es expresar tus necesidades y opiniones respetando a los demás.',
    questions: [
      'Describe una situación reciente donde no dijiste lo que realmente pensabas o sentías. ¿Qué te frenó?',
      'Piensa en alguien que consideras asertivo. ¿Qué hace diferente a ti en situaciones similares?',
      '¿Qué frase o mensaje te gustaría poder decir con más frecuencia en tu trabajo? ¿A quién y en qué contexto?'
    ],
    promptGenerator: (answers) => `Eres un coach experto en comunicación asertiva y desarrollo personal. Lee estas reflexiones de un participante:

Reflexión 1 (situación donde no se expresó): "${answers[0]}"
Reflexión 2 (modelo de asertividad): "${answers[1]}"
Reflexión 3 (mensaje pendiente): "${answers[2]}"

Genera un insight personalizado de 3-4 oraciones que:
1. Conecte las tres reflexiones identificando un patrón o creencia limitante
2. Valide su experiencia sin juzgar
3. Ofrezca una perspectiva nueva sobre la asertividad
4. Sugiera un pequeño paso concreto que pueda dar esta semana

Tono cálido, empático y motivador. No uses listas, escribe en prosa fluida.`
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
      {
        pregunta: "Tu colaborador te dice que está agotado pero insiste en que puede terminar el proyecto. ¿Cuál es la respuesta más empática?",
        opciones: ["Perfecto, confío en ti. Avísame cuando termines.", "Te veo cansado. ¿Qué necesitas para que esto sea manejable?", "Todos estamos cansados, es parte del trabajo.", "Mejor lo termino yo para que descanses."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál es la diferencia clave entre empatía y simpatía?",
        opciones: ["La simpatía requiere haber vivido lo mismo; la empatía no.", "La empatía conecta con la emoción del otro; la simpatía la observa desde afuera.", "Son sinónimos usados en contextos diferentes.", "La empatía es profesional; la simpatía es personal."],
        correcta: 1
      },
      {
        pregunta: "Un miembro del equipo comete un error grave y está visiblemente afectado. ¿Qué haces primero?",
        opciones: ["Analizar qué salió mal para evitar que se repita.", "Reconocer cómo se siente antes de hablar del error.", "Minimizar el error para que no se sienta tan mal.", "Darle espacio y hablar del tema mañana."],
        correcta: 1
      },
      {
        pregunta: "¿Por qué mostrar vulnerabilidad como líder puede fortalecer la conexión con el equipo?",
        opciones: ["Porque demuestra que no tienes todas las respuestas y eso relaja al equipo.", "Porque humaniza la relación y genera confianza para que otros también se abran.", "Porque el equipo sentirá lástima y trabajará más duro.", "No la fortalece; los líderes deben proyectar seguridad siempre."],
        correcta: 1
      },
      {
        pregunta: "Alguien te cuenta un problema personal que afecta su trabajo. ¿Cuál respuesta cierra la conversación en lugar de abrirla?",
        opciones: ["Gracias por contarme. ¿Cómo puedo apoyarte?", "Entiendo que es difícil. ¿Qué es lo que más te preocupa?", "No te preocupes, todos pasamos por cosas así.", "¿Quieres contarme más sobre lo que está pasando?"],
        correcta: 2
      }
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
      {
        pregunta: "Delegas una tarea importante y tu colaborador la resuelve de forma diferente a como tú lo habrías hecho, pero el resultado es bueno. ¿Qué haces?",
        opciones: ["Le explicas cómo lo habrías hecho tú para la próxima vez.", "Reconoces el resultado y le preguntas qué aprendió del proceso.", "Corriges el método para que siga el estándar del equipo.", "No dices nada para no desmotivarlo."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál de estas situaciones indica que estás microgestionando?",
        opciones: ["Pides una actualización semanal del avance.", "Defines el objetivo y dejas que elijan cómo lograrlo.", "Revisas cada paso antes de que continúen al siguiente.", "Ofreces ayuda si encuentran obstáculos."],
        correcta: 2
      },
      {
        pregunta: "Al delegar, ¿qué elemento es MÁS importante para el éxito de la tarea?",
        opciones: ["Instrucciones detalladas paso a paso.", "Claridad sobre el resultado esperado y el contexto del por qué.", "Supervisión frecuente del progreso.", "Elegir a la persona con más experiencia."],
        correcta: 1
      },
      {
        pregunta: "Un colaborador junior te pide que revises cada decisión antes de avanzar. ¿Cómo fomentas su autonomía?",
        opciones: ["Le dices que confíe más en sí mismo y decida solo.", "Defines criterios claros para qué decisiones puede tomar solo y cuáles consultar.", "Sigues revisando todo hasta que tenga más experiencia.", "Le asignas tareas más simples que no requieran decisiones."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál es el riesgo principal de NO delegar lo suficiente?",
        opciones: ["El equipo comete más errores por falta de guía.", "Te conviertes en cuello de botella y el equipo no se desarrolla.", "Pierdes control sobre la calidad del trabajo.", "El equipo se siente demasiado presionado."],
        correcta: 1
      }
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
      promptGenerator: (response) => `Eres un coach ejecutivo experto en comunicación y liderazgo organizacional. Un participante de un programa de entrenamiento en habilidades blandas debe dar feedback constructivo a un colega. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. ESPECIFICIDAD (0-100): ¿Menciona comportamientos o situaciones concretas en lugar de generalidades? ¿Evita frases vagas como siempre o nunca? 2. EMPATÍA (0-100): ¿Muestra comprensión por la perspectiva del otro? ¿Usa un tono respetuoso que preserve la relación? 3. ACCIONABILIDAD (0-100): ¿Propone acciones claras y realizables que la persona puede implementar? ¿Va más allá de señalar el problema? 4. BALANCE (0-100): ¿Equilibra el reconocimiento de fortalezas con las áreas de mejora? ¿Evita ser solo crítico o solo elogioso? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [especificidad, empatia, accionabilidad, balance], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
      promptGenerator: (response) => `Eres un coach de liderazgo experto en comunicación inspiracional y gestión de equipos. Un participante de un programa de entrenamiento debe escribir un mensaje motivacional para su equipo. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. RECONOCIMIENTO (0-100): ¿Valora los logros o esfuerzos del equipo de manera concreta? ¿Menciona contribuciones específicas? 2. PROPÓSITO (0-100): ¿Conecta el trabajo del equipo con un propósito mayor o una visión compartida? ¿Da sentido al esfuerzo? 3. ENERGÍA (0-100): ¿Transmite entusiasmo y confianza? ¿El tono genera ganas de actuar? ¿Evita ser monótono o burocrático? 4. INSPIRACIÓN (0-100): ¿Motiva a ir más allá? ¿Genera compromiso emocional? ¿Deja al lector con ganas de contribuir? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [reconocimiento, proposito, energia, inspiracion], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
      {
        pregunta: "Notas que reaccionas con irritación cada vez que alguien cuestiona tus ideas en reuniones. Esto probablemente indica:",
        opciones: ["Que tus colegas son irrespetuosos.", "Un trigger emocional relacionado con sentirte desafiado.", "Que necesitas mejores argumentos para tus ideas.", "Que las reuniones no son el espacio adecuado para debatir."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál es la principal limitación de la autoevaluación sin feedback externo?",
        opciones: ["Es más lenta que pedir feedback.", "No identifica fortalezas, solo debilidades.", "Tiene puntos ciegos que solo otros pueden ver.", "Genera demasiada autocrítica."],
        correcta: 2
      },
      {
        pregunta: "Después de una presentación que no salió bien, ¿cuál reflexión demuestra mayor autoconocimiento?",
        opciones: ["El público no estaba interesado en el tema.", "Me preparé poco porque subestimé la complejidad.", "Fue mala suerte, la tecnología falló en el peor momento.", "Debería evitar presentar en el futuro."],
        correcta: 1
      },
      {
        pregunta: "¿Para qué sirve identificar tus 'triggers emocionales'?",
        opciones: ["Para evitar las situaciones que los activan.", "Para anticipar tu reacción y elegir una respuesta más consciente.", "Para explicar a otros por qué reaccionas así.", "Para justificar comportamientos impulsivos."],
        correcta: 1
      },
      {
        pregunta: "Un colega te dice que a veces pareces distante en las reuniones. Tú no lo percibías así. ¿Qué haces?",
        opciones: ["Le explicas que simplemente estás concentrado.", "Ignoras el comentario porque no coincide con tu autoimagen.", "Exploras con curiosidad qué comportamientos dan esa impresión.", "Cambias tu comportamiento inmediatamente para agradar."],
        correcta: 2
      }
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
      {
        pregunta: "Recibes un email que te molesta mucho. La 'pausa de 6 segundos' te ayuda a:",
        opciones: ["Olvidar el email y seguir con otra cosa.", "Crear espacio para responder en lugar de reaccionar.", "Calmarte completamente antes de actuar.", "Analizar racionalmente si tu molestia es válida."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál es la diferencia entre suprimir una emoción y regularla?",
        opciones: ["Suprimir es más efectivo a corto plazo; regular a largo plazo.", "Regular implica reconocerla y canalizarla; suprimir es negarla o esconderla.", "Son lo mismo pero con diferentes nombres.", "Suprimir es consciente; regular es automático."],
        correcta: 1
      },
      {
        pregunta: "Tu jefe critica tu trabajo frente al equipo. Sientes vergüenza e ira. ¿Cuál es una respuesta emocionalmente regulada?",
        opciones: ["Defenderte inmediatamente explicando tu posición.", "No decir nada y procesar la emoción después en privado.", "Agradecer el feedback y pedir hablar en privado sobre los detalles.", "Mostrar que no te afectó para no parecer vulnerable."],
        correcta: 2
      },
      {
        pregunta: "El 'reencuadre cognitivo' ante un proyecto cancelado sería:",
        opciones: ["Convencerte de que no querías ese proyecto de todas formas.", "Buscar qué aprendiste y qué oportunidades abre esta situación.", "Culpar a factores externos para no sentirte mal.", "Enfocarte en el siguiente proyecto sin pensar en este."],
        correcta: 1
      },
      {
        pregunta: "¿Cuál de estos comportamientos indica BAJA gestión emocional?",
        opciones: ["Pedir un momento antes de responder cuando estás alterado.", "Expresar frustración de forma directa pero respetuosa.", "Acumular molestias sin expresarlas hasta explotar.", "Reconocer que algo te afectó y necesitas procesarlo."],
        correcta: 2
      }
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
      promptGenerator: (response) => `Eres un psicólogo organizacional experto en resiliencia y desarrollo personal. Un participante de un programa de entrenamiento debe reflexionar sobre cómo manejaría una situación de fracaso profesional aplicando resiliencia. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. RECONOCIMIENTO (0-100): ¿Reconoce el impacto emocional de la situación sin negarlo ni minimizarlo? ¿Muestra autoconciencia sobre sus reacciones? 2. CRECIMIENTO (0-100): ¿Identifica aprendizajes o lecciones concretas de la experiencia? ¿Transforma el fracaso en oportunidad de desarrollo? 3. ACCIÓN (0-100): ¿Propone pasos concretos para avanzar? ¿Define qué haría diferente? ¿Va más allá de la reflexión pasiva? 4. PERSPECTIVA (0-100): ¿Mantiene una visión equilibrada sin catastrofizar ni trivializar? ¿Separa el evento puntual de su valor como profesional? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [reconocimiento, crecimiento, accion, perspectiva], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
      promptGenerator: (response) => `Eres un experto en productividad, gestión del tiempo y priorización ejecutiva. Un participante de un programa de entrenamiento debe clasificar una lista de tareas usando la Matriz de Eisenhower (Urgente/Importante). Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. CLASIFICACIÓN (0-100): ¿Asigna correctamente cada tarea al cuadrante correspondiente? ¿Distingue bien entre urgente e importante? 2. CRITERIO (0-100): ¿Demuestra comprensión de por qué cada tarea va en su cuadrante? ¿Su razonamiento es sólido y coherente? 3. PRIORIZACIÓN (0-100): ¿Establece un orden lógico de ejecución? ¿Entiende que lo importante-no urgente requiere planificación proactiva? 4. DELEGACIÓN (0-100): ¿Identifica correctamente qué tareas delegar o eliminar? ¿Muestra criterio para soltar lo que no agrega valor? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [clasificacion, criterio, priorizacion, delegacion], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
      {
        pregunta: "En una negociación, la otra parte insiste en su posición sin explicar por qué. ¿Qué pregunta ayuda a descubrir sus intereses reales?",
        opciones: ["¿Es tu última oferta?", "¿Qué es lo que realmente necesitas lograr con esto?", "¿Puedes ceder un poco en ese punto?", "¿Por qué no aceptas mi propuesta?"],
        correcta: 1
      },
      {
        pregunta: "Tu BATNA (mejor alternativa) es débil. ¿Cómo afecta esto tu negociación?",
        opciones: ["No afecta si no lo mencionas.", "Tienes menos poder para rechazar ofertas desfavorables.", "Debes ser más agresivo para compensar.", "Es mejor no negociar hasta tener un BATNA fuerte."],
        correcta: 1
      },
      {
        pregunta: "¿Qué significa 'separar a las personas del problema'?",
        opciones: ["Negociar solo por email para evitar emociones.", "No tomar los desacuerdos como ataques personales.", "Ignorar las preocupaciones emocionales del otro.", "Delegar la negociación a alguien sin relación personal."],
        correcta: 1
      },
      {
        pregunta: "Un acuerdo Win-Win implica que:",
        opciones: ["Ambos ceden exactamente lo mismo.", "Ambos sienten que ganaron más de lo que perdieron.", "Nadie obtiene todo lo que quería.", "Se divide todo en partes iguales."],
        correcta: 1
      },
      {
        pregunta: "Usar 'criterios objetivos' en una negociación ayuda a:",
        opciones: ["Demostrar que tienes razón.", "Presionar al otro con datos.", "Basar el acuerdo en estándares justos, no en voluntades.", "Evitar la negociación emocional."],
        correcta: 2
      }
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
      {
        pregunta: "Antes de negociar, investigas que la otra empresa tiene urgencia por cerrar este trimestre. Esta información te sirve para:",
        opciones: ["Presionarlos con plazos ajustados.", "Entender su contexto y buscar opciones que resuelvan su urgencia.", "Pedir más porque sabes que aceptarán.", "Alargar la negociación para aumentar su presión."],
        correcta: 1
      },
      {
        pregunta: "La ZOPA (Zona de Posible Acuerdo) NO existe cuando:",
        opciones: ["Ambas partes tienen posiciones muy diferentes.", "El mínimo aceptable de uno supera el máximo del otro.", "Hay desconfianza entre las partes.", "No se conocen los intereses del otro."],
        correcta: 1
      },
      {
        pregunta: "¿Por qué es importante definir tu 'punto de retiro' antes de negociar?",
        opciones: ["Para comunicárselo al otro y fijar límites claros.", "Para saber cuándo aceptar cualquier oferta.", "Para evitar aceptar acuerdos peores que tu alternativa.", "Para tener un argumento de presión."],
        correcta: 2
      },
      {
        pregunta: "Preparar múltiples opciones creativas antes de negociar te permite:",
        opciones: ["Confundir al otro con demasiadas propuestas.", "Mostrar flexibilidad y encontrar acuerdos inesperados.", "Evitar que el otro proponga sus propias ideas.", "Alargar la negociación para ganar tiempo."],
        correcta: 1
      },
      {
        pregunta: "Descubres que tu contraparte valora mucho algo que a ti te cuesta poco dar. Esto es:",
        opciones: ["Una oportunidad para pedir algo grande a cambio.", "Una oportunidad para crear valor mutuo fácilmente.", "Información que debes ocultar para no perder ventaja.", "Irrelevante si no estaba en tu lista de temas."],
        correcta: 1
      }
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
      promptGenerator: (response) => `Eres un experto en negociación comercial y ventas consultivas con amplia experiencia en manejo de objeciones de precio. Un participante de un programa de entrenamiento debe responder a un cliente que objeta el precio diciendo que la competencia cobra menos. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. VALIDACIÓN (0-100): ¿Reconoce la preocupación del cliente sin descartarla? ¿Muestra empatía y respeto por su perspectiva? 2. DIFERENCIACIÓN (0-100): ¿Articula claramente qué hace diferente o superior a su propuesta? ¿Va más allá del precio para hablar de valor? 3. EVIDENCIA (0-100): ¿Respalda sus argumentos con datos, ejemplos, casos de éxito o referencias concretas? ¿Es creíble? 4. PROPUESTA (0-100): ¿Ofrece un siguiente paso claro y orientado a la acción? ¿Mantiene el control de la conversación sin ser agresivo? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [validacion, diferenciacion, evidencia, propuesta], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
      promptGenerator: (response) => `Eres un experto en negociación comercial y cierre de acuerdos con experiencia en formalización de compromisos empresariales. Un participante de un programa de entrenamiento debe redactar un mensaje de cierre de negociación que formalice los compromisos acordados. Evalúa su respuesta según estos 4 criterios en escala de 0 a 100: 1. RESUMEN (0-100): ¿Recapitula correctamente los puntos clave acordados? ¿Refleja con precisión lo negociado sin omitir elementos importantes? 2. CLARIDAD (0-100): ¿Es claro y sin ambigüedades? ¿Cada compromiso se entiende fácilmente? ¿Evita lenguaje confuso o impreciso? 3. PLAZOS (0-100): ¿Establece fechas, hitos o tiempos concretos? ¿Define cuándo se ejecutará cada compromiso? 4. FORMALIZACIÓN (0-100): ¿Tiene tono profesional adecuado para formalizar un acuerdo? ¿Incluye próximos pasos claros y cierre? RESPUESTA DEL PARTICIPANTE: "${response}" Evalúa con rigor profesional. Un score de 90-100 significa excelente, 80-89 muy bien, 70-79 bien, 60-69 puede mejorar, menos de 60 necesita trabajo. Responde SOLO con este JSON sin ningún texto adicional: { "scores": [resumen, claridad, plazos, formalizacion], "feedback": "Análisis detallado de 2-3 oraciones explicando fortalezas y áreas de mejora específicas", "aprobado": true } El campo aprobado es true si el promedio de scores es mayor a 60.`
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
