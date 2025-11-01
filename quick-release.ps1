# Quick Release Script for Windows PowerShell
# این اسکریپت به سرعت یک release می‌سازه

Write-Host "🚀 K8s Platform - Quick Release Script" -ForegroundColor Green
Write-Host ""

# چک کردن git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    exit 1
}

# چک کردن اینکه توی git repo هستیم
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# گرفتن version از package.json
$packageJson = Get-Content package.json | ConvertFrom-Json
$version = $packageJson.version
Write-Host "📌 Current version: $version" -ForegroundColor Green

# چک کردن تغییرات
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Uncommitted changes found. Staging all files..." -ForegroundColor Yellow
    git add .
    
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "chore: release v$version"
    }
    
    git commit -m "$commitMsg"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# چک کردن remote
$hasRemote = git remote | Select-String "origin"
if (-not $hasRemote) {
    Write-Host "🔗 No remote 'origin' found." -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter GitHub repository URL"
    git remote add origin $repoUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Push کردن
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

# ساخت و push کردن tag
$tag = "v$version"
Write-Host "🏷️  Creating tag $tag..." -ForegroundColor Yellow

# پاک کردن tag قدیمی اگه وجود داشته باشه
git tag -d $tag 2>$null
git push origin ":refs/tags/$tag" 2>$null

# ساخت tag جدید
$tagMsg = Read-Host "Enter release message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($tagMsg)) {
    $tagMsg = "Release $tag"
}

git tag -a $tag -m "$tagMsg"
git push origin $tag

Write-Host ""
Write-Host "✅ Release $tag created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 GitHub Actions is building:" -ForegroundColor Yellow
Write-Host "   - Windows installer (.exe)"
Write-Host "   - macOS installer (.dmg)"
Write-Host "   - Linux installer (.AppImage + .deb)"
Write-Host ""

$repoUrl = git remote get-url origin
$repoUrl = $repoUrl -replace '\.git$', ''

Write-Host "🔗 Check progress:" -ForegroundColor Green
Write-Host "   $repoUrl/actions"
Write-Host ""
Write-Host "📦 Release will be available at:" -ForegroundColor Green
Write-Host "   $repoUrl/releases/tag/$tag"
Write-Host ""
Write-Host "⏱️  Estimated build time: 15-20 minutes" -ForegroundColor Yellow
Write-Host ""
