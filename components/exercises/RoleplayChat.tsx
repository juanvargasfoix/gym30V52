import React, { useState } from 'react';
import { Send, User as UserIcon, Award, Star, AlertCircle } from 'lucide-react';
import { SkillContentC } from '../data/skill-content';
import { generateRoleplayReply, evaluateRoleplayConversation, RoleplayEvaluation } from '../../src/lib/gemini';
import { ILLUSTRATIONS } from '../../utils/illustrations';

interface RoleplayChatProps {
  content: SkillContentC;
  isAlreadyCompleted: boolean;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}

const DEFAULT_CRITERIA = ['Comunicación', 'Negociación', 'Manejo de Objeciones'];

export const RoleplayChat: React.FC<RoleplayChatProps> = ({ content, isAlreadyCompleted, onComplete, onBack }) => {
  const [chatHistory, setChatHistory] = useState<{ rol: string; texto: string }[]>([
    { rol: content.scenario.roleName, texto: content.scenario.initialMessage }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [chatFinished, setChatFinished] = useState(false);
  const [viewingChatHistory, setViewingChatHistory] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<RoleplayEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  // Snapshot of the conversation at the moment we tried to evaluate.
  // Used by the retry button so we can re-evaluate the exact same transcript.
  const [pendingEvalHistory, setPendingEvalHistory] = useState<{ rol: string; texto: string }[] | null>(null);

  const criteria = content.scenario.evaluationCriteria || DEFAULT_CRITERIA;

  const runEvaluation = async (historyForEval: { rol: string; texto: string }[]) => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const result = await evaluateRoleplayConversation({
        scenario: {
          roleName: content.scenario.roleName,
          title: content.scenario.title,
          situation: content.scenario.situation,
          userRole: content.scenario.userRole,
          goal: content.scenario.goal,
        },
        criteria,
        conversation: historyForEval,
      });
      if (!result.ok) {
        setPendingEvalHistory(historyForEval);
        setEvalError(
          result.reason === 'no-api-key'
            ? 'La evaluación con IA no está configurada en este entorno. Contactá al administrador.'
            : 'No pudimos evaluar tu simulación en este momento. Intentá de nuevo en unos segundos.'
        );
        return;
      }
      setEvaluation(result.data);
      const avg = Math.round(
        result.data.scores.reduce((a, b) => a + b, 0) / Math.max(result.data.scores.length, 1)
      );
      setChatFinished(true);
      setPendingEvalHistory(null);
      onComplete(avg);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { rol: 'user', texto: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    if (newTurnCount >= 5) {
      setIsTyping(false);
      await runEvaluation(newHistory);
      return;
    }
    try {
      const prompt = content.promptGenerator(newHistory, chatInput, content.scenario);
      const reply = await generateRoleplayReply(prompt);
      if (!reply.ok) {
        // Show inline error from the character so the user knows the AI failed
        setChatHistory([...newHistory, {
          rol: content.scenario.roleName,
          texto: '⚠️ No pude generar una respuesta en este momento. Podés enviar otro mensaje para continuar.'
        }]);
      } else {
        setChatHistory([...newHistory, { rol: content.scenario.roleName, texto: reply.data.respuesta }]);
      }
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  if (isEvaluating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Evaluando tu simulación...</h3>
        <p className="text-slate-500">El coach está analizando la conversación contra los {criteria.length} criterios.</p>
      </div>
    );
  }

  if (evalError && pendingEvalHistory && !evaluation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No se pudo evaluar la simulación</h3>
        <p className="text-slate-600 max-w-md mb-2">{evalError}</p>
        <p className="text-xs text-slate-400 mb-6">Tu conversación está guardada. La habilidad <strong>no</strong> se marcará como completada hasta que la evaluación sea exitosa.</p>
        <div className="flex gap-3">
          <button
            onClick={() => runEvaluation(pendingEvalHistory)}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
          >
            🔄 Reintentar evaluación
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            🗺️ Volver al Mapa
          </button>
        </div>
      </div>
    );
  }

  if (chatFinished && !viewingChatHistory && evaluation) {
    const avgScore = Math.round(
      evaluation.scores.reduce((a, b) => a + b, 0) / Math.max(evaluation.scores.length, 1)
    );
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 p-4">
          <img src={ILLUSTRATIONS.ourSolution} alt="Completado" className="w-16 h-16" loading="lazy" />
        </div>
        <h3 className="text-4xl font-black text-slate-900 mb-2">¡Simulación Completada!</h3>
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">✅ +50 XP Ganados</span>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold">🎯 5 Turnos</span>
          <span className={`px-4 py-1 rounded-full font-bold ${avgScore >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            ⭐ Promedio {avgScore}/100
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg w-full max-w-lg mb-8 text-left">
          <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">📊 Evaluación de Desempeño</h4>
          <div className="space-y-3 mb-6">
            {criteria.map((criterion, idx) => {
              const score = evaluation.scores[idx] ?? 0;
              const filled = Math.max(0, Math.min(5, Math.round(score / 20)));
              return (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">{criterion}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-10 text-right">{score}/100</span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= filled ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-indigo-500 uppercase mb-1">💬 Feedback del Coach</p>
            <p className="text-sm text-indigo-900 italic">"{evaluation.feedback}"</p>
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
            onClick={onBack}
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
        {isAlreadyCompleted && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold border border-green-200 text-center mb-4">
            ✅ Ya completaste esta simulación
          </div>
        )}
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
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-bl-none shadow-sm border border-slate-200 flex gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        {chatFinished && !viewingChatHistory && (
          <div className="text-center py-6 animate-fade-in">
            <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold shadow-sm text-lg">🎉 Simulación Completada (+50 XP)</div>
          </div>
        )}
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
            onKeyDown={(e) => e.key === 'Enter' && !chatFinished && !isAlreadyCompleted && handleChatSend()}
            placeholder={isAlreadyCompleted ? 'Ejercicio Completado' : chatFinished ? 'Simulación finalizada' : 'Escribe tu respuesta...'}
            disabled={chatFinished || isAlreadyCompleted}
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-lg transition-all"
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || isTyping || chatFinished || isAlreadyCompleted}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-lg"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
