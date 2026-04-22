import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { SkillContentA } from '../data/skill-content';

interface QuizPanelProps {
  content: SkillContentA;
  isAlreadyCompleted: boolean;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ content, isAlreadyCompleted, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionSelect = (optIndex: number, correctIndex: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optIndex);
    let currentScore = quizScore;
    if (optIndex === correctIndex) {
      setQuizScore(prev => prev + 1);
      currentScore += 1;
    }
    setTimeout(() => {
      if (currentQuestionIndex < content.quiz.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedQuizOption(null);
      } else {
        setQuizFinished(true);
        const finalScorePercent = Math.round((currentScore / content.quiz.length) * 100);
        onComplete(finalScorePercent);
      }
    }, 1500);
  };

  if (quizFinished) {
    const total = content.quiz.length;
    const score = quizScore;
    let message = '';
    let colorClass = '';
    let emoji = '';

    if (score === total) {
      message = '¡Perfecto!'; colorClass = 'text-emerald-500'; emoji = '🎯';
    } else if (score >= total * 0.8) {
      message = '¡Muy bien!'; colorClass = 'text-emerald-500'; emoji = '⭐';
    } else if (score >= total * 0.6) {
      message = '¡Bien!'; colorClass = 'text-yellow-500'; emoji = '👍';
    } else {
      message = '¡Sigue practicando!'; colorClass = 'text-orange-500'; emoji = '💪';
    }

    return (
      <div className="text-center py-12">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce bg-slate-50 border-4 ${colorClass.replace('text', 'border')}`}>
          <span className="text-5xl">{emoji}</span>
        </div>
        <h3 className={`text-4xl font-black mb-2 ${colorClass}`}>{message}</h3>
        <p className="text-slate-600 text-2xl font-bold mb-2">Puntaje: <span className={colorClass}>{score}/{total}</span> respuestas correctas</p>
        <p className="text-slate-500 text-lg mb-8">Has demostrado dominar estos conceptos.</p>
        <button onClick={onBack} className="px-10 py-4 bg-cyan-500 text-white rounded-2xl font-bold shadow-xl shadow-cyan-200 hover:scale-105 transition-transform">Volver al Mapa</button>
      </div>
    );
  }

  const question = content.quiz[currentQuestionIndex];

  return (
    <div className="space-y-8">
      {isAlreadyCompleted && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold border border-green-200 mb-4 text-center">
          ✅ Ya completaste este quiz
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Progreso</span>
        <span className="text-sm font-black text-slate-700">{currentQuestionIndex + 1} / {content.quiz.length}</span>
      </div>
      <div className="w-full bg-white rounded-full h-3 mb-8 shadow-sm border border-slate-200">
        <div className="bg-cyan-500 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / content.quiz.length) * 100}%` }} />
      </div>
      <h3 className="font-bold text-2xl text-slate-900 leading-snug">{question.pregunta}</h3>
      <div className="space-y-4">
        {question.opciones.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(idx, question.correcta)}
            disabled={selectedQuizOption !== null || isAlreadyCompleted}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center text-lg ${
              selectedQuizOption === idx
                ? idx === question.correcta
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
                : selectedQuizOption !== null && idx === question.correcta
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md'
            } ${isAlreadyCompleted ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {opt}
            {selectedQuizOption === idx && (idx === question.correcta ? <CheckCircle className="w-6 h-6" /> : <X className="w-6 h-6" />)}
          </button>
        ))}
      </div>
    </div>
  );
};
