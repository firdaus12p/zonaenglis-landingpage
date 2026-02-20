import React from 'react';

interface CompletionScreenProps {
  masteredCount: number;
  reviewCount: number;
  onReset: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ 
  masteredCount, 
  reviewCount, 
  onReset 
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Great Job!</h2>
        <p className="text-slate-600 mb-6 font-medium">You've completed all the cards for today!</p>
        
        <div className="bg-green-50/80 border border-green-100 rounded-xl p-4 mb-4 transition-all hover:scale-105">
          <div className="text-3xl font-black text-green-700">{masteredCount}</div>
          <div className="text-sm font-semibold text-green-600 mt-1">Cards Mastered ✅</div>
        </div>

        {reviewCount > 0 && (
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 mb-6 transition-all hover:scale-105">
            <div className="text-3xl font-black text-amber-700">{reviewCount}</div>
            <div className="text-sm font-semibold text-amber-600 mt-1">Cards to Review 🔄</div>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
