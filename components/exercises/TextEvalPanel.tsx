import React, { useState } from 'react';
import { Brain, Sparkles, Award, Star } from 'lucide-react';
import { SkillContentB } from '../data/skill-content';
import { evaluateTextResponse } from '../../src/lib/gemini';

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(word => word.length > 0).length;

interface TextEvalPanelProps {
  content: SkillContentB;
  isAlreadyCompleted: boolean;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}

export const TextEvalPanel: React.FC<TextEvalPanelProps> = ({ content, isAlreadyCompleted, onComplete, onBack }) => {
  const [textResponse, setTextResponse] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<{ scores: number[]; feedback: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const wordCount = countWords(textResponse);

  const handleEval = async () => {
    if (wordCount < 150) return;
    setIsEvaluating(true);
    try {
      const prompt = content.evaluatorConfig.promptGenerator(textResponse);
      const result = await evaluateTextResponse(prompt);
      setEvaluationResult(result);
      if (result.aprobado || result.scores[0] > 60) {
        const avgScore = Math.round(result.scores.reduce((a: number, b: number) => a + b, 0) / result.scores.length);
        onComplete(avgScore);
      }
    } catch (e) { console.error(e); } finally { setIsEvaluating(false); }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Brain className="w-6 h-6 text-purple-500" /> Tu Respuesta</h3>

      {isAlreadyCompleted && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold border border-green-200 mb-2">
          ✅ Ya completaste este ejercicio
        </div>
      )}

      <textarea
        value={textResponse}
        onChange={(e) => setTextResponse(e.target.value)}
        placeholder="Escribe tu análisis aquí..."
        disabled={isAlreadyCompleted}
        className="w-full h-56 p-6 rounded-2xl border border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none resize-none text-lg leading-relaxed shadow-sm transition-all"
      />
      <div className="flex justify-end">
        <span className={`text-sm font-bold ${wordCount < 150 ? 'text-orange-500' : 'text-green-600'}`}>
          {wordCount} / 150 palabras
        </span>
      </div>

      {!evaluationResult ? (
        <button
          onClick={handleEval}
          disabled={wordCount < 150 || isEvaluating || isAlreadyCompleted}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvaluating ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {isAlreadyCompleted ? 'Ejercicio Completado' : 'Enviar mi respuesta ✨'}
        </button>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl animate-fade-in">
          <h4 className="font-black text-2xl text-indigo-900 mb-8 flex items-center gap-3"><Award className="w-8 h-8 text-yellow-500" /> Resultados del Análisis</h4>
          <div className="space-y-6 mb-8">
            {content.evaluatorConfig.criteriaNames.map((crit, i) => {
              let rawScore = evaluationResult.scores[i];
              if (rawScore <= 10) rawScore *= 10;

              let stars = 1;
              let label = 'Necesita trabajo';
              if (rawScore >= 90) { stars = 5; label = 'Excelente'; }
              else if (rawScore >= 80) { stars = 4; label = 'Muy bien'; }
              else if (rawScore >= 70) { stars = 3; label = 'Bien'; }
              else if (rawScore >= 60) { stars = 2; label = 'Puede mejorar'; }

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
          <button onClick={onBack} className="w-full py-4 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-all">Continuar</button>
        </div>
      )}
    </div>
  );
};
