import { AlertTriangle, XCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      icon: <XCircle className="h-10 w-10 text-red-600" />,
      bg: "bg-red-100",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: <AlertTriangle className="h-10 w-10 text-amber-600" />,
      bg: "bg-amber-100",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
    },
  };

  const styles = config[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${styles.bg}`}
          >
            {styles.icon}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-600 mb-6">{message}</p>

          {/* Action Buttons */}
          <div className="flex w-full gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${styles.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
