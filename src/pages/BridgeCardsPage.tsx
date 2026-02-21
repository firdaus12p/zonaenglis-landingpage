import React, { useEffect, useCallback } from "react";
import { useBridgeCards } from "../hooks/useBridgeCards";
import {
  useBridgeAuth,
  BridgeAuthProvider,
} from "../contexts/BridgeAuthContext";
import { bridgeCardsService } from "../services/bridgeCardsService";
import { SERVER_URL } from "../config/api";
import { BridgeCardsLogin } from "../components/BridgeCards/BridgeCardsLogin";

// Components
import { MainMenu } from "../components/BridgeCards/MainMenu";
import { WarmupMode } from "../components/BridgeCards/WarmupMode";
import { AIPartnerMode } from "../components/BridgeCards/AIPartnerMode";
import { RealPartnerMode } from "../components/BridgeCards/RealPartnerMode";
import { CompletionScreen } from "../components/BridgeCards/CompletionScreen";
import { VoicePracticeMode } from "../components/BridgeCards/VoicePracticeMode";

const BridgeCardsApp: React.FC = () => {
  // Auth must be resolved first so isAuthenticated is passed to the hook
  const { isAuthenticated, isLoading, student } = useBridgeAuth();
  const { state, voiceState, chatState, actions, cards } =
    useBridgeCards(isAuthenticated);
  const { warmup: warmupCards, partner: partnerCards } = cards;

  /** Play TTS audio for correct pronunciation reference */
  const handlePlayTTS = useCallback(async (text: string) => {
    try {
      const { audioUrl } = await bridgeCardsService.getTTS(text);
      const audio = new Audio(`${SERVER_URL}${audioUrl}`);
      await audio.play();
    } catch {
      // Fallback: browser-native speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  // Days since registration (1-indexed). Shown as streak on MainMenu.
  const daysSinceRegistration: number = student?.createdAt
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(student.createdAt).getTime()) / 86_400_000,
        ) + 1,
      )
    : 1;

  // SEO
  useEffect(() => {
    document.title = "Bridge Cards - Latihan Percakapan | Zona English";

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Berlatih bahasa inggris secara mandiri dengan AI atau Roleplay bersama partner di Zona English Bridge Cards.",
      );
    } else {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute(
        "content",
        "Berlatih bahasa inggris secara mandiri dengan AI atau Roleplay bersama partner di Zona English Bridge Cards.",
      );
      document.head.appendChild(metaDescription);
    }
  }, []);

  const renderContent = () => {
    switch (state.mode) {
      case "menu":
        return (
          <MainMenu
            streak={daysSinceRegistration}
            todayCount={state.todayCount}
            lastPlayedMode={state.lastPlayedMode}
            onSelectMode={actions.setMode}
          />
        );

      case "warmup":
        return (
          <WarmupMode
            card={warmupCards[state.currentCard]}
            currentCardIndex={state.currentCard}
            totalCards={warmupCards.length}
            isFlipped={state.isFlipped}
            onFlip={actions.handleFlip}
            onExit={actions.startOver}
            onReview={actions.handleReview}
            onMastered={actions.handleMastered}
          />
        );

      case "partner":
        return (
          <AIPartnerMode
            card={partnerCards[state.currentCard]}
            currentCardIndex={state.currentCard}
            totalCards={partnerCards.length}
            userAnswer={state.userAnswer}
            feedback={state.feedback}
            onAnswerChange={actions.setUserAnswer}
            onCheckAnswer={actions.checkAnswer}
            onNext={actions.nextCard}
            onExit={actions.startOver}
            voiceResult={voiceState.voiceResult}
            voiceError={voiceState.voiceError}
            isVoiceLoading={voiceState.isVoiceLoading}
            onVoiceSubmit={(spokenText) =>
              actions.handleVoiceSubmit(
                partnerCards[state.currentCard].id,
                spokenText,
                partnerCards[state.currentCard].expected,
              )
            }
            onPlayTTS={handlePlayTTS}
            onClearVoice={actions.clearVoiceResult}
          />
        );

      case "realPartner":
        return (
          <RealPartnerMode
            card={partnerCards[state.currentCard]}
            currentCardIndex={state.currentCard}
            totalCards={partnerCards.length}
            studentRole={state.studentRole}
            showAnswer={state.showAnswer}
            onRoleSwitch={actions.switchRole}
            onToggleAnswer={() => actions.setShowAnswer(!state.showAnswer)}
            onNext={actions.nextCard}
            onExit={actions.startOver}
          />
        );

      case "complete":
        return (
          <CompletionScreen
            masteredCount={state.masteredCards.length}
            reviewCount={state.reviewCards.length}
            onReset={actions.startOver}
          />
        );

      case "voicePractice":
        return (
          <VoicePracticeMode
            chatHistory={chatState.chatHistory}
            turnCount={chatState.turnCount}
            isChatLoading={chatState.isChatLoading}
            chatError={chatState.chatError}
            isSessionComplete={chatState.isSessionComplete}
            analysisResult={chatState.analysisResult}
            onInitSession={actions.initChatSession}
            onChatSubmit={actions.handleChatSubmit}
            onRetry={() => {
              actions.resetChatSession();
            }}
            onExit={actions.startOver}
            onPlayTTS={handlePlayTTS}
          />
        );

      default:
        return (
          <MainMenu
            streak={daysSinceRegistration}
            todayCount={state.todayCount}
            lastPlayedMode={state.lastPlayedMode}
            onSelectMode={actions.setMode}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <BridgeCardsLogin />;
  }

  return (
    <>
      <div className="bg-white overflow-x-hidden">{renderContent()}</div>
    </>
  );
};

export const BridgeCardsPage: React.FC = () => {
  return (
    <BridgeAuthProvider>
      <BridgeCardsApp />
    </BridgeAuthProvider>
  );
};

export default BridgeCardsPage;
