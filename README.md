# ☸️ Kubernetes Self-Hosted Platform

> **Your Own Cloud in Minutes** - Deploy and manage Kubernetes clusters with a beautiful web panel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-K3s-blue.svg)](https://k3s.io/)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8.svg)](https://golang.org/)

---

## 🚀 Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
```

Or manual installation:

```bash
wget https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/k8s-installer.sh
chmod +x k8s-installer.sh
sudo ./k8s-installer.sh init
```

---

## ✨ Features

- 🎯 **One-Command Setup** - Deploy a complete Kubernetes cluster in minutes
- 🎨 **Beautiful Web Panel** - Manage everything from a modern dashboard
- 🚀 **One-Click Apps** - Deploy WordPress, WebTop, Nextcloud, and more
- 🔒 **Auto SSL** - Let's Encrypt certificates managed automatically
- 🌍 **Registry Mirror** - Built-in support to bypass sanctions
- 📊 **Resource Monitoring** - Track CPU, RAM, and storage usage
- 🔐 **Multi-User** - Role-based access control (Admin/User)
- 💰 **Cost-Effective** - No cloud bills, just your server cost

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Your Server / VPS                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Kubernetes Cluster (K3s)                  │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  Management Panel (k8s-management NS)       │ │ │
│  │  │  ┌──────────┐  ┌────────────────────────┐  │ │ │
│  │  │  │PostgreSQL│  │  API Backend (Go)      │  │ │ │
│  │  │  └──────────┘  │  - User Auth           │  │ │ │
│  │  │  ┌──────────┐  │  - Cluster Management  │  │ │ │
│  │  │  │  Redis   │  │  - App Deployment      │  │ │ │
│  │  │  └──────────┘  └────────────────────────┘  │ │ │
│  │  │  ┌─────────────────────────────────────┐  │ │ │
│  │  │  │  Frontend Panel (React)             │  │ │ │
│  │  │  │  https://panel.your-domain.com      │  │ │ │
│  │  │  └─────────────────────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  Your Applications                          │ │ │
│  │  │  ┌──────────┐  ┌──────────┐                │ │ │
│  │  │  │WordPress │  │  WebTop  │   ...          │ │ │
│  │  │  └──────────┘  └──────────┘                │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Requirements

- **Server**: 1+ Linux servers (Ubuntu 20.04/22.04 or Debian 11/12)
- **Resources**: 
  - Master: 4GB RAM, 2 CPU cores, 20GB disk
  - Workers: 2GB RAM, 1 CPU core, 20GB disk
- **Network**: Public IP with SSH access
- **Domain**: (Optional) For SSL and web panel

---

## 🎯 Installation

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Setup SSH key (from your local machine)
ssh-keygen -t rsa -b 4096
ssh-copy-id root@YOUR_SERVER_IP

# Test SSH access
ssh root@YOUR_SERVER_IP
```

### Step 2: Configure DNS (Optional)

If you want SSL and a custom domain:

```
Type: A
Name: panel (or @)
Value: YOUR_SERVER_IP
TTL: 300
```

Test: `nslookup panel.your-domain.com`

### Step 3: Run Installer

```bash
# Download installer
wget https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/k8s-installer.sh
chmod +x k8s-installer.sh

# Run installation
sudo ./k8s-installer.sh init
```

### Step 4: Answer Questions

The installer will ask:

1. **Server location**: Iran / Outside Iran / Direct
2. **Master IP**: Your server's IP address
3. **SSH Port**: Usually 22
4. **Worker nodes**: How many (can be 0)
5. **Enable SSL**: y/n
6. **Panel domain**: panel.your-domain.com
7. **Email**: your@email.com

### Step 5: Wait for Installation

⏳ Installation takes 10-15 minutes:
- Installing K3s
- Installing Traefik
- Installing cert-manager
- Deploying Management Panel
- Issuing SSL certificate

### Step 6: Create Admin User

```bash
# SSH to your server
ssh root@YOUR_SERVER_IP

# Create admin user
wget https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/create-admin.sh
chmod +x create-admin.sh
./create-admin.sh
```

### Step 7: Access Panel 🎉

```
URL: https://panel.your-domain.com
Email: admin@your-domain.com
Password: (what you set)
```

---

## 📖 Usage

### Add Worker Node

```bash
./k8s-installer.sh add-worker <IP> [SSH_PORT]

# Example:
./k8s-installer.sh add-worker 192.168.1.101 22
```

### Check Cluster Status

```bash
./k8s-installer.sh status
```

### Install Panel Later

If you skipped panel installation:

```bash
./k8s-installer.sh install-panel <DOMAIN> <EMAIL>

# Example:
./k8s-installer.sh install-panel panel.example.com admin@example.com
```

---

## 🎨 Web Panel Features

### Dashboard
- Cluster overview
- Resource usage charts
- Running applications
- Node status

### App Marketplace
Deploy with one click:
- **WordPress** - Blog/Website
- **WebTop** - Virtual Desktop
- **Nextcloud** - Cloud Storage
- **GitLab** - DevOps Platform
- **Grafana** - Monitoring
- And more...

### Deployments
- List all deployed apps
- View resource usage
- Access logs
- Scale resources
- Delete deployments

### Settings
- Manage nodes
- Configure SSL
- Update credentials
- View cluster info

---

## 🔧 API Documentation

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Cluster Management

#### List Clusters
```http
GET /api/v1/clusters
Authorization: Bearer <token>
```

#### Create Cluster
```http
POST /api/v1/clusters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Cluster",
  "master_ip": "192.168.1.100",
  "enable_ssl": true,
  "panel_domain": "panel.example.com"
}
```

#### Get Cluster Status
```http
GET /api/v1/clusters/:id/status
Authorization: Bearer <token>
```

### Node Management

#### Add Worker Node
```http
POST /api/v1/clusters/:id/nodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "worker-1",
  "ip": "192.168.1.101",
  "ssh_port": 22
}
```

#### List Nodes
```http
GET /api/v1/clusters/:id/nodes
Authorization: Bearer <token>
```

### Application Deployment

#### Deploy App
```http
POST /api/v1/clusters/:id/deployments
Authorization: Bearer <token>
Content-Type: application/json

{
  "application_id": 1,
  "name": "my-wordpress",
  "domain": "blog.example.com",
  "enable_ssl": true,
  "resources": {
    "cpu_limit": "500m",
    "memory_limit": "1Gi",
    "storage_size": "10Gi"
  }
}
```

#### List Deployments
```http
GET /api/v1/clusters/:id/deployments
Authorization: Bearer <token>
```

Full API documentation: [API.md](docs/API.md)

---

## 🛠 Development

### Backend (Go)

```bash
cd k8s-management-api

# Install dependencies
go mod download

# Run locally
go run cmd/api/main.go

# Or with Docker Compose
docker-compose up -d
```

### Frontend (React)

```bash
cd k8s-management-panel

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 📊 Tech Stack

- **Orchestration**: Kubernetes (K3s)
- **Ingress**: Traefik
- **SSL**: cert-manager + Let's Encrypt
- **Backend**: Go + Gin
- **Database**: PostgreSQL
- **Cache**: Redis
- **Frontend**: React + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **API Client**: Axios + React Query

---

## 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- HTTPS everywhere (auto SSL)
- Kubernetes RBAC
- Namespace isolation
- Resource quotas
- Network policies

---

## 🐛 Troubleshooting

### Panel not accessible

```bash
# Check pods
kubectl get pods -n k8s-management

# Check logs
kubectl logs -n k8s-management deployment/api
kubectl logs -n k8s-management deployment/panel

# Check ingress
kubectl get ingress -n k8s-management
```

### SSL certificate not issued

```bash
# Check certificate status
kubectl get certificate -A

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Verify DNS
nslookup panel.your-domain.com
```

### Database connection failed

```bash
# Check PostgreSQL
kubectl get pods -n k8s-management | grep postgres

# View logs
kubectl logs -n k8s-management deployment/postgres

# Test connection
kubectl exec -it -n k8s-management deployment/postgres -- psql -U postgres -d k8s_management
```

---

## 🗺 Roadmap

### Current (v1.0)
- [x] Automated K8s installation
- [x] Management panel deployment
- [x] User authentication
- [ ] App marketplace
- [ ] One-click deployment

### Next (v1.1)
- [ ] Grafana monitoring
- [ ] Automated backups
- [ ] Multi-cluster support
- [ ] Resource quotas
- [ ] Usage tracking

### Future (v2.0)
- [ ] AI-powered optimization
- [ ] Auto-scaling
- [ ] Disaster recovery
- [ ] Mobile app
- [ ] Billing integration

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Kubernetes](https://kubernetes.io/)
- [K3s](https://k3s.io/)
- [Traefik](https://traefik.io/)
- [cert-manager](https://cert-manager.io/)
- [Go](https://golang.org/)
- [React](https://react.dev/)

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/k8s-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/k8s-platform/discussions)

---

## ⭐ Star History

If you find this project useful, please give it a ⭐!

---

**Made with ❤️ for the Open Source Community**
