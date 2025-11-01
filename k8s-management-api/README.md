# 🚀 Kubernetes Management API

A powerful REST API for managing Kubernetes clusters, built with Go and Gin framework.

## 📋 Features

- 🔐 **User Authentication**: JWT-based authentication with role-based access control
- 🎛 **Cluster Management**: Create, manage, and monitor multiple K8s clusters
- 🖥 **Node Management**: Add/remove worker nodes dynamically
- 📦 **Application Marketplace**: Deploy applications with one click
- 🔍 **Real-time Monitoring**: Track cluster health and deployment status
- 🔒 **SSL Support**: Automated SSL certificate management
- 🌍 **Registry Mirror**: Built-in support for Docker registry mirrors

## 🏗 Architecture

```
┌─────────────┐
│   Frontend  │ (React/Vue - Coming Soon)
│   Web Panel │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼──────────────────────────────┐
│     API Gateway (Gin)               │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────┐ │
│  │   Auth   │  │  Cluster Service │ │
│  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────────────┐ │
│  │  Deploy  │  │   Node Service   │ │
│  └──────────┘  └──────────────────┘ │
└──────┬──────────────────┬───────────┘
       │                  │
┌──────▼──────┐    ┌──────▼──────┐
│  PostgreSQL │    │    Redis    │
└─────────────┘    └─────────────┘
       │
       │ SSH/kubectl
       │
┌──────▼──────────────────────────────┐
│     Kubernetes Clusters             │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Master 1│ │Master 2│ │Master 3│  │
│  └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

## 🛠 Tech Stack

- **Language**: Go 1.21
- **Framework**: Gin (HTTP router)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: GORM
- **K8s Client**: client-go
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd k8s-management-api
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**:
   ```bash
   nano .env
   ```
   
   Update these important values:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   DATABASE_URL=postgres://user:pass@host:5432/dbname
   ```

4. **Start services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

5. **Check logs**:
   ```bash
   docker-compose logs -f api
   ```

The API will be available at `http://localhost:8080`

### Development Mode

For local development without Docker:

1. **Start PostgreSQL and Redis**:
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Run the API**:
   ```bash
   go run cmd/api/main.go
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register a new user
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "tokens": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 86400
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Cluster Management

#### Create a new cluster
```http
POST /api/v1/clusters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production Cluster",
  "description": "Main production cluster",
  "master_ip": "192.168.1.100",
  "master_ssh_port": 22,
  "use_registry_mirror": true,
  "registry_domain": "registry.example.com",
  "registry_user": "admin",
  "registry_password": "password",
  "enable_ssl": true,
  "panel_domain": "panel.example.com",
  "ssl_email": "admin@example.com"
}
```

**Response**:
```json
{
  "message": "Cluster creation started",
  "cluster": {
    "id": 1,
    "name": "Production Cluster",
    "status": "pending",
    "master_ip": "192.168.1.100"
  }
}
```

#### List all clusters
```http
GET /api/v1/clusters
Authorization: Bearer <token>
```

#### Get cluster details
```http
GET /api/v1/clusters/:id
Authorization: Bearer <token>
```

#### Get cluster status
```http
GET /api/v1/clusters/:id/status
Authorization: Bearer <token>
```

#### Delete a cluster
```http
DELETE /api/v1/clusters/:id
Authorization: Bearer <token>
```

### Node Management

#### Add a worker node
```http
POST /api/v1/clusters/:cluster_id/nodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "worker-1",
  "ip": "192.168.1.101",
  "ssh_port": 22
}
```

#### List cluster nodes
```http
GET /api/v1/clusters/:cluster_id/nodes
Authorization: Bearer <token>
```

#### Remove a node
```http
DELETE /api/v1/clusters/:cluster_id/nodes/:id
Authorization: Bearer <token>
```

### Application Catalog

#### List available applications
```http
GET /api/v1/applications
Authorization: Bearer <token>
```

#### Get application categories
```http
GET /api/v1/applications/categories
Authorization: Bearer <token>
```

**Response**:
```json
{
  "categories": [
    "web",
    "database",
    "monitoring",
    "devops",
    "storage",
    "networking"
  ]
}
```

### Deployments

#### Deploy an application
```http
POST /api/v1/clusters/:cluster_id/deployments
Authorization: Bearer <token>
Content-Type: application/json

{
  "application_id": 1,
  "name": "my-wordpress",
  "domain": "blog.example.com",
  "enable_ssl": true,
  "cpu_request": "100m",
  "cpu_limit": "500m",
  "memory_request": "256Mi",
  "memory_limit": "1Gi",
  "storage_size": "10Gi"
}
```

#### List deployments
```http
GET /api/v1/clusters/:cluster_id/deployments
Authorization: Bearer <token>
```

#### Get deployment status
```http
GET /api/v1/clusters/:cluster_id/deployments/:id/status
Authorization: Bearer <token>
```

#### Get deployment logs
```http
GET /api/v1/clusters/:cluster_id/deployments/:id/logs
Authorization: Bearer <token>
```

#### Delete deployment
```http
DELETE /api/v1/clusters/:cluster_id/deployments/:id
Authorization: Bearer <token>
```

## 🗄 Database Schema

### Users
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `name` - User's full name
- `role` - admin | user
- `is_active` - Account status

### Clusters
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Cluster name
- `master_ip` - Master node IP
- `master_ssh_port` - SSH port
- `k3s_token` - K3s join token (encrypted)
- `registry_domain` - Registry mirror domain
- `enable_ssl` - SSL enabled flag
- `panel_domain` - Management panel domain
- `status` - pending | installing | ready | error

### Nodes
- `id` - Primary key
- `cluster_id` - Foreign key to clusters
- `name` - Node name
- `ip` - Node IP address
- `ssh_port` - SSH port
- `role` - master | worker
- `status` - pending | installing | ready | error

### Applications
- `id` - Primary key
- `name` - Application slug
- `display_name` - Display name
- `category` - Application category
- `version` - Version number
- `template_id` - Foreign key to templates

### Deployments
- `id` - Primary key
- `cluster_id` - Foreign key to clusters
- `application_id` - Foreign key to applications
- `name` - Deployment name
- `namespace` - Kubernetes namespace
- `domain` - Application domain
- `status` - pending | deploying | ready | error

## 🔐 Security

### Authentication
- JWT tokens with HS256 signing
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt

### Authorization
- Role-based access control (RBAC)
- Admin-only endpoints protected with middleware
- User can only access their own resources

### Best Practices
- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Restrict SSH access to API server
- Use SSH keys instead of passwords

## 📊 Monitoring

### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "message": "K8s Management API is running"
}
```

## 🧪 Testing

Run tests:
```bash
go test -v ./...
```

Run tests with coverage:
```bash
go test -v -cover ./...
```

## 🐛 Troubleshooting

### Database connection failed
- Check PostgreSQL is running: `docker ps`
- Verify `DATABASE_URL` in `.env`
- Check logs: `docker-compose logs postgres`

### Redis connection failed
- Check Redis is running: `docker ps`
- Verify `REDIS_URL` in `.env`
- Check logs: `docker-compose logs redis`

### SSH connection failed
- Verify SSH keys are mounted in Docker
- Check SSH port is correct
- Test manual SSH: `ssh -p <port> root@<ip>`

## 📝 Development Roadmap

- [x] User authentication and authorization
- [x] Cluster creation and management
- [x] Node management (add/remove workers)
- [ ] Application marketplace
- [ ] Deployment management (WordPress, MySQL, etc.)
- [ ] Real-time monitoring with WebSockets
- [ ] Backup and restore functionality
- [ ] Multi-cluster management
- [ ] Resource quota management
- [ ] Cost estimation
- [ ] Web panel frontend (React)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **HaioCloud Team**

## 🙏 Acknowledgments

- Kubernetes community
- Gin framework
- GORM ORM
- client-go library
