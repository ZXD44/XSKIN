# PowerShell Automated Deployment Script for ZirconX Skin Studio
param (
  [string]$CommitMessage = "deploy: automatic release build"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 [1/4] Running Unit Tests..." -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -ne 0) { Write-Error "Unit tests failed! Deployment aborted."; exit 1 }

Write-Host "`n🔍 [2/4] Running TypeScript Type Check..." -ForegroundColor Cyan
npm run type-check
if ($LASTEXITCODE -ne 0) { Write-Error "Type check failed! Deployment aborted."; exit 1 }

Write-Host "`n📦 [3/4] Building Production Bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed! Deployment aborted."; exit 1 }

Write-Host "`n📤 [4/4] Syncing to Git Remote..." -ForegroundColor Cyan
git add .
$status = git status --porcelain
if ($status) {
  git commit -m $CommitMessage
} else {
  Write-Host "No changes to commit." -ForegroundColor Yellow
}

git push origin main
if ($LASTEXITCODE -ne 0) { Write-Error "Git push failed!"; exit 1 }

Write-Host "`n✅ Deployment pushed successfully!" -ForegroundColor Green
Write-Host "🌐 GitHub Pages: https://zxd44.github.io/MCPE-WEBSKIN/" -ForegroundColor Yellow
Write-Host "⚡ Actions CI:   https://github.com/ZXD44/MCPE-WEBSKIN/actions" -ForegroundColor Yellow
