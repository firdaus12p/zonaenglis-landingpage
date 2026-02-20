import React, { useEffect } from "react";
import { useBridgeCards } from "../hooks/useBridgeCards";
import {
  useBridgeAuth,
  BridgeAuthProvider,
} from "../contexts/BridgeAuthContext";
import { BridgeCardsLogin } from "../components/BridgeCards/BridgeCardsLogin";

// Components
import { MainMenu } from "../components/BridgeCards/MainMenu";
import { WarmupMode } from "../components/BridgeCards/WarmupMode";
import { AIPartnerMode } from "../components/BridgeCards/AIPartnerMode";
import { RealPartnerMode } from "../components/BridgeCards/RealPartnerMode";
import { CompletionScreen } from "../components/BridgeCards/CompletionScreen";

const BridgeCardsApp: React.FC = () => {
  // Auth must be resolved first so isAuthenticated is passed to the hook
  const { isAuthenticated, isLoading, student } = useBridgeAuth();
  const { state, actions, cards } = useBridgeCards(isAuthenticated);
  const { warmup: warmupCards, partner: partnerCards } = cards;

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
