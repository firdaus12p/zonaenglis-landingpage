# Zona English Landing Page - AI Agent Instructions

A fullstack React + TypeScript + Express.js project for an English learning institution. This document provides essential knowledge for AI coding assistants.

## Architecture Overview

**Monorepo Structure**: Frontend (root) + Backend (`/backend`) with shared MySQL database.

### Frontend Stack

- **Build Tool**: Vite 7.x (HMR, fast builds)
- **Framework**: React 19.1 + TypeScript 5.9
- **Styling**: Tailwind CSS 4.x (utility-first, JIT compiler)
- **Icons**: Lucide React (tree-shakeable)
- **Routing**: React Router DOM 7.x (SPA navigation)
- **Dev Server**: http://localhost:5173

### Backend Stack

- **Runtime**: Node.js with ES Modules (`"type": "module"`)
- **Framework**: Express.js 5.x
- **Database**: MySQL (via mysql2 promise pool)
- **API Base**: http://localhost:3001/api
- **Key Routes**: `/ambassadors`, `/promos`, `/programs`, `/validate`, `/affiliate`, `/upload`

**Critical**: Both servers must run simultaneously. Backend handles CORS for localhost:5173.

## Project-Specific Patterns

### 1. API Integration Pattern

**NO centralized API client** - direct fetch calls with hardcoded URLs:

```tsx
// ❌ WRONG - Don't create axios instances
import axios from "axios";

// ✅ CORRECT - Use direct fetch with inline URLs
const API_BASE = "http://localhost:3001/api";
const response = await fetch(`${API_BASE}/promos/admin/all`);
```

**Why**: Simplicity over abstraction. Pattern established in `PromoHub.tsx`, `Ambassadors.tsx`, `PromoCodes.tsx`.

### 2. Component Architecture

**Inline TypeScript props** - no separate interface files:

```tsx
// ✅ Standard pattern
const PromoCard = ({
  code,
  discount,
  validUntil,
}: {
  code: string;
  discount: number;
  validUntil: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    {/* Content */}
  </div>
);
```

**Admin pages** follow this structure:

1. State management with `useState` (loading, data, errors)
2. Data fetching in `useEffect` on mount
3. CRUD handlers (handleCreate, handleUpdate, handleDelete)
4. Conditional rendering (loading → error → data)

See `src/pages/admin/Ambassadors.tsx` for reference implementation.

### 3. Styling Conventions

**Design tokens** (never deviate):

- Primary: `blue-700`, `blue-600`, `blue-50`
- Accent/CTA: `emerald-500`, `emerald-600`
- Text: `slate-900`, `slate-600`, `slate-500`
- Status: `yellow-500` (stars), `green-500` (success), `red-500` (error)

**Responsive grid pattern**:

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
```

**Card pattern** (used everywhere):

```tsx
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
```

**Custom animation** (defined in `tailwind.config.js`):

```tsx
<div className="animate-slide-in-right">
```

### 4. Business Logic Quirks

**Ambassador Promo System**:

- Codes validated via `/api/validate/code` POST
- Usage tracked via `/api/affiliate` POST (localStorage-based tracking)
- Each ambassador has unique code stored in DB

**Soft Delete Pattern**:

- Backend auto-purges records deleted >3 days ago
- See `backend/server.js` for purge logic
- Affects `affiliate_usage` table

**MySQL Configuration**:

- **Port 3307** (non-standard, likely XAMPP on Windows)
- Database: `zona_english_admin`
- Connection pool in `backend/db/connection.js`

## Development Workflow

### Running the Project

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev  # Uses --watch flag for auto-reload
```

### Making Changes

1. **API endpoints**: Edit `backend/routes/*.js` → changes auto-reload
2. **UI components**: Edit `src/**/*.tsx` → HMR updates instantly
3. **Styling**: Use Tailwind classes → JIT compiles on demand
4. **New pages**: Add to `src/pages/admin/*.tsx` + update routes in `App.tsx`

### Database Changes

**Environment file** (`backend/.env`):

```env
DB_HOST=127.0.0.1
DB_PORT=3307          # ⚠️ Non-standard port
DB_USER=root
DB_PASS=
DB_NAME=zona_english_admin
```

**No ORM** - raw SQL queries via `mysql2`:

```js
const [rows] = await db.query(
  "SELECT * FROM ambassadors WHERE deleted_at IS NULL"
);
```

## Common Pitfalls

1. **Mixed API base URLs**: Some files use `API_BASE` variable, others hardcode `http://localhost:3001/api`. Be consistent within each file.

2. **Forgotten await**: Backend uses `async/await` with mysql2 promises. Forgetting `await` causes cryptic errors.

3. **CORS issues**: If frontend can't reach backend, check `CORS_ORIGIN` in `.env` matches Vite dev server.

4. **TypeScript strict mode**: Enabled globally. Explicitly type props, avoid `any`.

5. **Missing Tailwind classes**: If styles don't apply, check `content` glob in `tailwind.config.js` includes file.

## Documentation Priority

When implementing features, reference in this order:

1. **docs/API-INTEGRATION-GUIDE.md** - API endpoints, request/response formats
2. **docs/PROJECT-STRUCTURE.md** - Folder organization, where to put files
3. **Existing implementations** - Search codebase for similar features
4. **.serena/memories/** - AI-readable project context (if Serena MCP active)

## Anti-Patterns to Avoid

❌ Creating utility folders (`/utils`, `/lib`) - keep code colocated
❌ Abstracting fetch calls - prefer explicit inline fetches
❌ Barrel exports everywhere - use named exports from origin
❌ CSS files - use Tailwind classes exclusively (except `index.css` for globals)
❌ Third-party state management - React hooks are sufficient

## Key Files to Read

Before modifying specific areas, read these:

- **Admin features**: `src/pages/admin/Ambassadors.tsx` (canonical CRUD example)
- **API integration**: `src/PromoHub.tsx` (fetch patterns, error handling)
- **Component patterns**: `src/components/Card.tsx`, `Button.tsx` (reusable UI)
- **Backend routes**: `backend/routes/ambassadors.js` (SQL queries, error handling)
- **Database schema**: Check table structure via queries in route files

---

**Context for AI**: This project evolved from a simple landing page to a fullstack admin system. Code prioritizes pragmatism over patterns—what works ships. When in doubt, match existing code style rather than introducing "best practices".
