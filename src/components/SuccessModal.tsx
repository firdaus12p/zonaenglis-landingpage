import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  title = "Berhasil!",
  message = "Operasi berhasil dilakukan.",
  autoClose = true,
  autoCloseDuration = 3000,
}: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          {/* Success Message */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mb-4">{message}</p>

          {/* Close Button - only show if autoClose is false */}
          {!autoClose && (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
