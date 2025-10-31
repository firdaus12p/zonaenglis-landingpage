/**
 * Card Component - Universal card component untuk layout konsisten
 * Menggabungkan semua patterns card yang digunakan berulang di aplikasi
 */

export interface CardProps {
  children: React.ReactNode;
  variant?: keyof typeof CARD_VARIANTS;
  padding?: keyof typeof PADDING_VARIANTS;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Definisi variants card
export const CARD_VARIANTS = {
  default: "border-slate-200 bg-white shadow-sm",
  elevated: "border-slate-200 bg-white shadow-md",
  flat: "border-slate-200 bg-white shadow-none",

  // Colored variants
  "blue-subtle": "border-blue-100 bg-blue-50/50 shadow-sm",
  "purple-subtle": "border-purple-100 bg-purple-50/50 shadow-sm",
  "amber-subtle": "border-amber-100 bg-amber-50/50 shadow-sm",
  "emerald-subtle": "border-emerald-100 bg-emerald-50/50 shadow-sm",

  // Gradient variants
  "gradient-blue":
    "border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm",
  "gradient-purple":
    "border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm",
  "gradient-amber":
    "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm",
} as const;

// Padding variants
export const PADDING_VARIANTS = {
  none: "p-0",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6",
  "2xl": "p-8",
} as const;

// Hover effects
export const HOVER_EFFECTS = {
  none: "",
  shadow: "hover:shadow-md",
  scale: "hover:scale-[1.02]",
  "scale-shadow": "hover:scale-[1.02] hover:shadow-md",
  lift: "hover:-translate-y-1 hover:shadow-lg",
} as const;

export const Card = ({
  children,
  variant = "default",
  padding = "lg",
  className = "",
  hover = false,
  clickable = false,
  onClick,
}: CardProps) => {
  const baseClasses = "rounded-2xl border transition-all duration-200";
  const variantClasses = CARD_VARIANTS[variant] || CARD_VARIANTS.default;
  const paddingClasses = PADDING_VARIANTS[padding];

  // Hover effects
  let hoverClasses = "";
  if (hover) {
    hoverClasses = clickable
      ? HOVER_EFFECTS["scale-shadow"]
      : HOVER_EFFECTS.shadow;
  } else if (clickable) {
    hoverClasses = HOVER_EFFECTS.scale;
  }

  // Clickable styles
  const interactiveClasses = clickable
    ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "";

  const combinedClasses = `${baseClasses} ${variantClasses} ${paddingClasses} ${hoverClasses} ${interactiveClasses} ${className}`;

  const CardComponent = clickable ? "button" : "div";

  return (
    <CardComponent
      className={combinedClasses}
      onClick={clickable ? onClick : undefined}
      type={clickable ? "button" : undefined}
    >
      {children}
    </CardComponent>
  );
};

// Specialized card components untuk use cases umum

// Feature Card untuk section About
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}) => (
  <Card variant="default" padding="lg" hover className={`group ${className}`}>
    <div className="mb-3 flex items-center gap-3">
      <div className="rounded-xl bg-blue-600/10 p-2">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
    </div>
    <p className="text-sm leading-relaxed text-slate-600">{description}</p>
  </Card>
);

// Program Card untuk menampilkan program/class
export const ProgramCard = ({
  children,
  className = "",
  fullHeight = true,
}: {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}) => (
  <Card
    variant="default"
    padding="lg"
    hover
    className={`${
      fullHeight ? "flex h-full flex-col justify-between" : ""
    } ${className}`}
  >
    {children}
  </Card>
);

// Testimonial Card
export const TestimonialCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card variant="default" padding="lg" className={className}>
    {children}
  </Card>
);

// Stats Card untuk menampilkan statistik
export const StatsCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card variant="default" padding="md" className={`text-center ${className}`}>
    {children}
  </Card>
);

// Step Card untuk how-to sections
export const StepCard = ({
  step,
  title,
  description,
  className = "",
}: {
  step: string;
  title: string;
  description: string;
  className?: string;
}) => (
  <Card variant="default" padding="xl" className={className}>
    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
      {step}
    </div>
    <h3 className="mb-2 text-lg font-bold">{title}</h3>
    <p className="text-sm text-slate-600">{description}</p>
  </Card>
);

export default Card;
