# Zona English Landing Page

**Modern, responsive landing page** untuk Zona English - institusi pembelajaran bahasa Inggris di Indonesia.

## 🚀 Quick Start

### For Production Deployment

**If you're deploying to https://promo.zonaenglish.id**:

1. **Deploy Backend**: Follow [QUICK-DEPLOY-BACKEND.md](QUICK-DEPLOY-BACKEND.md) (25 mins)
2. **Upload Frontend**: Build and upload `dist/` folder to cPanel
3. **Troubleshooting**: See [TROUBLESHOOTING-LOGIN-FAILED.md](TROUBLESHOOTING-LOGIN-FAILED.md)

---

### For Local Development

#### Prerequisites

- Node.js 18+ installed
- MySQL database (XAMPP recommended)
- Git

#### Installation

1. **Clone repository**:

```bash
git clone <repository-url>
cd zonaenglis-landingpage
```

2. **Install frontend dependencies**:

```bash
npm install
```

3. **Setup backend**:

```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
```

4. **Import database**:

   - Buka XAMPP, start MySQL (port 3307)
   - Import file SQL ke database `zona_english_admin`
   - Lihat `/docs/API-INTEGRATION-GUIDE.md` untuk detail

5. **Run development servers**:

**Terminal 1 - Backend API**:

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:

```bash
npm run dev
```

**Access**:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

## � Project Structure

```
zonaenglis-landingpage/
├── backend/          # Express.js REST API
├── src/              # React frontend
├── docs/             # All documentation
├── public/           # Static assets
└── .serena/          # AI context files
```

Lihat [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) untuk detail lengkap.

## 🛠️ Tech Stack

**Frontend**:

- React 18 + TypeScript
- Vite 7.x
- Tailwind CSS 4.x
- Lucide React (icons)

**Backend**:

- Express.js 5.x
- MySQL2
- CORS + dotenv

**Development Tools**:

- ESLint + TypeScript ESLint
- Serena MCP (AI code assistant)
- Hot Module Replacement

## 📚 Documentation

All documentation is in the `/docs` folder:

- [Project Structure](docs/PROJECT-STRUCTURE.md) - Folder organization
- [API Integration Guide](docs/API-INTEGRATION-GUIDE.md) - API endpoints
- [Setup Instructions](docs/prompt.md) - Detailed setup guide
- [Code Reference](docs/code.md) - Component code examples

## 🎯 Key Features

- **Landing Page**: Modern single-page design with multiple sections
- **Promo Hub**: Ambassador promo code validation system
- **Promo Center**: Promo code management
- **Admin Dashboard**: Admin interface for content management
- **API Integration**: Full REST API for data persistence

## 🔧 Available Scripts

**Frontend** (from root):

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

**Backend** (from `/backend`):

```bash
npm start         # Start server (production)
npm run dev       # Start server with --watch
```

## 🌐 Environment Variables

**Backend** (`backend/.env`):

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASS=
DB_NAME=zona_english_admin
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Copy `backend/.env.example` to `backend/.env` and configure.

## 🤝 Contributing

1. Read project conventions in `docs/aturan.md`
2. Follow code style in `docs/code.md`
3. Test both frontend and backend before committing
4. Update documentation if needed

## � License

MIT

## 👨‍💻 Author

**Zona English Team**

## 🔗 Related Projects

- ZonaEnglish App
- Hira Space
- Docterbee
- Freshskill.my.id

---

**For AI Agents**: This project uses Serena MCP for AI-assisted development. Context files are in `/.serena/memories/`. Read `project_structure.md` first for navigation guidance.
