# Zona English Landing Page - Project Structure

## Overall Organization

This project follows a **monorepo-lite** structure with separate frontend and backend in the same repository:

```
zonaenglis-landingpage/
├── backend/          # Express.js API (Node.js ES Modules)
├── src/              # React frontend (TypeScript)
├── docs/             # All documentation
├── public/           # Static assets
└── .serena/          # Serena MCP context
```

## Backend Structure (`/backend`)

**Purpose**: REST API server for data persistence and business logic

**Technology**: Express.js 5.x + MySQL2 + ES Modules

**Key Files**:
- `server.js` - Main Express server entry point
- `db/connection.js` - MySQL connection pool configuration
- `routes/ambassadors.js` - Ambassador CRUD endpoints
- `routes/promos.js` - Promo code management endpoints
- `routes/validate.js` - Validation logic endpoints
- `.env` - Environment configuration (gitignored)
- `.env.example` - Environment template for new developers
- `package.json` - Backend-specific dependencies

**Running**:
```bash
cd backend
npm start          # Production
npm run dev        # Development with --watch
```

**API Base URL**: `http://localhost:3001/api`

## Frontend Structure (`/src`)

**Purpose**: User-facing React single-page application

**Technology**: React 18 + TypeScript + Vite + Tailwind CSS

**Key Directories**:
- `components/` - Reusable UI components (Button, Card, Badge, etc.)
- `pages/` - Page-level components (admin dashboard pages)
- `constants/` - App-wide constants (CTA links, etc.)
- `assets/` - Images, SVGs, static files

**Key Files**:
- `main.tsx` - React entry point
- `App.tsx` - Main app wrapper
- `LearnMoreZE.tsx` - Main landing page component
- `PromoHub.tsx` - Ambassador promo hub page (uses backend API)
- `PromoCenter.tsx` - Promo center page
- `Navbar.tsx` - Navigation component

**Running**:
```bash
npm run dev        # Development server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
```

## Documentation Structure (`/docs`)

**Purpose**: Central location for all project documentation

**Files**:
- `PROJECT-STRUCTURE.md` - This file (project organization)
- `API-INTEGRATION-GUIDE.md` - API endpoints and integration guide
- `code.md` - React component code reference
- `prompt.md` - Project setup and initialization instructions
- `promo-center.md` - Promo Center feature documentation
- `promo-hub-ambassador.md` - Ambassador Hub feature documentation
- `aturan.md` - Project rules and conventions

**Purpose**: All `.md` files except `README.md` are in `/docs` for clean root directory

## Serena MCP Structure (`/.serena`)

**Purpose**: AI-readable project context and knowledge base

**Directories**:
- `memories/` - Structured knowledge files for AI agents
  - `admin_dashboard_structure.md` - Admin UI patterns
  - `code_style.md` - Code style guidelines
  - `component_structure.md` - Component organization
  - `deployment_production.md` - Deployment process
  - `project_overview.md` - High-level project summary
  - `project_structure.md` - This file
  - `suggested_commands.md` - Common CLI commands
  - `task_completion.md` - Completed features
  - `tech_stack.md` - Technology choices

**Configuration**:
- `project.yml` - Serena project configuration

## Configuration Files (Root)

- `.gitignore` - Git ignore patterns (includes `.env`, `node_modules`)
- `package.json` - Frontend dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode)
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS configuration
- `setup-mcp.ps1` - PowerShell script for MCP server setup

## Database Integration

**Database**: MySQL (via XAMPP on port 3307)
**Database Name**: `zona_english_admin`

**Tables**:
- `ambassadors` - Ambassador profiles and codes
- `promo_codes` - Promo code data

**Connection**: Managed by `backend/db/connection.js` with connection pooling

## Development Workflow

1. **Frontend Development**:
   - Work in `/src` directory
   - Run `npm run dev` from root
   - Hot reload on file changes

2. **Backend Development**:
   - Work in `/backend` directory
   - Run `npm run dev` from backend folder
   - Server restarts on file changes (--watch mode)

3. **API Integration**:
   - Frontend makes requests to `http://localhost:3001/api`
   - CORS configured to allow `http://localhost:5173`
   - See `/docs/API-INTEGRATION-GUIDE.md` for endpoints

## Key Patterns

1. **Separation of Concerns**: Frontend and backend are separate but in same repo
2. **Environment Variables**: Backend uses `.env`, frontend uses Vite env vars
3. **ES Modules**: Both frontend and backend use ES6 import/export
4. **Type Safety**: TypeScript for frontend, JSDoc comments for backend
5. **Documentation**: All docs centralized in `/docs` folder

## Navigation Tips for AI

- **Finding components**: Look in `/src/components` and `/src/pages`
- **Finding API routes**: Look in `/backend/routes`
- **Finding documentation**: Look in `/docs`
- **Finding config**: Root directory has all config files
- **Finding Serena context**: Look in `/.serena/memories`

## File Naming Conventions

- **React Components**: PascalCase (e.g., `PromoHub.tsx`)
- **Utilities/Helpers**: camelCase (e.g., `cta.ts`)
- **Documentation**: kebab-case (e.g., `project-structure.md`)
- **Config Files**: As per tool conventions (e.g., `vite.config.ts`)
