# Changelog

تمام تغییرات مهم این پروژه در این فایل ثبت می‌شود.

فرمت بر اساس [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) است.

## [Unreleased]

## [1.0.0] - 2025-11-01

### 🎉 اولین نسخه Desktop App

این اولین نسخه stable اپلیکیشن دسکتاپ مدیریت Kubernetes است.

### ✨ Added (ویژگی‌های جدید)

#### Desktop Application
- **Electron Desktop App** برای Windows, macOS, Linux
- **System Tray Integration** با منوی سریع (Dashboard, Apps, Deployments, Quit)
- **Application Menu** با keyboard shortcuts:
  - `Ctrl+D`: Dashboard
  - `Ctrl+M`: Deployments
  - `Ctrl+,`: Settings
  - `Ctrl+Q`: Quit
- **Native Notifications** برای موفقیت/خطاهای عملیات
- **Hide to Tray** وقتی پنجره بسته میشه

#### Service Management
- **DeploymentDetails Component** با امکانات:
  - نمایش URL سرویس با دکمه Copy و Open
  - **Auto-Credentials Display** برای سرویس‌هایی مثل:
    - Webtop (admin / password)
    - Nextcloud (admin / changeme)
    - Uptime Kuma (نیاز به setup اولیه ندارد)
    - Gitea (gitea / gitea)
  - **Manual Setup Guide** برای سرویس‌هایی مثل WordPress:
    - نمایش Database Host, Database Name, Username, Password
    - راهنمای قدم‌به‌قدم نصب
  - **Service Controls**:
    - ♻️ Restart Service
    - ⏹️ Stop Service
    - ▶️ Start Service
    - 🗑️ Delete Service (با تایید native dialog)
  - نمایش Resources (CPU, RAM limits)
  - لیست Features هر اپلیکیشن

#### API & Backend
- **Complete Authentication System**:
  - JWT-based authentication
  - Bcrypt password hashing
  - Login/Logout/Token refresh
- **Cluster Management**:
  - Create/List/Update/Delete clusters
  - SSH-based installation
  - Multi-node support (master + workers)
  - Real-time status monitoring
- **Node Management**:
  - Add worker nodes to cluster
  - List nodes with details (roles, status, resources)
  - Remove nodes
- **Application Templates**:
  - WordPress 6.4
  - MySQL 8.0
  - PostgreSQL 16
  - Redis 7.2

#### Frontend Panel
- **Modern React + TypeScript SPA**:
  - Vite 5.0 for fast development
  - Tailwind CSS 3.3 for styling
  - React Query 5.12 for data fetching
  - Axios with interceptors
- **Complete Pages**:
  - 🔌 Connect API (first-time setup)
  - 🔐 Login
  - 📊 Dashboard (کلاسترها، دیپلویمنت‌ها، نودها)
  - 🛍️ Apps Marketplace (تمپلیت‌های آماده)
  - 🚀 Deployments (مدیریت سرویس‌ها)
  - 🖥️ Clusters (مدیریت کلاسترها)
  - 📦 Nodes (مشاهده نودها)
  - ⚙️ Settings (تنظیمات کاربری)
- **Responsive Design**:
  - Sidebar با دکمه collapse
  - موبایل-فرندلی
  - Dark mode ready (آماده برای آینده)

#### Developer Experience
- **Complete Documentation**:
  - `DESKTOP-APP.md`: راهنمای کامل اپلیکیشن دسکتاپ
  - `ELECTRON-READY.md`: خلاصه وضعیت توسعه
  - `HOW-TO-RUN.md`: گزینه‌های مختلف اجرا
  - `RELEASE.md`: راهنمای ساخت Release
  - `electron/ICONS.md`: راهنمای ساخت آیکون‌ها
  - `README.md`: مستندات اصلی با بج‌ها
- **GitHub Actions Workflow**:
  - Auto-build روی Windows, macOS, Linux
  - Auto-release با فایل‌های نصبی
  - Triggered by version tags (v*)
- **TypeScript Support**:
  - تمام کامپوننت‌ها typed
  - Electron API definitions
  - Strict type checking

#### Kubernetes Installer
- **k8s-installer.sh** (1139 خط):
  - نصب خودکار K3s cluster
  - نصب Traefik ingress controller
  - نصب cert-manager برای SSL خودکار
  - نصب management panel
  - پشتیبانی از multi-node
  - Registry mirror برای دور زدن تحریم‌ها
  - نصب worker nodes با یک دستور
  - مدیریت users و permissions

### 🔧 Technical Details

#### Tech Stack
- **Backend**: Go 1.21, Gin, GORM, client-go, JWT, bcrypt
- **Database**: PostgreSQL 16-alpine
- **Cache**: Redis 7-alpine
- **Frontend**: React 18.2, TypeScript 5.2, Vite 5.0
- **Desktop**: Electron 28.0, electron-builder 24.9.1
- **Styling**: Tailwind CSS 3.3
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.294
- **Kubernetes**: K3s v1.28.5+k3s1

#### Build Outputs
- **Windows**: NSIS installer (`.exe`) ~80-100 MB
- **macOS**: DMG image (`.dmg`) ~100-120 MB
- **Linux**: 
  - AppImage (portable) ~90 MB
  - DEB package (Ubuntu/Debian) ~60 MB

### 🐛 Fixed
- TypeScript errors در development mode (طبیعی قبل از npm install)
- Deployment controls حالا native و integrated هستند
- Credentials display برای انواع مختلف apps

### 📝 Known Issues
- Icon files هنوز placeholder هستند (نیاز به icon واقعی 512x512)
- App templates فقط 4 تا هستند (نیاز به 46+ template دیگه)
- Deployment handlers توی API stubbed هستند
- نیاز به Node.js برای build (برای developers)

### 🚀 Installation

#### برای کاربران نهایی:
```bash
# Windows
1. دانلود K8s-Platform-Manager-Setup-1.0.0.exe
2. اجرا و نصب
3. از Start Menu یا دسکتاپ باز کنید

# macOS
1. دانلود K8s-Platform-Manager-1.0.0.dmg
2. باز کنید و به Applications بکشید
3. اجرا کنید

# Linux (AppImage)
chmod +x K8s-Platform-Manager-1.0.0.AppImage
./K8s-Platform-Manager-1.0.0.AppImage

# Linux (DEB)
sudo dpkg -i k8s-platform-manager_1.0.0_amd64.deb
```

#### برای توسعه‌دهندگان:
```bash
# Clone
git clone https://github.com/YOUR_USERNAME/k8s-platform-panel.git
cd k8s-platform-panel

# Install
npm install

# Dev mode
npm run electron:dev

# Build
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

### 🙏 Credits
- Kubernetes logo and branding
- React and Electron communities
- Tailwind CSS team
- Open source contributors

---

## نحوه استفاده از Changelog

### برای افزودن تغییرات جدید:

```markdown
## [Unreleased]

### Added
- ویژگی جدید 1
- ویژگی جدید 2

### Changed
- تغییر 1
- تغییر 2

### Fixed
- باگ فیکس 1
- باگ فیکس 2
```

### وقتی Release می‌سازی:

1. Unreleased رو به شماره نسخه تبدیل کن
2. تاریخ رو اضافه کن
3. یک Unreleased جدید بساز

---

[Unreleased]: https://github.com/YOUR_USERNAME/k8s-platform-panel/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YOUR_USERNAME/k8s-platform-panel/releases/tag/v1.0.0
