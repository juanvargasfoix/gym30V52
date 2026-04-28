import React, { useState } from 'react';
import { Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { SkillContentD } from '../data/skill-content';
import { generateReflectionInsight } from '../../src/lib/gemini';

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(word => word.length > 0).length;

interface ReflectionPanelProps {
  content: SkillContentD;
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export const ReflectionPanel: React.FC<ReflectionPanelProps> = ({ content, isAlreadyCompleted, onComplete, onBack }) => {
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>(
    content.questions.map(() => '')
  );
  const [insightResult, setInsightResult] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  // Tracks whether onComplete() was already fired so we never double-credit XP
  // (e.g. when the user retries the insight after a first failure).
  const [hasCompleted, setHasCompleted] = useState(false);

  const isValid = reflectionAnswers.every(ans => countWords(ans) >= 100);

  const completeOnce = () => {
    if (hasCompleted) return;
    onComplete();
    setHasCompleted(true);
  };

  const handleSubmit = async () => {
    setIsGeneratingInsight(true);
    setInsightError(null);
    try {
      const prompt = content.promptGenerator(reflectionAnswers);
      const result = await generateReflectionInsight(prompt);
      if (!result.ok) {
        // The user reflected validly — credit the skill once, but surface the
        // failure so they know the insight wasn't generated.
        setInsightError(
          result.reason === 'no-api-key'
            ? 'La generación de insights con IA no está configurada en este entorno.'
            : 'No pudimos generar tu insight personalizado. Tu reflexión fue guardada.'
        );
        completeOnce();
        return;
      }
      setInsightResult(result.data);
      completeOnce();
    } finally { setIsGeneratingInsight(false); }
  };

  return (
    <div className="space-y-8">
      {isAlreadyCompleted && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold border border-green-200 text-center">
          ✅ Ya completaste esta reflexión
        </div>
      )}
      {content.questions.map((q, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block font-bold text-slate-800 mb-4 text-lg">{q}</label>
          <textarea
            className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 ring-pink-500 outline-none text-base leading-relaxed"
            rows={4}
            value={reflectionAnswers[i] || ''}
            onChange={(e) => {
              const newAns = [...reflectionAnswers];
              newAns[i] = e.target.value;
              setReflectionAnswers(newAns);
            }}
            placeholder="Escribe tu reflexión..."
            disabled={isAlreadyCompleted}
          />
          <div className={`text-xs text-right mt-2 font-bold ${countWords(reflectionAnswers[i] || '') < 100 ? 'text-orange-500' : 'text-green-600'}`}>
            {countWords(reflectionAnswers[i] || '')} / 100 palabras
          </div>
        </div>
      ))}
      {insightError && !insightResult && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-bold mb-1">Insight no disponible</p>
            <p className="text-sm mb-3">{insightError}</p>
            {hasCompleted && (
              <p className="text-xs text-amber-700 mb-3">
                ✅ Tu habilidad fue marcada como completada igualmente — la reflexión es lo que cuenta.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isGeneratingInsight}
                className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingInsight && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                🔄 Reintentar insight
              </button>
              {hasCompleted && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  🗺️ Volver al Mapa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!insightResult ? (
        <button
          onClick={handleSubmit}
          disabled={!isValid || isGeneratingInsight || isAlreadyCompleted || (insightError !== null && hasCompleted)}
          className="w-full py-5 bg-pink-500 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-xl hover:bg-pink-600 transition-all flex justify-center items-center gap-3 text-lg"
        >
          {isGeneratingInsight
            ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            : <><Lightbulb className="w-6 h-6" /> {isAlreadyCompleted ? 'Reflexión Completada' : 'Enviar Reflexión'}</>
          }
        </button>
      ) : (
        <div className="bg-pink-50 p-8 rounded-[2rem] border border-pink-100 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-black text-xl text-pink-700">Insight del Coach</span>
          </div>
          <p className="text-slate-800 text-lg leading-relaxed italic mb-6">"{insightResult}"</p>
          <button onClick={onBack} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">¡Entendido! (+50 XP)</button>
        </div>
      )}
    </div>
  );
};
