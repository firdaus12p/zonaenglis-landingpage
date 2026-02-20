import React, { useState, useCallback } from "react";
import DOMPurify from "dompurify";
import type { PartnerCard, VoiceAnalysisResult } from "../../types/bridgeCards";
import { BridgeProgressBar } from "./shared/BridgeProgressBar";
import { VoiceRecorder } from "./VoiceRecorder";

type InputMode = "type" | "voice";

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
  // Voice mode props — optional for backward compatibility
  voiceResult?: VoiceAnalysisResult | null;
  voiceError?: string | null;
  isVoiceLoading?: boolean;
  onVoiceSubmit?: (spokenText: string) => void;
  onPlayTTS?: (text: string) => void;
  onClearVoice?: () => void;
}

/** Score indicator bar with label and percentage */
const ScoreBar = ({
  label,
  icon,
  score,
}: {
  label: string;
  icon: string;
  score: number;
}) => {
  const color =
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
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

/** Voice analysis results — scores, corrections, feedback */
const VoiceResultView = ({
  result,
  onPlayTTS,
}: {
  result: VoiceAnalysisResult;
  onPlayTTS?: (text: string) => void;
}) => (
  <div className="mt-5 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
    {/* Score bars */}
    <div className="flex gap-3">
      <ScoreBar label="Grammar" icon="⚡" score={result.grammarScore} />
      <ScoreBar label="Vocab" icon="📚" score={result.vocabScore} />
      <ScoreBar
        label="Pronunciation"
        icon="🎤"
        score={result.pronunciationScore}
      />
    </div>

    {/* Corrections */}
    {result.corrections.length > 0 && (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-bold text-slate-700">Koreksi:</p>
        <ul className="space-y-3">
          {result.corrections.map((correction, idx) => (
            <li key={idx} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-red-500">✗</span>
                <span className="text-red-600 line-through">
                  {DOMPurify.sanitize(correction.wrong, { ALLOWED_TAGS: [] })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="mt-0.5 text-green-500">✓</span>
                <span className="font-medium text-green-700">
                  {DOMPurify.sanitize(correction.right, { ALLOWED_TAGS: [] })}
                </span>
                {onPlayTTS && (
                  <button
                    type="button"
                    onClick={() => onPlayTTS(correction.right)}
                    className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                    aria-label={`Dengarkan: ${correction.right}`}
                  >
                    🔊
                  </button>
                )}
              </div>
              {correction.explanation && (
                <p className="mt-1 pl-5 text-xs text-slate-500">
                  💡{" "}
                  {DOMPurify.sanitize(correction.explanation, {
                    ALLOWED_TAGS: [],
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Overall feedback */}
    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
      <p className="text-sm font-medium text-purple-700">
        {DOMPurify.sanitize(result.overallFeedback, { ALLOWED_TAGS: [] })}
      </p>
    </div>
  </div>
);

export const AIPartnerMode: React.FC<AIPartnerModeProps> = ({
  card,
  currentCardIndex,
  totalCards,
  userAnswer,
  feedback,
  onAnswerChange,
  onCheckAnswer,
  onNext,
  onExit,
  voiceResult = null,
  voiceError = null,
  isVoiceLoading = false,
  onVoiceSubmit,
  onPlayTTS,
  onClearVoice,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>("type");
  const [spokenText, setSpokenText] = useState("");

  const voiceEnabled = Boolean(onVoiceSubmit);
  const hasVoiceResult = voiceResult !== null;
  const hasTypeFeedback = feedback.length > 0;
  // Voice mode: block Next until AI analysis is complete (or not triggered)
  const voiceAnalysisPending = hasTypeFeedback && isVoiceLoading;

  const handleTranscript = useCallback((text: string) => {
    setSpokenText(text);
  }, []);

  const handleVoiceCheck = useCallback(() => {
    if (!spokenText.trim()) return;
    // Set spoken text as userAnswer so checkAnswer reads it correctly (functional setState queue)
    onAnswerChange(spokenText);
    onCheckAnswer();
    onVoiceSubmit?.(spokenText);
  }, [spokenText, onAnswerChange, onCheckAnswer, onVoiceSubmit]);

  const handleModeSwitch = (mode: InputMode) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    setSpokenText("");
    onClearVoice?.();
  };

  const handleNext = () => {
    setSpokenText("");
    onClearVoice?.();
    onNext();
  };

  const handlePlayTTS = useCallback(
    (text: string) => {
      if (onPlayTTS) {
        onPlayTTS(text);
        return;
      }
      // Fallback: use browser speechSynthesis if TTS proxy is unavailable
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    },
    [onPlayTTS],
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8">
      <div className="mx-auto w-full max-w-md">
        <BridgeProgressBar
          current={currentCardIndex}
          total={totalCards}
          colorClass="bg-purple-600"
          onExit={onExit}
          labelPrefix="Question"
        />

        <div className="mb-6 rounded-2xl border border-purple-50 bg-white p-6 shadow-xl shadow-purple-900/5 md:p-8">
          {/* Question */}
          <div className="mb-4 text-sm font-bold uppercase tracking-widest text-purple-600">
            QUESTION:
          </div>
          <div className="mb-8 text-2xl font-bold leading-tight text-slate-800">
            {card.question}
          </div>

          {/* Expected answer hint */}
          <div className="mb-6 rounded-xl border border-purple-100/50 bg-purple-50/80 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-700">
              <span className="text-lg">💡</span> Answer like this:
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-purple-900">
                {card.expected}
              </div>
              <button
                type="button"
                onClick={() => handlePlayTTS(card.expected)}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                aria-label="Dengarkan contoh jawaban"
              >
                🔊
              </button>
            </div>
          </div>

          {/* Mode toggle — only if voice is enabled */}
          {voiceEnabled && (
            <div className="mb-5 flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleModeSwitch("type")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  inputMode === "type"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ✏️ Ketik
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("voice")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  inputMode === "voice"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🎤 Suara
              </button>
            </div>
          )}

          {/* Type Mode Input */}
          {inputMode === "type" && (
            <>
              <textarea
                value={userAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-lg outline-none transition-all focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50"
                rows={3}
                disabled={hasTypeFeedback}
              />

              {hasTypeFeedback && (
                <div
                  className={`mt-5 rounded-xl border p-5 font-medium animate-in slide-in-from-top-2 fade-in duration-300 ${
                    feedback.includes("Perfect")
                      ? "border-green-100 bg-green-50 text-green-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {feedback}
                </div>
              )}
            </>
          )}

          {/* Voice Mode Input */}
          {inputMode === "voice" && (
            <div className="py-4">
              <VoiceRecorder
                onTranscript={handleTranscript}
                disabled={isVoiceLoading || hasVoiceResult || hasTypeFeedback}
              />

              {/* Show what the student said */}
              {spokenText && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    Yang kamu ucapkan:
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {DOMPurify.sanitize(spokenText, { ALLOWED_TAGS: [] })}
                  </p>
                </div>
              )}

              {/* Keyword feedback — same logic as type mode */}
              {hasTypeFeedback && (
                <div
                  className={`mt-4 rounded-xl border p-5 font-medium animate-in slide-in-from-top-2 fade-in duration-300 ${
                    feedback.includes("Perfect")
                      ? "border-green-100 bg-green-50 text-green-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {feedback}
                </div>
              )}

              {/* Loading state */}
              {isVoiceLoading && (
                <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-purple-100 bg-purple-50 p-5">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
                  <p className="text-sm font-medium text-purple-600">
                    AI sedang menganalisis... Mohon tunggu
                  </p>
                </div>
              )}

              {/* AI analysis error */}
              {voiceError && !isVoiceLoading && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">
                    ⚠️ Analisis AI gagal: {voiceError}
                  </p>
                </div>
              )}

              {/* Voice result — skor grammar, vocab, pronunciation + koreksi */}
              {hasVoiceResult && (
                <VoiceResultView
                  result={voiceResult}
                  onPlayTTS={handlePlayTTS}
                />
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          {inputMode === "type" ? (
            // Type mode buttons
            !hasTypeFeedback ? (
              <button
                onClick={onCheckAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1 rounded-xl bg-purple-600 py-4 px-6 font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 rounded-xl bg-purple-600 py-4 px-6 font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg focus:ring-4 focus:ring-purple-100 active:scale-[0.98]"
              >
                Next Question →
              </button>
            )
          ) : // Voice mode buttons
          hasTypeFeedback ? (
            <button
              onClick={handleNext}
              disabled={voiceAnalysisPending}
              className="flex-1 rounded-xl bg-purple-600 py-4 px-6 font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg focus:ring-4 focus:ring-purple-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {voiceAnalysisPending
                ? "Menunggu analisis AI..."
                : "Next Question →"}
            </button>
          ) : (
            <button
              onClick={handleVoiceCheck}
              disabled={!spokenText.trim() || isVoiceLoading}
              className="flex-1 rounded-xl bg-purple-600 py-4 px-6 font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Check Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
