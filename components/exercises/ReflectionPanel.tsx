import React, { useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
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

  const isValid = reflectionAnswers.every(ans => countWords(ans) >= 100);

  const handleSubmit = async () => {
    setIsGeneratingInsight(true);
    try {
      const prompt = content.promptGenerator(reflectionAnswers);
      const insight = await generateReflectionInsight(prompt);
      setInsightResult(insight);
      onComplete();
    } catch (e) { console.error(e); } finally { setIsGeneratingInsight(false); }
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
      {!insightResult ? (
        <button
          onClick={handleSubmit}
          disabled={!isValid || isGeneratingInsight || isAlreadyCompleted}
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
