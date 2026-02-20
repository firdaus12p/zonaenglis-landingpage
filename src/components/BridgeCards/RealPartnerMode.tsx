import React from 'react';
import { Users, Mic } from 'lucide-react';
import type { PartnerCard, StudentRole } from '../../types/bridgeCards';
import { BridgeProgressBar } from './shared/BridgeProgressBar';

interface RealPartnerModeProps {
  card: PartnerCard;
  currentCardIndex: number;
  totalCards: number;
  studentRole: StudentRole;
  showAnswer: boolean;
  onRoleSwitch: () => void;
  onToggleAnswer: () => void;
  onNext: () => void;
  onExit: () => void;
}

export const RealPartnerMode: React.FC<RealPartnerModeProps> = ({
  card,
  currentCardIndex,
  totalCards,
  studentRole,
  showAnswer,
  onRoleSwitch,
  onToggleAnswer,
  onNext,
  onExit
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-rose-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-md mx-auto w-full">
        {/* Progress & Role Indicator */}
        <BridgeProgressBar
          current={currentCardIndex}
          total={totalCards}
          colorClass="bg-rose-500"
          onExit={onExit}
          labelPrefix="Question"
        />

        {/* Instructions */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 border-2 border-amber-200/50 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm">
          <div className="text-3xl filter drop-shadow animate-pulse">💡</div>
          <div>
            <div className="font-extrabold text-amber-900 mb-2">How to use:</div>
            <ol className="text-sm text-amber-800 space-y-1.5 list-decimal list-inside font-medium">
              <li>Sit face-to-face with your partner</li>
              <li>Read your card and speak in English!</li>
            </ol>
          </div>
        </div>

        {/* Student A's View */}
        {studentRole === 'A' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-rose-900/5 p-8 mb-8 border-4 border-rose-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-50">
              <div className="text-sm text-rose-600 font-bold flex items-center gap-2 tracking-wide">
                <Mic size={18} className="animate-pulse" />
                YOU ASK
              </div>
              <div className="bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
                STUDENT A
              </div>
            </div>

            <div className="text-3xl font-black text-slate-800 mb-6 leading-tight">
              "{card.question}"
            </div>
            <div className="text-sm font-semibold text-rose-600 mb-8 flex items-center gap-2">
              <span className="text-lg">👉</span> Ask your partner in English!
            </div>

            <button
              onClick={onToggleAnswer}
              className="w-full bg-rose-50 hover:bg-rose-100/80 focus:ring-4 focus:ring-rose-50 text-rose-700 font-bold py-3.5 px-4 rounded-xl transition-all mb-4 border border-rose-100/50 active:scale-[0.98]"
            >
              <span className="mr-2">{showAnswer ? '👁️ Hide' : '👁️ Show'}</span>
              what Student B should say
            </button>

            {showAnswer && (
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-5 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="text-xs text-blue-600 mb-2 font-bold uppercase tracking-wider">Answer Guide:</div>
                <div className="text-blue-900 font-bold text-lg mb-3">{card.expected}</div>
                <div className="text-xs font-semibold text-blue-700 bg-blue-100/50 p-2.5 rounded-lg">
                  ✓ Wait for these words: {card.keywords.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Student B's View */}
        {studentRole === 'B' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-8 mb-8 border-4 border-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-blue-50">
              <div className="text-sm text-blue-600 font-bold flex items-center gap-2 tracking-wide">
                <Mic size={18} className="animate-pulse" />
                YOU ANSWER
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
                STUDENT B
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
              <span className="text-lg">👂</span> Listen, then answer:
            </div>
            
            <div className="text-3xl font-black text-slate-800 mb-8 leading-tight">
              {card.expected}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8">
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Use these words:</div>
              <div className="flex flex-wrap gap-2">
                {card.keywords.map((word, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-sm font-bold shadow-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onToggleAnswer}
              className="w-full bg-blue-50 hover:bg-blue-100/80 focus:ring-4 focus:ring-blue-50 text-blue-700 font-bold py-3.5 px-4 rounded-xl transition-all mb-4 border border-blue-100/50 active:scale-[0.98]"
            >
              <span className="mr-2">{showAnswer ? '👁️ Hide' : '👁️ Show'}</span>
              the question
            </button>

            {showAnswer && (
              <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-5 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="text-xs text-rose-600 mb-2 font-bold uppercase tracking-wider">Student A asks:</div>
                <div className="text-rose-900 font-bold text-lg">"{card.question}"</div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onRoleSwitch}
            className="flex-1 bg-white hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 border-2 border-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Users size={20} />
            Switch
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-gradient-to-br from-rose-500 to-pink-500 focus:ring-4 focus:ring-rose-200 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};
