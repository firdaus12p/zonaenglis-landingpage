import { useState, useEffect, useRef, useCallback } from "react";

// Use Web Speech API types from src/types/speech-recognition.d.ts
type SpeechRecognitionInstance = InstanceType<typeof window.SpeechRecognition>;

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  lang?: string;
}

/**
 * VoiceRecorder — Independent push-to-talk component
 *
 * Uses Web Speech API for browser-native speech-to-text.
 * This is a "dumb" component: it only handles recording and emits
 * the transcribed text via onTranscript callback.
 * It has NO knowledge of AI analysis, scoring, or game logic.
 */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  disabled = false,
  lang = "en-US",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRecordingRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        setInterimText("");
        onTranscript(finalTranscript.trim());
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      isRecordingRef.current = false;

      const errorType =
        (event as ErrorEvent & { error?: string }).error ?? "unknown";
      if (errorType === "not-allowed") {
        setError(
          "Akses mikrofon diblokir. Izinkan akses mikrofon di pengaturan browser.",
        );
      } else if (errorType === "no-speech") {
        setError("Tidak ada suara terdeteksi. Coba lagi.");
      } else if (errorType !== "aborted") {
        setError("Terjadi kesalahan saat merekam. Coba lagi.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount — prevents memory leaks
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors during cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, [lang, onTranscript]);

  const startRecording = useCallback(() => {
    if (disabled || !recognitionRef.current || isRecordingRef.current) return;

    setError(null);
    setInterimText("");

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch {
      setError("Gagal memulai perekaman. Coba lagi.");
    }
  }, [disabled]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current || !isRecordingRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore stop errors
    }
  }, []);

  // Unsupported browser fallback
  if (!isSupported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-700">
          ⚠️ Browser kamu tidak mendukung fitur perekaman suara.
        </p>
        <p className="mt-1 text-xs text-amber-600">
          Gunakan Chrome atau Edge versi terbaru untuk fitur ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Push-to-Talk Button */}
      <button
        type="button"
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        disabled={disabled}
        aria-label={isRecording ? "Sedang merekam" : "Tahan untuk bicara"}
        className={`
          flex h-20 w-20 items-center justify-center rounded-full
          transition-all duration-200 select-none touch-none
          ${
            disabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : isRecording
                ? "scale-110 bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                : "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:shadow-lg active:scale-95"
          }
        `}
      >
        {isRecording ? (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      {/* Recording Label */}
      <p className="text-sm font-medium text-slate-500">
        {disabled
          ? "Menunggu..."
          : isRecording
            ? "🔴 Sedang merekam... lepaskan untuk berhenti"
            : "Tahan tombol untuk bicara 🎤"}
      </p>

      {/* Interim transcript preview */}
      {interimText && (
        <div className="w-full rounded-lg border border-purple-100 bg-purple-50/50 px-4 py-2 text-center">
          <p className="text-sm italic text-purple-600">{interimText}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="w-full rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
