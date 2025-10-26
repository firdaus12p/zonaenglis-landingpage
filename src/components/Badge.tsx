import React from "react";

/**
 * Badge Component - Universal badge component untuk konsistensi di seluruh aplikasi
 * Menggabungkan semua variants dari PromoCenter dan PromoHub
 */

export interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof BADGE_VARIANTS;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Definisi semua variants badge yang digunakan di aplikasi
export const BADGE_VARIANTS = {
  // Basic variants
  default: "border-slate-200 bg-white text-slate-700",

  // Status variants
  active: "border-blue-200 bg-blue-50 text-blue-700",
  coming: "border-slate-300 bg-slate-100 text-slate-600",

  // Program type variants
  free: "border-emerald-200 bg-emerald-50 text-emerald-700",
  premium: "border-amber-300 bg-amber-50 text-amber-700",
  intensive: "border-purple-200 bg-purple-50 text-purple-700",

  // Age group variants
  kids: "border-blue-200 bg-blue-50 text-blue-700",
  teens: "border-violet-200 bg-violet-50 text-violet-700",

  // Location variants
  location: "border-blue-200 bg-blue-50 text-blue-700",
  online: "border-teal-200 bg-teal-50 text-teal-700",
  offline: "border-indigo-200 bg-indigo-50 text-indigo-700",

  // Partnership variants
  ambassador: "border-purple-300 bg-purple-50 text-purple-700",
  affiliate: "border-emerald-300 bg-emerald-50 text-emerald-700",
  referral: "border-blue-300 bg-blue-50 text-blue-700",
  commission: "border-green-300 bg-green-50 text-green-700",

  // Special program variants
  sprint: "border-emerald-200 bg-emerald-50 text-emerald-700",
  experiential: "border-amber-200 bg-amber-50 text-amber-700",
  academic: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
} as const;

// Size variants untuk badge
const SIZE_VARIANTS = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
} as const;

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  size = "md",
}) => {
  const variantClasses = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  const sizeClasses = SIZE_VARIANTS[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
