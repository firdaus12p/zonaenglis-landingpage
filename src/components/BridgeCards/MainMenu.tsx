import React from 'react';
import { Flame, Trophy, Users } from 'lucide-react';
import type { CardMode } from '../../types/bridgeCards';

interface MainMenuProps {
  streak: number;
  todayCount: number;
  lastPlayedMode: CardMode | null;
  onSelectMode: (mode: CardMode) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ streak, todayCount, lastPlayedMode, onSelectMode }) => {
  // Fungsi penentu gaya: jika mode == lastPlayedMode, maka berikan variasi gradien + gaya "Premium". 
  // Jika tidak, gaya putih polos (White Card) biasa.
  const getButtonClasses = (
    mode: CardMode, 
    baseColor: string, 
    hoverColor: string, 
    iconBg: string, 
    iconColor: string,
    gradientClass: string // Gradien spesifik untuk mode jika ia aktif
  ) => {
    const isActive = lastPlayedMode === mode || (!lastPlayedMode && mode === 'realPartner');
    
    if (isActive) {
      return {
        container: `w-full ${gradientClass} hover:shadow-lg rounded-2xl p-6 text-left transition-all group hover:scale-[1.01]`,
        iconWrapper: "w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm",
        icon: "text-white text-2xl",
        title: "text-xl font-bold text-white mb-1",
        subtitle: "text-sm text-white/80",
        arrow: "text-white text-2xl group-hover:translate-x-1 transition-all"
      };
    }
    
    // Normal style
    return {
      container: "w-full bg-white hover:shadow-lg rounded-2xl p-6 text-left transition-all border border-slate-100 group",
      iconWrapper: `w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl ${hoverColor} transition-colors`,
      icon: iconColor,
      title: "text-xl font-bold text-slate-900 mb-1",
      subtitle: "text-sm text-slate-500",
      arrow: `text-slate-300 text-2xl group-hover:${baseColor} group-hover:translate-x-1 transition-all`
    };
  };

  const warmupStyle = getButtonClasses('warmup', 'text-blue-500', 'group-hover:bg-blue-100', 'bg-blue-50', '', 'bg-gradient-to-br from-blue-500 to-indigo-500');
  const aiPartnerStyle = getButtonClasses('partner', 'text-purple-500', 'group-hover:bg-purple-100', 'bg-purple-50', '', 'bg-gradient-to-br from-purple-500 to-fuchsia-500');
  const realPartnerStyle = getButtonClasses('realPartner', 'text-rose-500', 'group-hover:bg-rose-100', 'bg-rose-50', '', 'bg-gradient-to-br from-rose-500 to-pink-500');
  const voicePracticeStyle = getButtonClasses('voicePractice', 'text-indigo-500', 'group-hover:bg-indigo-100', 'bg-indigo-50', '', 'bg-gradient-to-br from-indigo-500 to-violet-500');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Theme Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-6 py-2 shadow-sm mb-4">
            <span className="text-sm font-medium text-slate-500">Level A1 • Beginner</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Daily Life & Favorites</h1>
          <p className="text-slate-500">Practice essential conversations</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Flame className="text-orange-500" size={18} />
            <span className="text-sm font-semibold text-slate-700">{streak} days</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Trophy className="text-green-600" size={18} />
            <span className="text-sm font-semibold text-slate-700">{todayCount} cards</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase text-center md:text-left ml-2">CHOOSE PRACTICE MODE</p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <button
            onClick={() => onSelectMode('warmup')}
            className={warmupStyle.container}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={warmupStyle.iconWrapper}>
                  <span className={warmupStyle.icon}>🎯</span>
                </div>
                <div>
                  <h2 className={warmupStyle.title}>Warmup Cards</h2>
                  <p className={warmupStyle.subtitle}>Solo practice • Vocabulary & Grammar</p>
                </div>
              </div>
              <div className={warmupStyle.arrow}>→</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('partner')}
            className={aiPartnerStyle.container}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={aiPartnerStyle.iconWrapper}>
                  <span className={aiPartnerStyle.icon}>💬</span>
                </div>
                <div>
                  <h2 className={aiPartnerStyle.title}>AI Partner Cards</h2>
                  <p className={aiPartnerStyle.subtitle}>AI Practice • Speaking & Responses</p>
                </div>
              </div>
              <div className={aiPartnerStyle.arrow}>→</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('realPartner')}
            className={realPartnerStyle.container}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={realPartnerStyle.iconWrapper}>
                  <Users className={lastPlayedMode === 'realPartner' || (!lastPlayedMode) ? 'text-white' : 'text-rose-500'} size={24} />
                </div>
                <div>
                  <h2 className={realPartnerStyle.title}>Real Partner Mode</h2>
                  <p className={realPartnerStyle.subtitle}>Practice with a friend face-to-face</p>
                </div>
              </div>
              <div className={realPartnerStyle.arrow}>→</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('voicePractice')}
            className={voicePracticeStyle.container}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={voicePracticeStyle.iconWrapper}>
                  <span className={voicePracticeStyle.icon}>🤖</span>
                </div>
                <div>
                  <h2 className={voicePracticeStyle.title}>AI Voice Practice</h2>
                  <p className={voicePracticeStyle.subtitle}>Conversation with Ze AI</p>
                </div>
              </div>
              <div className={voicePracticeStyle.arrow}>→</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
