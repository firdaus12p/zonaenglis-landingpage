# Component Structure & Patterns

## Main Component: LearnMoreZE.tsx
Single-page component containing all sections:

### Section Structure
1. **Hero Section** - Main value proposition with CTA buttons
2. **About Section** - Why Zona English + features grid + promo card
3. **Programs Section** - Age-based class offerings (Kid, Junior, Teen, Adult)
4. **Testimonials Section** - Customer feedback with 5-star ratings
5. **How to Join Section** - 3-step registration process
6. **Partners Section** - Ecosystem integration showcase
7. **Footer** - Contact info and social media
8. **Floating WhatsApp Button** - Persistent CTA

### Reusable Components
```tsx
// Statistics display
const Stat = ({ value, label }: { value: string; label: string })

// Badge/pill component  
const Pill = ({ children }: { children: React.ReactNode })

// Feature showcase cards
const Feature = ({ icon, title, desc }: { icon: any; title: string; desc: string })

// Program/class cards
const ProgramCard = ({ age, title, bullets }: { age: string; title: string; bullets: string[] })

// Customer testimonial cards
const Testimonial = ({ quote, name, role }: { quote: string; name: string; role: string })
```

## Design System Elements

### Icons from Lucide React
- `CheckCircle2` - Bullet points and confirmations
- `ArrowRight` - Call-to-action buttons
- `Star` - Testimonial ratings
- `MessageCircle` - Chat/contact buttons
- `MapPin` - Location indicators
- `Phone` - Contact information
- `Video`, `BookOpen`, `Users`, `Gift`, `Rocket` - Feature illustrations

### Layout Patterns
- **Section Container**: `mx-auto max-w-6xl px-4 py-12`
- **Grid Layouts**: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`
- **Card Base**: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`
- **CTA Button**: `inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800`

### Responsive Breakpoints
- Mobile: Default (< 768px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

### Animation & Interactivity
- Hover effects on cards and buttons
- Smooth transitions with `transition-colors`
- Backdrop blur effects
- Shadow elevation on hover