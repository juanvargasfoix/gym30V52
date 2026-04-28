import React from 'react';
import { User as UserIcon, Award } from 'lucide-react';
import { SKILL_CONTENT, SkillContentA, SkillContentB, SkillContentC, SkillContentD } from '../data/skill-content';
import { QuizPanel } from './QuizPanel';
import { TextEvalPanel } from './TextEvalPanel';
import { RoleplayChat } from './RoleplayChat';
import { ReflectionPanel } from './ReflectionPanel';

interface ExerciseRunnerProps {
  contentKey: string;
  isAlreadyCompleted: boolean;
  onComplete: (scorePercent: number) => void;
  onBack: () => void;
}

export const ExerciseRunner: React.FC<ExerciseRunnerProps> = ({ contentKey, isAlreadyCompleted, onComplete, onBack }) => {
  const content = SKILL_CONTENT[contentKey];

  if (!content) {
    return <div className="text-center py-20 text-slate-400">Contenido no disponible.</div>;
  }

  return (
    <div className="space-y-10">
      {/* THEORY CARD */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
        {content.type === 'A' && (content as SkillContentA).theory}
        {content.type === 'B' && (content as SkillContentB).theory}
        {content.type === 'C' && (
          <div>
            <div className={`bg-gradient-to-r ${(content as SkillContentC).scenario.headerGradient} p-8 rounded-2xl text-white mb-6 shadow-lg`}>
              <h3 className="text-3xl font-black mb-2">Roleplay: {(content as SkillContentC).scenario.title}</h3>
              <p className="opacity-90 text-lg">{(content as SkillContentC).scenario.description}</p>
            </div>
            <div className="flex gap-6 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-indigo-500" /> Tu rol: <span className="text-slate-900">{(content as SkillContentC).scenario.userRole}</span></div>
              <div className="flex items-center gap-2"><Award className="w-5 h-5 text-indigo-500" /> Objetivo: <span className="text-slate-900">{(content as SkillContentC).scenario.goal}</span></div>
            </div>
          </div>
        )}
        {content.type === 'D' && (
          <div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">{(content as SkillContentD).title}</h3>
            <p className="text-lg text-slate-600 leading-relaxed">{(content as SkillContentD).description}</p>
          </div>
        )}
      </div>

      {/* PRACTICE CARD */}
      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 shadow-inner">
        {content.type === 'A' && (
          <QuizPanel
            content={content as SkillContentA}
            isAlreadyCompleted={isAlreadyCompleted}
            onComplete={onComplete}
            onBack={onBack}
          />
        )}
        {content.type === 'B' && (
          <TextEvalPanel
            content={content as SkillContentB}
            isAlreadyCompleted={isAlreadyCompleted}
            onComplete={onComplete}
            onBack={onBack}
          />
        )}
        {content.type === 'C' && (
          <RoleplayChat
            content={content as SkillContentC}
            isAlreadyCompleted={isAlreadyCompleted}
            onComplete={onComplete}
            onBack={onBack}
          />
        )}
        {content.type === 'D' && (
          <ReflectionPanel
            content={content as SkillContentD}
            isAlreadyCompleted={isAlreadyCompleted}
            onComplete={() => onComplete(100)}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
};
