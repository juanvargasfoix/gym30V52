/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";

const MODEL = "gemini-2.5-flash";

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!_client) _client = new GoogleGenAI({ apiKey });
  return _client;
}

// ---------------------------------------------------------------------------
// Result type — explicit success / failure for every Gemini call.
// Reasons:
//   'no-api-key'   → API key not configured (dev / first-deploy state).
//   'api-error'    → network / SDK / rate-limit / model error during call.
//   'invalid-shape'→ response parsed but didn't match expected schema.
// ---------------------------------------------------------------------------
export type AiFailureReason = 'no-api-key' | 'api-error' | 'invalid-shape';
export type AsyncResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: AiFailureReason };

export interface TextEvaluation {
  scores: number[];
  feedback: string;
  aprobado: boolean;
}

export interface RoleplayEvaluation {
  scores: number[];
  feedback: string;
  aprobado: boolean;
}

const EVAL_SYSTEM_INSTRUCTION =
  "Eres un evaluador experto y riguroso de habilidades blandas en contextos organizacionales. " +
  "Respondes exclusivamente con JSON válido que cumpla el schema pedido. " +
  "No incluyas texto fuera del JSON. No uses markdown. " +
  "Los scores son enteros entre 0 y 100. El campo 'aprobado' es true si el promedio de scores es mayor a 60.";

const ROLEPLAY_SYSTEM_INSTRUCTION =
  "Interpretas un rol de negocio de forma realista, manteniendo la personalidad y la situación indicadas. " +
  "Respondes exclusivamente con JSON válido que cumpla el schema pedido. " +
  "Tu turno es una sola respuesta corta y natural, en primera persona, sin romper el personaje.";

const REFLECTION_SYSTEM_INSTRUCTION =
  "Eres un coach de desarrollo personal y profesional. Devuelves un insight breve (2-4 oraciones), " +
  "cálido y accionable, en texto plano sin markdown.";

const ROLEPLAY_EVAL_SYSTEM_INSTRUCTION =
  "Eres un coach experto que evalúa simulaciones de roleplay de habilidades blandas. " +
  "Recibes una conversación entre un participante (USUARIO) y un personaje interpretado por IA. " +
  "Evalúas SOLO el desempeño del usuario, nunca del personaje. " +
  "Respondes exclusivamente con JSON válido que cumpla el schema pedido. " +
  "Los scores son enteros entre 0 y 100, uno por cada criterio recibido y en el mismo orden. " +
  "El campo 'aprobado' es true si el promedio de scores es mayor a 60. " +
  "El feedback es una evaluación honesta de 2-4 oraciones que mencione fortalezas concretas y áreas de mejora basadas en frases reales de la conversación.";

const EVAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
    },
    feedback: { type: Type.STRING },
    aprobado: { type: Type.BOOLEAN },
  },
  required: ["scores", "feedback", "aprobado"],
};

const ROLEPLAY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    respuesta: { type: Type.STRING },
    score: { type: Type.INTEGER },
  },
  required: ["respuesta"],
};

export async function evaluateTextResponse(
  prompt: string,
): Promise<AsyncResult<TextEvaluation>> {
  const ai = getClient();
  if (!ai) return { ok: false, reason: 'no-api-key' };
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: EVAL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: EVAL_SCHEMA as any,
        temperature: 0.4,
      },
    });
    const text = response.text ?? "";
    const parsed = JSON.parse(text);
    if (
      parsed &&
      Array.isArray(parsed.scores) &&
      typeof parsed.feedback === "string"
    ) {
      return {
        ok: true,
        data: {
          scores: parsed.scores,
          feedback: parsed.feedback,
          aprobado: Boolean(parsed.aprobado),
        },
      };
    }
    return { ok: false, reason: 'invalid-shape' };
  } catch {
    return { ok: false, reason: 'api-error' };
  }
}

export async function generateRoleplayReply(
  prompt: string,
): Promise<AsyncResult<{ respuesta: string; score?: number }>> {
  const ai = getClient();
  if (!ai) return { ok: false, reason: 'no-api-key' };
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: ROLEPLAY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: ROLEPLAY_SCHEMA as any,
        temperature: 0.7,
      },
    });
    const text = response.text ?? "";
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.respuesta === "string" && parsed.respuesta.trim()) {
      return { ok: true, data: { respuesta: parsed.respuesta, score: parsed.score } };
    }
    return { ok: false, reason: 'invalid-shape' };
  } catch {
    return { ok: false, reason: 'api-error' };
  }
}

export async function evaluateRoleplayConversation(params: {
  scenario: { roleName: string; title: string; situation: string; userRole: string; goal: string };
  criteria: string[];
  conversation: { rol: string; texto: string }[];
}): Promise<AsyncResult<RoleplayEvaluation>> {
  const ai = getClient();
  if (!ai) return { ok: false, reason: 'no-api-key' };

  const transcriptText = params.conversation
    .map(
      (m) =>
        `${m.rol === "user" ? "USUARIO" : params.scenario.roleName.toUpperCase()}: ${m.texto}`,
    )
    .join("\n");

  const prompt = `Roleplay completado. Contexto:
Personaje (IA): ${params.scenario.roleName} — ${params.scenario.title}
Rol del usuario: ${params.scenario.userRole}
Objetivo del usuario: ${params.scenario.goal}
Situación: ${params.scenario.situation}

Criterios de evaluación (devolvé exactamente ${params.criteria.length} scores en este orden):
${params.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Transcripción de la conversación:
${transcriptText}

Evaluá el desempeño del USUARIO según los criterios. Respondé solo el JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: ROLEPLAY_EVAL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: EVAL_SCHEMA as any,
        temperature: 0.4,
      },
    });
    const text = response.text ?? "";
    const parsed = JSON.parse(text);
    if (
      parsed &&
      Array.isArray(parsed.scores) &&
      parsed.scores.length === params.criteria.length &&
      typeof parsed.feedback === "string"
    ) {
      return {
        ok: true,
        data: {
          scores: parsed.scores,
          feedback: parsed.feedback,
          aprobado: Boolean(parsed.aprobado),
        },
      };
    }
    return { ok: false, reason: 'invalid-shape' };
  } catch {
    return { ok: false, reason: 'api-error' };
  }
}

export async function generateReflectionInsight(
  prompt: string,
): Promise<AsyncResult<string>> {
  const ai = getClient();
  if (!ai) return { ok: false, reason: 'no-api-key' };
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: REFLECTION_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    const insight = response.text?.trim();
    if (!insight) return { ok: false, reason: 'invalid-shape' };
    return { ok: true, data: insight };
  } catch {
    return { ok: false, reason: 'api-error' };
  }
}
