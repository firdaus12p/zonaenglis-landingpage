# Tech Stack & Architecture

## Frontend Stack
- **React 19.1.1** - Latest React with modern hooks and features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.1.7** - Fast build tool and dev server
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Lucide React 0.546.0** - Consistent icon library

## Development Tools
- **ESLint 9.36.0** - Code linting and quality
- **PostCSS 8.5.6** + **Autoprefixer 10.4.21** - CSS processing
- **TypeScript ESLint 8.45.0** - TypeScript-specific linting

## Architecture Pattern
- **Single-Page Component**: All content in one `LearnMoreZE.tsx` component
- **Component-Based Design**: Small, reusable components (Stat, Pill, Feature, ProgramCard, Testimonial)
- **Documentation-Driven Development**: Code documented in `code.md`, setup in `prompt.md`

## File Structure
```
src/
├── LearnMoreZE.tsx    # Main landing page component
├── App.tsx            # App wrapper (imports LearnMoreZE)
├── main.tsx           # React entry point
├── index.css          # Tailwind directives
└── assets/            # Static assets
```

## Build Configuration
- **Module Type**: ES modules
- **Target**: Modern browsers
- **CSS Processing**: Tailwind → PostCSS → Autoprefixer
- **TypeScript**: Strict configuration with type checking