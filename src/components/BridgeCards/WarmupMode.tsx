import React from 'react';
import { Volume2, RotateCw, CheckCircle } from 'lucide-react';
import type { WarmupCard } from '../../types/bridgeCards';
import { BridgeProgressBar } from './shared/BridgeProgressBar';

interface WarmupModeProps {
  card: WarmupCard;
  currentCardIndex: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
  onExit: () => void;
  onReview: () => void;
  onMastered: () => void;
}

export const WarmupMode: React.FC<WarmupModeProps> = ({
  card,
  currentCardIndex,
  totalCards,
  isFlipped,
  onFlip,
  onExit,
  onReview,
  onMastered
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-md mx-auto w-full">
        <BridgeProgressBar
          current={currentCardIndex}
          total={totalCards}
          colorClass="bg-blue-600"
          onExit={onExit}
        />

        <div 
          onClick={onFlip}
          className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-50/50 p-8 min-h-[320px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/10"
        >
          <div className="text-center w-full">
            {!isFlipped ? (
              <div className="space-y-6">
                <div className="text-sm font-semibold tracking-wider text-slate-400">TAP TO FLIP</div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">{card.front}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold tracking-wide">
                  <Volume2 size={16} />
                  ANSWER
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-green-700 leading-tight">{card.back}</div>
              </div>
            )}
          </div>
        </div>

        {isFlipped && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={onReview}
              className="flex-1 bg-amber-100/80 hover:bg-amber-100 focus:ring-4 focus:ring-amber-50 text-amber-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <RotateCw size={20} />
              Review
            </button>
            <button
              onClick={onMastered}
              className="flex-1 bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-100 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <CheckCircle size={20} />
              Got it!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
