# MCP Setup Script
# Run this script untuk install semua MCP dependencies

Write-Host "🚀 Setting up MCP Servers..." -ForegroundColor Green

# Install MCP Servers
Write-Host "📦 Installing MCP servers..." -ForegroundColor Yellow
npm install -g @modelcontextprotocol/server-filesystem
npm install -g snyk

# Check Docker untuk monkey-mcp
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker is available" -ForegroundColor Green
    docker pull jamesmontemagno/monkeymcp:latest
} else {
    Write-Host "❌ Docker not found. Install Docker Desktop untuk monkey-mcp server" -ForegroundColor Red
}

# Setup environment
Write-Host "🔐 Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path ".env.mcp")) {
    Write-Host "❌ .env.mcp file not found. Please create it with your API keys" -ForegroundColor Red
} else {
    Write-Host "✅ .env.mcp file found" -ForegroundColor Green
}

Write-Host "✨ MCP setup complete! Configure your API keys in .env.mcp" -ForegroundColor Green