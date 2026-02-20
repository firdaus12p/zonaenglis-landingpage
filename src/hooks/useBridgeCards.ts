import { useState, useEffect } from "react";
import type {
  CardMode,
  StudentRole,
  BridgeCardState,
  WarmupCard,
  PartnerCard,
  ChatMessage,
  VoiceAnalysisResult,
} from "../types/bridgeCards";
import {
  partnerCards as fallbackPartnerCards,
  warmupCards as fallbackWarmupCards,
} from "../data/bridgeCardsContent";
import { bridgeCardsService } from "../services/bridgeCardsService";

/**
 * isAuthenticated — must be passed from BridgeAuthContext so the hook
 * fetches cards AFTER the student token exists, not on blind mount.
 */

/** Internal state shape for the AI conversation practice feature. */
interface ChatState {
  chatHistory: ChatMessage[];
  turnCount: number;
  isChatLoading: boolean;
  chatError: string | null;
  isSessionComplete: boolean;
  analysisResult: VoiceAnalysisResult | null;
}

const INITIAL_CHAT_STATE: ChatState = {
  chatHistory: [],
  turnCount: 0,
  isChatLoading: false,
  chatError: null,
  isSessionComplete: false,
  analysisResult: null,
};

export function useBridgeCards(isAuthenticated: boolean) {
  const [warmupCards, setWarmupCards] =
    useState<WarmupCard[]>(fallbackWarmupCards);
  const [partnerCards, setPartnerCards] =
    useState<PartnerCard[]>(fallbackPartnerCards);

  // Voice practice state — isolated from card game state
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(
    null,
  );
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Chat practice state — isolated from all other feature state
  const [chatState, setChatState] = useState<ChatState>(INITIAL_CHAT_STATE);

  const [state, setState] = useState<BridgeCardState>(() => {
    const savedLastMode = localStorage.getItem(
      "ze_bridge_last_mode",
    ) as CardMode | null;
    return {
      mode: "menu",
      lastPlayedMode: savedLastMode || "realPartner",
      currentCard: 0,
      isFlipped: false,
      masteredCards: [],
      reviewCards: [],
      userAnswer: "",
      feedback: "",
      streak: 0,
      todayCount: 0,
      studentRole: "A",
      showAnswer: false,
      isLoading: false,
      error: null,
    };
  });

  // Only fetch cards once the student is authenticated — avoids 401 on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    bridgeCardsService
      .getCards()
      .then((res) => {
        if (!isMounted) return;
        if (res.warmup && res.warmup.length > 0) {
          setWarmupCards(
            res.warmup.map((c) => ({
              id: c.id,
              front: c.contentFront,
              back: c.contentBack,
              audio: c.audioAsset || "🔊",
            })),
          );
        }
        if (res.partner && res.partner.length > 0) {
          setPartnerCards(
            res.partner.map((c) => ({
              id: c.id,
              question: c.contentFront,
              expected: c.contentBack,
              keywords: c.keywords || [],
            })),
          );
        }
        setState((prev) => ({ ...prev, isLoading: false }));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("Using fallback static cards due to network error:", err);
        setState((prev) => ({ ...prev, isLoading: false, error: err.message }));
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const setMode = (mode: CardMode) => {
    setState((prev) => {
      let newLastMode = prev.lastPlayedMode;
      if (mode !== "menu" && mode !== "complete") {
        newLastMode = mode;
        localStorage.setItem("ze_bridge_last_mode", mode);
      }
      return { ...prev, mode, lastPlayedMode: newLastMode };
    });
  };
  const setUserAnswer = (userAnswer: string) =>
    setState((prev) => ({ ...prev, userAnswer }));
  const setShowAnswer = (showAnswer: boolean) =>
    setState((prev) => ({ ...prev, showAnswer }));
  const setStudentRole = (studentRole: StudentRole) =>
    setState((prev) => ({ ...prev, studentRole }));

  const handleFlip = () =>
    setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }));

  const nextCard = () => {
    setState((prev) => {
      const isWarmup = prev.mode === "warmup";
      const maxCards = isWarmup ? warmupCards.length : partnerCards.length;

      if (prev.currentCard < maxCards - 1) {
        return {
          ...prev,
          isFlipped: false,
          userAnswer: "",
          feedback: "",
          showAnswer: false,
          currentCard: prev.currentCard + 1,
        };
      }
      return {
        ...prev,
        mode: "complete",
        isFlipped: false,
        userAnswer: "",
        feedback: "",
        showAnswer: false,
      };
    });
  };

  const handleMastered = async () => {
    const cardIdToMaster = warmupCards[state.currentCard]?.id;

    // Store current index so we can revert it if the API fails
    const cardIdxToMaster = state.currentCard;

    setState((prev) => {
      const isAlreadyMastered = prev.masteredCards.includes(prev.currentCard);

      // Submit to backend async if not already mastered
      if (!isAlreadyMastered && cardIdToMaster) {
        bridgeCardsService.submitMasteredCard(cardIdToMaster).catch((err) => {
          console.error("Failed to submit mastered card:", err);
          // Revert optimistic UI
          setState((rollback) => ({
            ...rollback,
            masteredCards: rollback.masteredCards.filter(
              (idx) => idx !== cardIdxToMaster,
            ),
            todayCount: Math.max(0, rollback.todayCount - 1),
          }));
        });
      }

      return {
        ...prev,
        masteredCards: Array.from(
          new Set([...prev.masteredCards, prev.currentCard]),
        ),
        todayCount: isAlreadyMastered ? prev.todayCount : prev.todayCount + 1,
      };
    });
    nextCard();
  };

  const handleReview = () => {
    setState((prev) => ({
      ...prev,
      reviewCards: Array.from(new Set([...prev.reviewCards, prev.currentCard])),
    }));
    nextCard();
  };

  const checkAnswer = () => {
    setState((prev) => {
      const card = partnerCards[prev.currentCard];
      const input = prev.userAnswer.toLowerCase().trim();
      const hasAllKeywords = card.keywords.every((kw) =>
        input.includes(kw.toLowerCase()),
      );

      let feedback = "";
      let newMastered = [...prev.masteredCards];
      let newReview = [...prev.reviewCards];

      if (hasAllKeywords) {
        feedback = "Perfect! ✅ Great job!";
        newMastered = Array.from(new Set([...newMastered, prev.currentCard]));
      } else {
        feedback = `Try including these words: ${card.keywords.join(", ")} 💡`;
        newReview = Array.from(new Set([...newReview, prev.currentCard]));
      }

      return {
        ...prev,
        feedback,
        masteredCards: newMastered,
        reviewCards: newReview,
        todayCount: prev.todayCount + 1,
      };
    });
  };

  const startOver = () => {
    setState((prev) => ({
      ...prev,
      currentCard: 0,
      isFlipped: false,
      userAnswer: "",
      feedback: "",
      showAnswer: false,
      mode: "menu",
    }));
  };

  const switchRole = () => {
    setState((prev) => ({
      ...prev,
      studentRole: prev.studentRole === "A" ? "B" : "A",
      showAnswer: false,
    }));
  };

  // ====== VOICE PRACTICE ACTIONS ======

  const handleVoiceSubmit = async (
    cardId: number,
    spokenText: string,
    targetText: string,
  ) => {
    setIsVoiceLoading(true);
    setVoiceResult(null);
    setVoiceError(null);
    try {
      const result = await bridgeCardsService.analyzeVoice(
        cardId,
        spokenText,
        targetText,
      );
      setVoiceResult(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menganalisis suara";
      setVoiceError(message);
    } finally {
      setIsVoiceLoading(false);
    }
  };

  const clearVoiceResult = () => {
    setVoiceResult(null);
    setVoiceError(null);
  };

  // ====== CHAT PRACTICE ACTIONS ======

  /**
   * Initialize a new chat session: resets state and fetches the opening
   * greeting from Ze AI with an empty history.
   */
  const initChatSession = async () => {
    setChatState({ ...INITIAL_CHAT_STATE, isChatLoading: true });
    try {
      const { message } = await bridgeCardsService.chatRespond([]);
      const aiGreeting: ChatMessage = {
        role: "ai",
        content: message,
        timestamp: Date.now(),
      };
      setChatState((prev) => ({
        ...prev,
        chatHistory: [aiGreeting],
        isChatLoading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memulai sesi percakapan";
      setChatState((prev) => ({
        ...prev,
        isChatLoading: false,
        chatError: errorMessage,
      }));
    }
  };

  /**
   * Submit a user message: updates history, fetches Ze AI reply,
   * and triggers final analysis when the session ends.
   */
  const handleChatSubmit = async (spokenText: string) => {
    if (chatState.isSessionComplete || chatState.isChatLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: spokenText,
      timestamp: Date.now(),
    };
    const historyWithUser = [...chatState.chatHistory, userMessage];
    const newTurnCount = chatState.turnCount + 1;

    setChatState((prev) => ({
      ...prev,
      chatHistory: historyWithUser,
      turnCount: newTurnCount,
      isChatLoading: true,
      chatError: null,
    }));

    try {
      const { message, shouldEnd } =
        await bridgeCardsService.chatRespond(historyWithUser);
      const aiMessage: ChatMessage = {
        role: "ai",
        content: message,
        timestamp: Date.now(),
      };
      const finalHistory = [...historyWithUser, aiMessage];

      if (shouldEnd) {
        const analysisResult =
          await bridgeCardsService.chatAnalyze(finalHistory);
        setChatState((prev) => ({
          ...prev,
          chatHistory: finalHistory,
          isChatLoading: false,
          isSessionComplete: true,
          analysisResult,
        }));
      } else {
        setChatState((prev) => ({
          ...prev,
          chatHistory: finalHistory,
          isChatLoading: false,
        }));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengirim pesan";
      setChatState((prev) => ({
        ...prev,
        isChatLoading: false,
        chatError: errorMessage,
      }));
    }
  };

  /** Reset the chat session so the user can retry from the beginning. */
  const resetChatSession = () => {
    setChatState(INITIAL_CHAT_STATE);
  };

  return {
    state,
    voiceState: {
      voiceResult,
      isVoiceLoading,
      voiceError,
    },
    chatState,
    cards: {
      warmup: warmupCards,
      partner: partnerCards,
    },
    actions: {
      setMode,
      setUserAnswer,
      setShowAnswer,
      setStudentRole,
      handleFlip,
      handleMastered,
      handleReview,
      nextCard,
      checkAnswer,
      startOver,
      switchRole,
      handleVoiceSubmit,
      clearVoiceResult,
      initChatSession,
      handleChatSubmit,
      resetChatSession,
    },
  };
}
