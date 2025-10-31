/**
 * Button Component - Universal button component untuk konsistensi di seluruh aplikasi
 * Menggabungkan semua patterns button yang digunakan berulang
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof SIZE_VARIANTS;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

// Definisi semua variants button yang digunakan di aplikasi
export const BUTTON_VARIANTS = {
  // Primary variants
  primary: "bg-blue-700 hover:bg-blue-800 text-white border-transparent",
  secondary: "bg-white hover:bg-blue-50 text-blue-700 border-blue-300",

  // Action variants
  success: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
  warning: "bg-amber-500 hover:bg-amber-600 text-white border-transparent",
  danger: "bg-red-500 hover:bg-red-600 text-white border-transparent",

  // Special variants
  whatsapp: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
  purple: "bg-purple-700 hover:bg-purple-800 text-white border-transparent",

  // Outline variants
  "outline-primary": "bg-white hover:bg-blue-50 text-blue-700 border-blue-300",
  "outline-secondary":
    "bg-white hover:bg-slate-50 text-slate-700 border-slate-300",
  "outline-success":
    "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300",

  // Ghost variants
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent",
  "ghost-blue":
    "bg-transparent hover:bg-blue-50 text-blue-700 border-transparent",

  // Link variants
  link: "bg-transparent hover:underline text-blue-700 border-transparent p-0",
} as const;

// Size variants untuk button
export const SIZE_VARIANTS = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
  xl: "px-6 py-4 text-base",
} as const;

// Shape variants
export const SHAPE_VARIANTS = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-lg",
} as const;

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const sizeClasses = SIZE_VARIANTS[size];
  const shapeClasses = SHAPE_VARIANTS.rectangle; // Default shape
  const widthClasses = fullWidth ? "w-full" : "";
  const borderClasses = variant.includes("outline") ? "border" : "";

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${shapeClasses} ${widthClasses} ${borderClasses} ${className}`;

  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && icon}
      <span>{children}</span>
      {icon && iconPosition === "right" && !loading && icon}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

// Floating Button untuk WhatsApp (sering digunakan)
export const FloatingButton = ({ className = "", ...props }: ButtonProps) => {
  return (
    <Button
      className={`fixed bottom-5 left-5 shadow-lg z-30 ${SHAPE_VARIANTS.pill} ${className}`}
      variant="whatsapp"
      size="lg"
      {...props}
    />
  );
};

export default Button;
