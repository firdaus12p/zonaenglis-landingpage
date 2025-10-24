# Development Commands (Windows)

## Essential npm Scripts
```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint
```

## Development Workflow
```bash
# Install dependencies (first time or after package.json changes)
npm install

# Start development (most common command)
npm run dev
# Opens dev server at http://localhost:5173

# Check code quality
npm run lint

# Build and test production version
npm run build
npm run preview
```

## Tailwind CSS Commands
```bash
# Tailwind is integrated with Vite, no separate commands needed
# CSS classes are purged automatically in production build
```

## Windows-Specific Commands
```bash
# List files and directories
dir
Get-ChildItem  # PowerShell equivalent

# Navigate directories
cd [path]
Set-Location [path]  # PowerShell equivalent

# Find files
where [filename]
Get-ChildItem -Recurse -Name "*[pattern]*"  # PowerShell

# View file contents
type [filename]
Get-Content [filename]  # PowerShell

# Process management
tasklist  # See running processes
taskkill /f /pid [processid]  # Kill specific process
```

## Git Commands (Standard)
```bash
git status
git add .
git commit -m "message"
git push origin main
git pull origin main
```

## File Operations
```bash
# Create directories
mkdir [dirname]
New-Item -ItemType Directory -Name [dirname]  # PowerShell

# Copy files
copy [source] [destination]
Copy-Item [source] [destination]  # PowerShell

# Delete files/folders
del [filename]
Remove-Item [path] -Recurse  # PowerShell for folders
```