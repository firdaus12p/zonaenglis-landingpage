# ============================================
# Auto Migration Script
# ============================================
# Script ini akan menjalankan database migration secara otomatis

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DATABASE MIGRATION - Badge Feature" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: File .env tidak ditemukan!" -ForegroundColor Red
    Write-Host "Buat file .env dari .env.example terlebih dahulu" -ForegroundColor Yellow
    exit 1
}

# Load .env file
Write-Host "Loading database configuration from .env..." -ForegroundColor Yellow
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Variable -Name $name -Value $value -Scope Script
    }
}

# Check required variables
if (-not $DB_HOST -or -not $DB_USER -or -not $DB_NAME) {
    Write-Host "ERROR: Database configuration tidak lengkap di .env!" -ForegroundColor Red
    Write-Host "Pastikan ada: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME" -ForegroundColor Yellow
    exit 1
}

Write-Host "Database: $DB_NAME" -ForegroundColor Green
Write-Host "Host: $DB_HOST" -ForegroundColor Green
Write-Host "User: $DB_USER" -ForegroundColor Green
Write-Host ""

# Migration file path
$migrationFile = "migrations\add_last_viewed_to_ambassadors.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "ERROR: File migration tidak ditemukan: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Migration file: $migrationFile" -ForegroundColor Green
Write-Host ""

# Find MySQL executable
$mysqlPaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    try {
        if (Get-Command $path -ErrorAction SilentlyContinue) {
            $mysqlExe = $path
            break
        }
    } catch {
        continue
    }
}

if (-not $mysqlExe) {
    Write-Host "ERROR: MySQL executable tidak ditemukan!" -ForegroundColor Red
    Write-Host "Coba jalankan migration manual via phpMyAdmin atau MySQL Workbench" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL Script:" -ForegroundColor Cyan
    Get-Content $migrationFile
    exit 1
}

Write-Host "MySQL found: $mysqlExe" -ForegroundColor Green
Write-Host ""

# Prepare MySQL command
$passwordArg = if ($DB_PASSWORD) { "-p$DB_PASSWORD" } else { "" }

Write-Host "Running migration..." -ForegroundColor Yellow
Write-Host ""

# Run migration
try {
    $command = "& `"$mysqlExe`" -h $DB_HOST -u $DB_USER $passwordArg $DB_NAME -e `"source $migrationFile`""
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS: Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify migration
        Write-Host "Verifying migration..." -ForegroundColor Yellow
        $verifySQL = "SHOW COLUMNS FROM ambassadors LIKE 'last_viewed_at';"
        $verifyCommand = "& `"$mysqlExe`" -h $DB_HOST -u $DB_USER $passwordArg $DB_NAME -e `"$verifySQL`""
        $result = Invoke-Expression $verifyCommand
        
        if ($result -match "last_viewed_at") {
            Write-Host "VERIFIED: Column 'last_viewed_at' exists!" -ForegroundColor Green
            Write-Host ""
            Write-Host "================================================" -ForegroundColor Cyan
            Write-Host "  MIGRATION SUCCESSFUL!" -ForegroundColor Green
            Write-Host "================================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Restart backend server (Ctrl+C, then 'npm run dev')" -ForegroundColor White
            Write-Host "2. Test badge feature di admin dashboard" -ForegroundColor White
            Write-Host "3. Badge seharusnya muncul untuk leads baru" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "WARNING: Could not verify migration" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "ERROR: Migration failed!" -ForegroundColor Red
        Write-Host "Check the error message above" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to run migration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manual migration via phpMyAdmin:" -ForegroundColor Yellow
    Write-Host ""
    Get-Content $migrationFile
    exit 1
}
