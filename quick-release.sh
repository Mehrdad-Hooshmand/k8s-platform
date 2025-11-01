#!/bin/bash

# Quick Release Script
# این اسکریپت به سرعت یک release می‌سازه

set -e

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 K8s Platform - Quick Release Script${NC}"
echo ""

# چک کردن git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed!${NC}"
    exit 1
fi

# چک کردن اینکه توی git repo هستیم
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
    git branch -M main
fi

# گرفتن version از package.json
VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
echo -e "${GREEN}📌 Current version: ${VERSION}${NC}"

# چک کردن تغییرات
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}📝 Uncommitted changes found. Staging all files...${NC}"
    git add .
    
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="chore: release v${VERSION}"
    fi
    
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# چک کردن remote
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}🔗 No remote 'origin' found.${NC}"
    read -p "Enter GitHub repository URL: " REPO_URL
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote added${NC}"
fi

# Push کردن
echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
git push -u origin main

# ساخت و push کردن tag
TAG="v${VERSION}"
echo -e "${YELLOW}🏷️  Creating tag ${TAG}...${NC}"

# پاک کردن tag قدیمی اگه وجود داشته باشه
git tag -d "$TAG" 2>/dev/null || true
git push origin ":refs/tags/$TAG" 2>/dev/null || true

# ساخت tag جدید
read -p "Enter release message (or press Enter for default): " TAG_MSG
if [ -z "$TAG_MSG" ]; then
    TAG_MSG="Release ${TAG}"
fi

git tag -a "$TAG" -m "$TAG_MSG"
git push origin "$TAG"

echo ""
echo -e "${GREEN}✅ Release ${TAG} created successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 GitHub Actions is building:${NC}"
echo "   - Windows installer (.exe)"
echo "   - macOS installer (.dmg)"
echo "   - Linux installer (.AppImage + .deb)"
echo ""
echo -e "${GREEN}🔗 Check progress:${NC}"
REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
echo "   ${REPO_URL}/actions"
echo ""
echo -e "${GREEN}📦 Release will be available at:${NC}"
echo "   ${REPO_URL}/releases/tag/${TAG}"
echo ""
echo -e "${YELLOW}⏱️  Estimated build time: 15-20 minutes${NC}"
echo ""
