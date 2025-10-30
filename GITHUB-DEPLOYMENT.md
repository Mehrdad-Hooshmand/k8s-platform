# 🚀 GitHub Deployment Guide

This guide shows you how to push this project to GitHub and make it available for one-command installation.

---

## 📋 Prerequisites

1. GitHub account
2. Git installed on your machine
3. All project files ready

---

## 🔧 Step-by-Step Setup

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `k8s-platform` (or your choice)
   - **Description**: "Self-hosted Kubernetes platform with beautiful web panel"
   - **Visibility**: Public (so users can download via wget/curl)
   - **Initialize**: ❌ Don't check any boxes (we have files already)
3. Click "Create repository"

### 2. Initialize Git Locally

```bash
# Navigate to your project directory
cd /home

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Complete K8s platform with installer, API, and docs"
```

### 3. Connect to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/k8s-platform.git

# Verify remote
git remote -v
```

### 4. Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use Personal Access Token (not your account password)

### 5. Create Personal Access Token (if needed)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "K8s Platform Deployment"
4. Select scopes:
   - ✅ `repo` (full control)
   - ✅ `write:packages` (if publishing Docker images)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as password when pushing

### 6. Update URLs in Files

After creating repository, update these files with your GitHub username:

#### README.md
```bash
# Replace YOUR_USERNAME with your actual username
sed -i 's/YOUR_USERNAME/your-github-username/g' README.md
git add README.md
git commit -m "Update GitHub username in README"
git push
```

#### install.sh
```bash
# Replace YOUR_USERNAME
sed -i 's/YOUR_USERNAME/your-github-username/g' install.sh
git add install.sh
git commit -m "Update GitHub username in install script"
git push
```

---

## ✅ Verify Installation

Test the one-line installer:

```bash
# On a test server
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
```

Or manual download:

```bash
wget https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/k8s-installer.sh
chmod +x k8s-installer.sh
sudo ./k8s-installer.sh init
```

---

## 🐳 Build and Publish Docker Images

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/build-api.yml`:

```yaml
name: Build API Docker Image

on:
  push:
    branches: [ main ]
    paths:
      - 'k8s-management-api/**'
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/api

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./k8s-management-api
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Then:

```bash
mkdir -p .github/workflows
# Create the file above
git add .github/
git commit -m "Add GitHub Actions for Docker build"
git push
```

Image will be available at: `ghcr.io/YOUR_USERNAME/k8s-platform/api:latest`

### Option 2: Manual Build and Push

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Build multi-arch image
cd k8s-management-api
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/YOUR_USERNAME/k8s-platform/api:latest \
  --push \
  .
```

### Update Installer to Use Published Image

Edit `k8s-installer.sh` and find `install_management_panel()` function, change:

```bash
# OLD (local build)
image: api:latest

# NEW (published image)
image: ghcr.io/YOUR_USERNAME/k8s-platform/api:latest
```

---

## 📝 Repository Settings

### 1. Add Description

1. Go to your repository on GitHub
2. Click ⚙️ Settings
3. Update:
   - **Description**: "☸️ Self-hosted Kubernetes platform - Deploy apps with one click"
   - **Website**: Your demo URL (optional)
   - **Topics**: `kubernetes`, `k8s`, `docker`, `self-hosted`, `platform`, `go`, `react`

### 2. Enable Discussions (Optional)

Settings → Features → ✅ Discussions

### 3. Create Release

1. Go to "Releases" → "Create a new release"
2. Tag: `v1.0.0`
3. Title: "🚀 v1.0.0 - Initial Release"
4. Description:
```markdown
## ✨ Features

- ✅ One-command Kubernetes installation
- ✅ Multi-node cluster support
- ✅ Automated SSL certificates
- ✅ Registry mirror for Iran
- ✅ RESTful API backend (Go)
- ✅ User authentication (JWT)
- ✅ Comprehensive documentation

## 📥 Installation

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
```

## 📖 Documentation

See [README.md](README.md) for full documentation.
```

### 4. Add Repository Image (Optional)

1. Create a nice banner image (1280x640px)
2. Settings → Social preview → Upload image

---

## 🔒 Security Settings

### Enable Dependabot

1. Settings → Security → Code security and analysis
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

### Add Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email:
security@your-domain.com

Do NOT open a public issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

- JWT authentication
- Bcrypt password hashing
- HTTPS by default
- Kubernetes RBAC
- Network policies
```

---

## 📊 Add Badges to README

Update `README.md` to add dynamic badges:

```markdown
[![GitHub Release](https://img.shields.io/github/v/release/YOUR_USERNAME/k8s-platform)](https://github.com/YOUR_USERNAME/k8s-platform/releases)
[![GitHub Stars](https://img.shields.io/github/stars/YOUR_USERNAME/k8s-platform)](https://github.com/YOUR_USERNAME/k8s-platform/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/YOUR_USERNAME/k8s-platform)](https://github.com/YOUR_USERNAME/k8s-platform/issues)
[![GitHub License](https://img.shields.io/github/license/YOUR_USERNAME/k8s-platform)](LICENSE)
```

---

## 🌟 Promote Your Project

1. **Reddit**: Post to r/kubernetes, r/selfhosted, r/docker
2. **Twitter/X**: Tweet about your project
3. **Dev.to**: Write a tutorial
4. **Hacker News**: Submit to Show HN
5. **Product Hunt**: Launch your product
6. **awesome-kubernetes**: Add to curated list

---

## 🔄 Workflow for Updates

```bash
# Make changes to code
vim k8s-installer.sh

# Test locally
./k8s-installer.sh init

# Commit and push
git add .
git commit -m "feat: Add new feature X"
git push

# Users automatically get updates when they run:
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
```

---

## 📦 Project Structure on GitHub

```
k8s-platform/
├── .github/
│   ├── workflows/
│   │   ├── build-api.yml
│   │   └── test.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── docs/
│   ├── INSTALLATION.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── TROUBLESHOOTING.md
├── k8s-management-api/
│   ├── cmd/
│   ├── internal/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── go.mod
│   └── README.md
├── k8s-installer.sh
├── create-admin.sh
├── install.sh
├── README.md
├── LICENSE
├── .gitignore
├── SECURITY.md
└── CONTRIBUTING.md
```

---

## ✅ Final Checklist

- [ ] Repository created on GitHub
- [ ] All files pushed to main branch
- [ ] Updated YOUR_USERNAME in README.md and install.sh
- [ ] Tested one-line installation
- [ ] Docker images built and published
- [ ] Release v1.0.0 created
- [ ] README has badges and clear instructions
- [ ] LICENSE file added
- [ ] .gitignore configured
- [ ] GitHub Actions workflows added
- [ ] Repository description and topics set
- [ ] Documentation complete

---

## 🎉 You're Done!

Your project is now live on GitHub and anyone can install it with:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
```

Share your repository URL:
```
https://github.com/YOUR_USERNAME/k8s-platform
```

**Congratulations! 🚀**
