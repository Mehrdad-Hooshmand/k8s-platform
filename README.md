# ☸️ Kubernetes Platform - Management Panel

> **Beautiful desktop & web app to manage your Kubernetes clusters**

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-28-purple)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com/)
[![Build Status](https://github.com/USERNAME/k8s-platform-panel/workflows/Build%20and%20Release%20Desktop%20App/badge.svg)](https://github.com/USERNAME/k8s-platform-panel/actions)
[![GitHub release](https://img.shields.io/github/v/release/USERNAME/k8s-platform-panel)](https://github.com/USERNAME/k8s-platform-panel/releases)

---

## 🌟 Features

### 🖥️ **Desktop Application**
- **Native app** for Windows, macOS, Linux
- **System tray** integration
- **Keyboard shortcuts**
- **Auto-updates**
- **Offline capable**

### 🌐 **Web Application**
- **Progressive Web App** (installable)
- **Works in any browser**
- **Cloud hosted** option
- **Mobile friendly**

### 🎯 **Platform Features**
- 🔐 **Secure Authentication** - JWT-based login
- 📊 **Beautiful Dashboard** - Real-time cluster metrics
- 🚀 **App Marketplace** - Deploy 50+ apps with one click
- 📦 **Deployment Management** - Monitor, scale, and manage
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🌐 **Multi-Cluster** - Connect to any Kubernetes cluster
- � **Auto Credentials** - View service usernames/passwords
- ⚡ **Quick Actions** - Restart, stop, start, delete services

---

## � Quick Start

### Option 1: Desktop App (Recommended)

**Download for your platform:**
- [Windows (.exe)](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/releases)
- [macOS (.dmg)](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/releases)
- [Linux (.AppImage)](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/releases)

**Then:**
1. Install and launch
2. Enter your API URL
3. Login
4. Start deploying apps!

### Option 2: Web App

**Just visit:** 👉 **https://panel.k8s-platform.app**

---

## 🛠️ For Developers

### Prerequisites
- Node.js 18+
- npm or yarn

### Web Development

```bash
# Clone
git clone https://github.com/Mehrdad-Hooshmand/k8s-platform-panel
cd k8s-platform-panel

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Desktop App Development

```bash
# Install dependencies
npm install

# Run desktop app in dev mode
npm run electron:dev

# Build desktop app
npm run electron:build
```

See [DESKTOP-APP.md](DESKTOP-APP.md) for detailed instructions.

---

## 🏗️ Project Structure

```
k8s-platform-panel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # Auth-related components
│   │   ├── dashboard/      # Dashboard widgets
│   │   └── apps/           # App marketplace components
│   ├── pages/              # Page components
│   │   ├── ConnectAPI.tsx  # Connect to API page
│   │   ├── Login.tsx       # Login page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Apps.tsx        # App marketplace
│   │   └── Deployments.tsx # Deployments page
│   ├── services/           # API services
│   │   ├── api.ts          # Axios instance
│   │   ├── auth.ts         # Auth API calls
│   │   ├── apps.ts         # Apps API calls
│   │   └── deployments.ts  # Deployments API calls
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🎨 Screenshots

### Connect API
![Connect API](./docs/screenshots/connect-api.png)

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### App Marketplace
![Apps](./docs/screenshots/apps.png)

### Deployments
![Deployments](./docs/screenshots/deployments.png)

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# API Backend URL
VITE_API_URL=https://api.your-cluster.com

# Optional: Default API URL (shown as placeholder)
VITE_DEFAULT_API_URL=http://localhost:8080
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Deploy with Docker

```bash
# Build image
docker build -t k8s-platform-panel .

# Run container
docker run -p 80:80 \
  -e VITE_API_URL=https://api.your-cluster.com \
  k8s-platform-panel
```

---

## 📚 Related Projects

- **Backend API**: [k8s-platform](https://github.com/Mehrdad-Hooshmand/k8s-platform)
- **Installer Script**: Included in backend repository

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 💬 Support

- 📖 [Documentation](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/wiki)
- 🐛 [Report Bug](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/issues)
- 💡 [Request Feature](https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/issues)

---

**Made with ❤️ for the Kubernetes community**
