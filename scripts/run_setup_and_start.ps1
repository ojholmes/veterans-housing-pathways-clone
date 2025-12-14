#!/usr/bin/env pwsh
<#
One-shot setup + start script for Windows PowerShell.

Usage: open PowerShell in repo root and run:
  powershell -ExecutionPolicy Bypass -File .\scripts\run_setup_and_start.ps1

What it does:
- Checks for Node/npm
- Creates a minimal `.env` if missing
- Installs backend dependencies, generates Prisma client
- Runs Prisma migrations (with fallback to db push)
- Runs `npm run seed`
- Installs frontend deps and opens two new PowerShell windows: one runs `npm start` (backend), the other runs `npm run dev` (frontend)

Note: This script assumes you run it from the repository root. If you run it from elsewhere, it will still resolve the script folder and operate on the repo containing this script.
#>

function AbortWith($msg){ Write-Host $msg -ForegroundColor Red; exit 1 }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir
$repoRoot = Get-Location

Write-Host "Repository root: $repoRoot"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)){
  AbortWith "Node/npm not found on PATH. Install Node.js LTS and retry. See https://nodejs.org/en/download/"
}

# create .env if missing
if (-not (Test-Path -Path .env)){
  Write-Host "Creating .env with development defaults..."
  @" 
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
FRONTEND_ORIGIN="http://localhost:5173"
"@ | Out-File -FilePath .env -Encoding utf8
} else { Write-Host ".env already exists, leaving it intact." }

try{
  Write-Host "Installing backend dependencies (this may take a minute)..."
  npm install
  if ($LASTEXITCODE -ne 0){ Write-Warning "npm install returned non-zero exit code ($LASTEXITCODE)" }

  Write-Host "Generating Prisma client..."
  npx prisma generate
  if ($LASTEXITCODE -ne 0){ Write-Warning "prisma generate returned non-zero exit code ($LASTEXITCODE)" }

  Write-Host "Applying Prisma migrations (interactive). If you prefer no prompt, the script will fallback to 'db push'."
  npx prisma migrate dev --name add-template --skip-seed
  if ($LASTEXITCODE -ne 0){
    Write-Warning "prisma migrate dev failed or was cancelled; attempting 'prisma db push' as fallback..."
    npx prisma db push
    if ($LASTEXITCODE -ne 0){ Write-Warning "prisma db push also failed." }
  }

  Write-Host "Seeding database..."
  npm run seed
  if ($LASTEXITCODE -ne 0){ Write-Warning "seed script returned non-zero exit code ($LASTEXITCODE)" }

} catch {
  Write-Warning "Setup steps encountered an error: $_"
}

# Start backend in a new PowerShell window
$backendCmd = "Set-Location -LiteralPath '$repoRoot'; npm start"
Write-Host "Starting backend in a new PowerShell window..."
Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$backendCmd

# Install frontend deps then start frontend in a new window
$frontendPath = Join-Path $repoRoot 'frontend'
if (Test-Path $frontendPath){
  Write-Host "Installing frontend dependencies..."
  Push-Location $frontendPath
  npm install
  if ($LASTEXITCODE -ne 0){ Write-Warning "frontend npm install returned non-zero exit code ($LASTEXITCODE)" }
  Pop-Location

  $frontendCmd = "Set-Location -LiteralPath '$frontendPath'; npm run dev"
  Write-Host "Starting frontend in a new PowerShell window..."
  Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$frontendCmd
} else { Write-Warning "Frontend folder not found at $frontendPath" }

Write-Host "Setup complete. Backend: http://localhost:4000, Frontend: http://localhost:5173" -ForegroundColor Green
