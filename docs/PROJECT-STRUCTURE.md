# Zona English Landing Page - Project Structure

## 📁 Folder Organization

```
zonaenglis-landingpage/
├── 📂 backend/                 # Express.js Backend API
│   ├── 📂 db/                  # Database connection config
│   │   └── connection.js       # MySQL connection pool
│   ├── 📂 routes/              # API route handlers
│   │   ├── ambassadors.js      # Ambassador CRUD endpoints
│   │   ├── promos.js           # Promo code endpoints
│   │   └── validate.js         # Validation endpoints
│   ├── .env                    # Environment variables (gitignored)
│   ├── .env.example            # Environment template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Express server entry point
│
├── 📂 docs/                    # 📄 Project Documentation
│   ├── API-INTEGRATION-GUIDE.md    # API integration guide
│   ├── aturan.md                   # Project rules & conventions
│   ├── code.md                     # React component code
│   ├── PROJECT-STRUCTURE.md        # This file
│   ├── promo-center.md             # Promo Center documentation
│   ├── promo-hub-ambassador.md     # Ambassador feature docs
│   └── prompt.md                   # Project setup instructions
│
├── 📂 src/                     # Frontend React/TypeScript Code
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 admin/           # Admin-specific components
│   │   ├── 📂 debug/           # Debug tools
│   │   ├── 📂 layout/          # Layout components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── 📂 pages/               # Page-level components
│   │   └── 📂 admin/           # Admin dashboard pages
│   │       ├── AmbassadorForm.tsx
│   │       ├── Ambassadors.tsx
│   │       ├── Articles.tsx
│   │       ├── CountdownBatch.tsx
│   │       ├── Dashboard.tsx
│   │       └── PromoCodes.tsx
│   ├── 📂 constants/           # App constants & CTAs
│   │   └── cta.ts              # Call-to-action links
│   ├── 📂 assets/              # Static assets (images, SVGs)
│   ├── App.tsx                 # Main App component
│   ├── LearnMoreZE.tsx         # Main landing page
│   ├── Navbar.tsx              # Navigation bar
│   ├── PromoCenter.tsx         # Promo Center page
│   ├── PromoHub.tsx            # Ambassador Hub page
│   └── main.tsx                # React entry point
│
├── 📂 public/                  # Static public assets
│   └── vite.svg                # Vite logo
│
├── 📂 .serena/                 # Serena MCP Context Files
│   ├── 📂 memories/            # Project knowledge base
│   │   ├── admin_dashboard_structure.md
│   │   ├── code_style.md
│   │   ├── component_structure.md
│   │   ├── deployment_production.md
│   │   ├── project_overview.md
│   │   ├── suggested_commands.md
│   │   ├── task_completion.md
│   │   └── tech_stack.md
│   └── project.yml             # Serena project config
│
├── 📂 .github/                 # GitHub configuration
│   └── copilot-instructions.md # GitHub Copilot rules
│
├── 📂 .vscode/                 # VSCode workspace settings
│   └── mcp.json                # MCP server configuration
│
├── 📂 .playwright-mcp/         # Playwright test screenshots
│
├── .gitignore                  # Git ignore patterns
├── package.json                # Frontend dependencies (React, Vite, Tailwind)
├── README.md                   # Main project README
├── setup-mcp.ps1               # MCP server setup script
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── postcss.config.js           # PostCSS configuration
```

## 🎯 Key Directories Explained

### Backend (`/backend`)

Express.js REST API server for data persistence:

- **MySQL Database**: Connects to `zona_english_admin` database
- **Port**: Runs on `http://localhost:3001`
- **Endpoints**: `/api/ambassadors`, `/api/promos`, `/api/validate`
- **CORS**: Configured for React dev server on port 5173

### Frontend (`/src`)

React + TypeScript + Tailwind CSS application:

- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS utility-first framework
- **State**: React hooks and context
- **Routing**: Single-page application structure

### Documentation (`/docs`)

All project documentation and markdown files:

- API integration guides
- Component code references
- Setup instructions
- Feature documentation

### Serena MCP (`/.serena`)

AI-readable project context for Serena MCP:

- **Memories**: Structured knowledge about project architecture, tech stack, and patterns
- **Auto-updated**: Serena maintains these files based on project changes

## 🔧 Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite 7.x (build tool)
- Tailwind CSS 4.x
- Lucide React (icons)

**Backend:**

- Express.js 5.x
- MySQL2 (with promises)
- CORS middleware
- dotenv for configuration

**Development:**

- ESLint + TypeScript ESLint
- Hot Module Replacement (HMR)
- Node.js ES Modules

## 📝 Notes for AI Agents

1. **Backend is separate** from frontend - different `package.json` files
2. **Environment variables** are in `backend/.env` (use `.env.example` as template)
3. **API base URL** for development is `http://localhost:3001/api`
4. **All documentation** is now in `/docs` folder
5. **Serena memories** contain project-specific knowledge for AI context
6. **TypeScript strict mode** enabled for both frontend and backend
