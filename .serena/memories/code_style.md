# Code Style & Conventions

## TypeScript Conventions
- **Props Interface**: Use inline object types for simple props
  ```tsx
  const Component = ({ prop1, prop2 }: { prop1: string; prop2: string[] }) => (...)
  ```
- **Component Structure**: Arrow functions for functional components
- **Export**: Default export for main components

## Naming Conventions
- **Components**: PascalCase (e.g., `LearnMoreZE`, `ProgramCard`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CTA_WHATSAPP`, `CTA_REGISTER`)
- **Props**: camelCase (e.g., `value`, `label`, `bullets`)
- **Files**: PascalCase for components, lowercase for config

## Tailwind CSS Patterns
- **Responsive Design**: Mobile-first with `md:` and `lg:` breakpoints
- **Common Grid**: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`
- **Consistent Spacing**: `py-12` for sections, `px-4` for horizontal padding
- **Max Width**: `max-w-6xl mx-auto` for content containers

## Color Scheme
- **Primary**: Blue variants (`blue-700`, `blue-600`, `blue-50`)
- **Accent**: Emerald for WhatsApp CTAs (`emerald-500`, `emerald-600`)
- **Text**: Slate variants (`slate-900`, `slate-600`, `slate-500`)
- **Status**: Yellow for ratings (`yellow-500`)

## Component Design Patterns
- **Cards**: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`
- **CTAs**: Consistent button styling with hover states
- **Icons**: Lucide React icons, consistent sizing (`h-4 w-4`, `h-5 w-5`)
- **Transitions**: `transition-colors` for hover effects

## Code Organization
- **CTA Constants**: Defined at top of component for easy maintenance
- **Component Separation**: Each reusable element as separate const
- **Array Mapping**: Use proper keys and avoid index-only keys where possible
- **Accessibility**: Proper semantic HTML and ARIA attributes