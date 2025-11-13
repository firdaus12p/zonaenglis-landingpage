import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-emerald-900";
      case "error":
        return "text-red-900";
      case "warning":
        return "text-amber-900";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getBackgroundColor()} ${getTextColor()} animate-slide-in-right`}
    >
      {getIcon()}
      <p className="font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
