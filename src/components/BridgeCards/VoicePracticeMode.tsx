import React, { useEffect, useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import type { ChatMessage, VoiceAnalysisResult } from "../../types/bridgeCards";
import { VoiceRecorder } from "./VoiceRecorder";

interface VoicePracticeModeProps {
  chatHistory: ChatMessage[];
  turnCount: number;
  isChatLoading: boolean;
  chatError: string | null;
  isSessionComplete: boolean;
  analysisResult: VoiceAnalysisResult | null;
  onInitSession: () => void;
  onChatSubmit: (spokenText: string) => void;
  onRetry: () => void;
  onExit: () => void;
  onPlayTTS: (text: string) => Promise<void>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** A single score bar used in the final analysis report. */
const ScoreBar = ({
  label,
  icon,
  score,
}: {
  label: string;
  icon: string;
  score: number;
}) => {
  const colorClass =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600 truncate">
          {icon} {label}
        </span>
        <span className="text-xs font-bold text-slate-800">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

/** A single chat bubble — AI on the left, user on the right. */
const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAi = message.role === "ai";
  const safeContent = DOMPurify.sanitize(message.content, {
    ALLOWED_TAGS: [],
  });

  return (
    <div
      className={`flex gap-2 ${isAi ? "justify-start" : "justify-end"}`}
    >
      {isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-base">
          🤖
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAi
            ? "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-sm"
            : "bg-slate-700 text-white rounded-tr-sm"
        }`}
      >
        {safeContent}
      </div>
    </div>
  );
};

/** Animated thinking dots shown while Ze AI composes a reply. */
const ThinkingIndicator = () => (
  <div className="flex gap-2 justify-start">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-base">
      🤖
    </div>
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);

/** Final analysis card shown after the session ends. */
const AnalysisReport = ({
  result,
  onRetry,
  onExit,
}: {
  result: VoiceAnalysisResult;
  onRetry: () => void;
  onExit: () => void;
}) => {
  const safeFeedback = DOMPurify.sanitize(result.overallFeedback, {
    ALLOWED_TAGS: [],
  });

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
      {/* Score bars */}
      <div className="flex gap-3">
        <ScoreBar label="Grammar" icon="⚡" score={result.grammarScore} />
        <ScoreBar label="Vocab" icon="📚" score={result.vocabScore} />
        <ScoreBar
          label="Fluency"
          icon="🎤"
          score={result.pronunciationScore}
        />
      </div>

      {/* Corrections */}
      {result.corrections.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
            Koreksi
          </p>
          <ul className="space-y-2">
            {result.corrections.map((correction, idx) => {
              const safeWrong = DOMPurify.sanitize(correction.wrong, {
                ALLOWED_TAGS: [],
              });
              const safeRight = DOMPurify.sanitize(correction.right, {
                ALLOWED_TAGS: [],
              });
              const safeExplanation = DOMPurify.sanitize(
                correction.explanation,
                { ALLOWED_TAGS: [] },
              );
              return (
                <li key={idx} className="text-xs space-y-0.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-red-500">✗</span>
                    <span className="text-red-600 line-through">{safeWrong}</span>
                    <span className="text-slate-400 mx-0.5">→</span>
                    <span className="font-medium text-green-700">{safeRight}</span>
                  </div>
                  <p className="text-slate-500 pl-4">{safeExplanation}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Overall feedback */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-800 leading-relaxed">
        💬 {safeFeedback}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          🔄 Retry
        </button>
        <button
          onClick={onExit}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const VoicePracticeMode: React.FC<VoicePracticeModeProps> = ({
  chatHistory,
  turnCount,
  isChatLoading,
  chatError,
  isSessionComplete,
  analysisResult,
  onInitSession,
  onChatSubmit,
  onRetry,
  onExit,
  onPlayTTS,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Track how many AI messages have already triggered TTS to avoid replaying
  const ttsPlayedCountRef = useRef(0);

  // Kick off the session (Ze AI sends opening greeting) once on mount
  useEffect(() => {
    onInitSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to the latest message whenever chatHistory changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Auto-play TTS for each new AI message (only run for messages not yet spoken)
  useEffect(() => {
    const aiMessages = chatHistory.filter((m) => m.role === "ai");
    const unplayed = aiMessages.slice(ttsPlayedCountRef.current);
    if (unplayed.length === 0) return;

    // Play the latest unplayed AI message
    const latest = unplayed[unplayed.length - 1];
    ttsPlayedCountRef.current = aiMessages.length;
    onPlayTTS(latest.content).catch(() => {
      // TTS failure is non-critical — the text is still visible
    });
  }, [chatHistory, onPlayTTS]);

  // Retry: reset TTS counter then delegate to parent
  const handleRetry = useCallback(() => {
    ttsPlayedCountRef.current = 0;
    onRetry();
  }, [onRetry]);

  const MAX_TURNS = 6;
  const isInputDisabled = isChatLoading || isSessionComplete;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-900">Ze AI</p>
              <p className="text-xs text-indigo-500">
                {isSessionComplete
                  ? "Session complete"
                  : `Turn ${Math.min(turnCount, MAX_TURNS)} / ${MAX_TURNS}`}
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium"
            aria-label="Exit AI Voice Practice"
          >
            ✕ Exit
          </button>
        </div>

        {/* ── Chat area ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[300px] max-h-[420px]">
          {chatHistory.map((msg, idx) => (
            <ChatBubble key={`${msg.role}-${msg.timestamp}-${idx}`} message={msg} />
          ))}

          {isChatLoading && <ThinkingIndicator />}

          {/* Error notice — inline, non-blocking */}
          {chatError && !isChatLoading && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              ⚠️ {chatError} — Try again.
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-100 px-5 py-4">
          {isSessionComplete && analysisResult ? (
            <AnalysisReport
              result={analysisResult}
              onRetry={handleRetry}
              onExit={onExit}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 text-center">
                {isChatLoading
                  ? "Ze AI is thinking…"
                  : "Tap the mic and speak in English"}
              </p>
              <VoiceRecorder
                onTranscript={onChatSubmit}
                disabled={isInputDisabled}
                lang="en-US"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
