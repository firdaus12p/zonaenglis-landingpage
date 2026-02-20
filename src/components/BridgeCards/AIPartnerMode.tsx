import React from 'react';
import type { PartnerCard } from '../../types/bridgeCards';
import { BridgeProgressBar } from './shared/BridgeProgressBar';

interface AIPartnerModeProps {
  card: PartnerCard;
  currentCardIndex: number;
  totalCards: number;
  userAnswer: string;
  feedback: string;
  onAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onNext: () => void;
  onExit: () => void;
}

export const AIPartnerMode: React.FC<AIPartnerModeProps> = ({
  card,
  currentCardIndex,
  totalCards,
  userAnswer,
  feedback,
  onAnswerChange,
  onCheckAnswer,
  onNext,
  onExit
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-md mx-auto w-full">
        <BridgeProgressBar
          current={currentCardIndex}
          total={totalCards}
          colorClass="bg-purple-600"
          onExit={onExit}
          labelPrefix="Question"
        />

        <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/5 p-6 md:p-8 mb-6 border border-purple-50">
          <div className="text-sm tracking-widest text-purple-600 mb-4 font-bold uppercase">QUESTION:</div>
          <div className="text-2xl font-bold text-slate-800 mb-8 leading-tight">{card.question}</div>
          
          <div className="bg-purple-50/80 rounded-xl p-5 mb-6 border border-purple-100/50">
            <div className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span> Answer like this:
            </div>
            <div className="text-purple-900 font-bold text-lg">{card.expected}</div>
          </div>

          <textarea
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full border-2 border-slate-200 rounded-xl p-4 text-lg focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all outline-none resize-none bg-slate-50 focus:bg-white"
            rows={3}
            disabled={!!feedback}
          />

          {feedback && (
            <div className={`mt-5 p-5 rounded-xl border ${
              feedback.includes('Perfect') 
                ? 'bg-green-50 border-green-100 text-green-700' 
                : 'bg-amber-50 border-amber-100 text-amber-700'
            } font-medium animate-in slide-in-from-top-2 fade-in duration-300`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {!feedback ? (
            <button
              onClick={onCheckAnswer}
              disabled={!userAnswer.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex-1 bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-100 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Next Question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
