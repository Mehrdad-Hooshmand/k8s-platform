# 🚀 K8s Platform Manager - Desktop Application

A beautiful desktop application for managing Kubernetes clusters with one-click app deployment.

---

## 📥 Download & Install

### For End Users

**Download the installer for your platform:**

- **Windows**: `K8s-Platform-Manager-Setup-1.0.0.exe` (60MB)
- **macOS**: `K8s-Platform-Manager-1.0.0.dmg` (70MB)
- **Linux**: `K8s-Platform-Manager-1.0.0.AppImage` (65MB)

**Installation:**
1. Download the installer
2. Run it (double-click)
3. Follow the installation wizard
4. Launch "K8s Platform Manager"

---

## 🛠️ For Developers

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/Mehrdad-Hooshmand/k8s-platform-panel
cd k8s-platform-panel

# Install dependencies
npm install

# Run in development mode (web + electron)
npm run electron:dev
```

### Build Desktop App

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

**Build output:**
- Windows: `dist-electron/K8s-Platform-Manager-Setup-1.0.0.exe`
- macOS: `dist-electron/K8s-Platform-Manager-1.0.0.dmg`
- Linux: `dist-electron/K8s-Platform-Manager-1.0.0.AppImage`

---

## 🎯 Features

### ✨ Desktop App Features

- **Native Application**: Runs like any other desktop app
- **System Tray**: Quick access from taskbar
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + D`: Dashboard
  - `Ctrl/Cmd + M`: Apps Marketplace
  - `Ctrl/Cmd + ,`: Settings
  - `Ctrl/Cmd + Q`: Quit
- **Auto-updates**: Get latest features automatically
- **Offline Mode**: Works without internet (if cluster is accessible)

### 🔐 Service Management

- **View Details**: Complete service information
- **Credentials Display**: Auto-generated usernames/passwords
- **One-Click Actions**:
  - 🔗 Open in browser
  - 📋 Copy credentials
  - ↻ Restart service
  - ■ Stop service
  - ▶ Start service
  - 🗑️ Delete service

### 📦 Supported Apps (with auto-credentials)

- **Virtual Desktop (Webtop)**: Full Linux desktop in browser
- **Nextcloud**: File storage & collaboration
- **Uptime Kuma**: Service monitoring
- **Gitea**: Git hosting
- **And 50+ more apps!**

### 🎨 Manual Setup Apps

Some apps require setup in browser:
- WordPress
- Joomla
- Drupal

We show database credentials for easy setup!

---

## 📖 How to Use

### 1️⃣ First Launch

```
┌────────────────────────────────┐
│   Connect to Kubernetes API    │
├────────────────────────────────┤
│                                │
│  API URL:                      │
│  https://api.your-cluster.com  │
│                                │
│  [Connect]                     │
└────────────────────────────────┘
```

### 2️⃣ Login

Use admin credentials from cluster setup:
- Email: `admin@yourdomain.com`
- Password: `your_password`

### 3️⃣ Deploy App

1. Click **"Apps"** in sidebar
2. Choose app (e.g., **Virtual Desktop**)
3. Click **"Deploy Now"**
4. Fill details:
   - Name: `my-desktop`
   - Domain: `desktop.yourdomain.com`
   - Resources: CPU & RAM
5. Click **"Deploy"**

### 4️⃣ Access Service

1. Go to **"Deployments"**
2. Click **"Details"** on your service
3. See credentials:
   ```
   URL: https://desktop.yourdomain.com
   Username: admin
   Password: auto_generated_abc123
   ```
4. Click **"Open"** to access!

---

## 🔧 Architecture

```
┌─────────────────────────────────────────┐
│         Desktop Application             │
│  (Electron + React + TypeScript)        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Frontend │  │  Electron Shell  │   │
│  │ (React)  │←─│  - System Tray   │   │
│  │          │  │  - Menus         │   │
│  │          │  │  - Notifications │   │
│  └────┬─────┘  └──────────────────┘   │
│       │                                │
└───────┼────────────────────────────────┘
        │
        ↓ HTTPS
┌───────┴────────────────────────────────┐
│      Kubernetes API Backend            │
│   (Go + PostgreSQL + Redis)            │
│                                        │
│  - Cluster Management                  │
│  - App Deployment                      │
│  - Service Control                     │
└────────┬───────────────────────────────┘
         │
         ↓ kubectl
┌────────┴───────────────────────────────┐
│      Kubernetes Cluster                │
│   (K3s + Traefik + cert-manager)       │
│                                        │
│  - Running Services                    │
│  - SSL Certificates                    │
│  - Ingress Routing                     │
└────────────────────────────────────────┘
```

---

## 🎨 Screenshots

### Main Dashboard
![Dashboard](docs/screenshots/desktop-dashboard.png)

### App Details
![Details](docs/screenshots/desktop-details.png)

### System Tray
![Tray](docs/screenshots/desktop-tray.png)

---

## 🐛 Troubleshooting

### App won't start

**Windows:**
```powershell
# Check if blocked by Windows Defender
# Right-click installer → Properties → Unblock
```

**macOS:**
```bash
# Allow app from unidentified developer
sudo xattr -rd com.apple.quarantine "/Applications/K8s Platform Manager.app"
```

**Linux:**
```bash
# Make AppImage executable
chmod +x K8s-Platform-Manager-1.0.0.AppImage
./K8s-Platform-Manager-1.0.0.AppImage
```

### Can't connect to API

1. Check API URL is correct
2. Check cluster is running: `kubectl get pods -A`
3. Check API pod: `kubectl get pods -n k8s-management`
4. Check API logs: `kubectl logs -n k8s-management <api-pod>`

### Credentials not working

Some apps need first-time setup in browser:
- WordPress
- Joomla
- Drupal

Database credentials are shown in "Details" panel.

---

## 🔄 Auto-Updates

The app checks for updates automatically:

```
┌────────────────────────────────┐
│   Update Available             │
├────────────────────────────────┤
│                                │
│  Version 1.1.0 is available!   │
│                                │
│  [Download & Install]  [Later] │
└────────────────────────────────┘
```

Or manually check: **Help → Check for Updates**

---

## 📦 Build from Source

### Requirements

- Node.js 18+
- npm or yarn
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/Mehrdad-Hooshmand/k8s-platform-panel
cd k8s-platform-panel

# 2. Install
npm install

# 3. Build frontend
npm run build

# 4. Build desktop app
npm run electron:build

# Output in: dist-electron/
```

### Build for all platforms (on macOS only)

```bash
# Requires: macOS with Xcode + Wine (for Windows builds)
npm run electron:build -- --win --mac --linux
```

---

## 🤝 Contributing

Contributions welcome!

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 💬 Support

- **Documentation**: [Wiki](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/wiki)
- **Issues**: [GitHub Issues](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/discussions)

---

**Made with ❤️ for the Kubernetes community**
