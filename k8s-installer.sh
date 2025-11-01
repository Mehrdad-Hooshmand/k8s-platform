#!/bin/bash

###########################################
# Kubernetes Cluster Installer
# Phase 1: Automated K3s Installation
###########################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
CONFIG_FILE="/etc/k8s-installer/config.env"
LOG_FILE="/var/log/k8s-installer.log"

# Default registry settings (can be changed by user)
DEFAULT_REGISTRY_DOMAIN="registry.haiocloud.com"
DEFAULT_REGISTRY_USER="admin"
DEFAULT_REGISTRY_PASS="SecurePass123"

# These will be set during installation
REGISTRY_DOMAIN=""
REGISTRY_USER=""
REGISTRY_PASS=""

###########################################
# Helper Functions
###########################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

banner() {
    echo -e "${BLUE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           Kubernetes Cluster Installer v1.0                  ║
║           ─────────────────────────────────                  ║
║                                                               ║
║           Automated K3s Setup for Production                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "This script must be run as root. Please use sudo."
    fi
}

create_config_dir() {
    mkdir -p /etc/k8s-installer
    mkdir -p /var/log
    touch "$LOG_FILE"
}

###########################################
# Configuration Questions
###########################################

ask_location() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Select your server location          ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1) Iran - Use Registry Mirror"
    echo "  2) Outside Iran - Use Registry Mirror"
    echo "  3) Direct Docker Hub (no mirror)"
    echo ""
    read -p "Your choice (1, 2 or 3): " location_choice
    
    case $location_choice in
        1)
            LOCATION="iran"
            USE_REGISTRY_MIRROR="true"
            REGISTRY_DOMAIN="$DEFAULT_REGISTRY_DOMAIN"
            REGISTRY_USER="$DEFAULT_REGISTRY_USER"
            REGISTRY_PASS="$DEFAULT_REGISTRY_PASS"
            log "Server location: Iran - Using Registry Mirror"
            ;;
        2)
            LOCATION="outside"
            USE_REGISTRY_MIRROR="true"
            REGISTRY_DOMAIN="$DEFAULT_REGISTRY_DOMAIN"
            REGISTRY_USER="$DEFAULT_REGISTRY_USER"
            REGISTRY_PASS="$DEFAULT_REGISTRY_PASS"
            log "Server location: Outside Iran - Using Registry Mirror"
            ;;
        3)
            LOCATION="direct"
            USE_REGISTRY_MIRROR="false"
            REGISTRY_DOMAIN=""
            REGISTRY_USER=""
            REGISTRY_PASS=""
            log "Using Docker Hub directly - No Registry Mirror"
            ;;
        *)
            error "Invalid choice! Please enter 1, 2 or 3."
            ;;
    esac
    
    # Optional custom registry
    if [ "$USE_REGISTRY_MIRROR" == "true" ]; then
        echo ""
        read -p "Do you want to use a custom Registry Mirror? (y/n, default: n): " custom_registry
        if [[ "$custom_registry" == "y" || "$custom_registry" == "Y" ]]; then
            read -p "Registry Mirror address (e.g., registry.example.com): " REGISTRY_DOMAIN
            read -p "Registry username: " REGISTRY_USER
            read -sp "Registry password: " REGISTRY_PASS
            echo ""
            log "Using custom Registry Mirror: $REGISTRY_DOMAIN"
        fi
    fi
}

ask_master_ip() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Master Node Information               ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    while true; do
        read -p "Enter Master server IP address: " MASTER_IP
        if [[ $MASTER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            log "Master IP: $MASTER_IP"
            break
        else
            error "Invalid IP address! Valid example: 94.182.92.207"
        fi
    done
    
    read -p "Master server SSH port (default 22): " MASTER_SSH_PORT
    MASTER_SSH_PORT=${MASTER_SSH_PORT:-22}
    log "Master SSH Port: $MASTER_SSH_PORT"
}

ask_workers() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Worker Nodes Information              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    read -p "How many Worker Nodes do you have? (enter number, e.g., 2): " WORKER_COUNT
    
    if ! [[ "$WORKER_COUNT" =~ ^[0-9]+$ ]]; then
        error "Please enter a valid number!"
    fi
    
    WORKER_IPS=()
    WORKER_SSH_PORTS=()
    
    for ((i=1; i<=WORKER_COUNT; i++)); do
        echo ""
        echo -e "${BLUE}Worker Node #$i:${NC}"
        
        while true; do
            read -p "  IP address for Worker #$i: " worker_ip
            if [[ $worker_ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                WORKER_IPS+=("$worker_ip")
                log "Worker #$i IP: $worker_ip"
                break
            else
                error "Invalid IP address!"
            fi
        done
        
        read -p "  SSH port for Worker #$i (default 22): " worker_port
        worker_port=${worker_port:-22}
        WORKER_SSH_PORTS+=("$worker_port")
        log "Worker #$i SSH Port: $worker_port"
    done
}

ask_domain() {
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  SSL and Domain Settings               ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    read -p "Do you want to enable SSL for the management panel? (y/n): " enable_ssl
    
    if [[ "$enable_ssl" == "y" || "$enable_ssl" == "Y" ]]; then
        ENABLE_SSL="true"
        
        read -p "Main domain for management panel (e.g., panel.haiocloud.com): " PANEL_DOMAIN
        log "Panel Domain: $PANEL_DOMAIN"
        
        read -p "Email for Let's Encrypt (e.g., admin@haiocloud.com): " SSL_EMAIL
        log "SSL Email: $SSL_EMAIL"
    else
        ENABLE_SSL="false"
        PANEL_DOMAIN=""
        SSL_EMAIL=""
        log "SSL disabled"
    fi
}

save_config() {
    log "Saving configuration to $CONFIG_FILE"
    
    cat > "$CONFIG_FILE" <<EOF
# Kubernetes Cluster Configuration
# Generated: $(date)

# Location
LOCATION="$LOCATION"
USE_REGISTRY_MIRROR="$USE_REGISTRY_MIRROR"

# Registry Mirror
REGISTRY_DOMAIN="$REGISTRY_DOMAIN"
REGISTRY_USER="$REGISTRY_USER"
REGISTRY_PASS="$REGISTRY_PASS"

# Master Node
MASTER_IP="$MASTER_IP"
MASTER_SSH_PORT="$MASTER_SSH_PORT"

# Worker Nodes
WORKER_COUNT="$WORKER_COUNT"
WORKER_IPS=(${WORKER_IPS[@]})
WORKER_SSH_PORTS=(${WORKER_SSH_PORTS[@]})

# SSL Configuration
ENABLE_SSL="$ENABLE_SSL"
PANEL_DOMAIN="$PANEL_DOMAIN"
SSL_EMAIL="$SSL_EMAIL"

# K3s Configuration
K3S_VERSION="v1.28.5+k3s1"
K3S_TOKEN=""
EOF

    chmod 600 "$CONFIG_FILE"
    log "Configuration saved successfully"
}

load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        log "Configuration loaded from $CONFIG_FILE"
        return 0
    else
        warn "Configuration file not found"
        return 1
    fi
}

###########################################
# Installation Functions
###########################################

check_ssh_access() {
    local ip=$1
    local port=$2
    local name=$3
    
    info "Checking SSH access to $name ($ip:$port)..."
    
    if timeout 5 ssh -o StrictHostKeyChecking=no -o BatchMode=yes -p "$port" "root@$ip" "echo OK" &>/dev/null; then
        log "✓ SSH access to $name is available"
        return 0
    else
        warn "✗ SSH access to $name is not available. Please configure SSH Key or Password."
        return 1
    fi
}

install_master() {
    log "=========================================="
    log "Starting Master Node installation..."
    log "=========================================="
    
    # Create script for master installation
    cat > /tmp/install-master.sh <<'MASTER_SCRIPT'
#!/bin/bash
set -e

# Install K3s on Master
echo "Installing K3s on Master Node..."

# Create registry mirror config if enabled
USE_MIRROR="USE_REGISTRY_MIRROR"
if [ "$USE_MIRROR" == "true" ]; then
    mkdir -p /etc/rancher/k3s
    
    cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://REGISTRY_DOMAIN"
  registry.k8s.io:
    endpoint:
      - "https://REGISTRY_DOMAIN"
configs:
  "REGISTRY_DOMAIN":
    auth:
      username: "REGISTRY_USER"
      password: "REGISTRY_PASS"
EOF
    echo "✓ Registry Mirror configured"
else
    echo "Using Docker Hub directly"
fi

# Install K3s
curl -sfL https://get.k3s.io | sh -s - server \
    --disable traefik \
    --write-kubeconfig-mode 644 \
    --node-name master

# Wait for K3s to be ready
echo "Waiting for K3s to be ready..."
until kubectl get nodes 2>/dev/null; do
    sleep 2
done

# Get node token
K3S_TOKEN=$(cat /var/lib/rancher/k3s/server/node-token)
echo "K3S_TOKEN=$K3S_TOKEN" > /tmp/k3s-token.txt

echo "✓ Master Node installation completed successfully"
MASTER_SCRIPT

    # Replace placeholders
    sed -i "s/USE_REGISTRY_MIRROR/$USE_REGISTRY_MIRROR/g" /tmp/install-master.sh
    if [ "$USE_REGISTRY_MIRROR" == "true" ]; then
        sed -i "s/REGISTRY_DOMAIN/$REGISTRY_DOMAIN/g" /tmp/install-master.sh
        sed -i "s/REGISTRY_USER/$REGISTRY_USER/g" /tmp/install-master.sh
        sed -i "s/REGISTRY_PASS/$REGISTRY_PASS/g" /tmp/install-master.sh
    fi
    
    # Copy and execute on master
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        # Local installation
        log "Installing locally on Master..."
        bash /tmp/install-master.sh
        K3S_TOKEN=$(cat /var/lib/rancher/k3s/server/node-token)
    else
        # Remote installation
        log "Remote installation on Master ($MASTER_IP)..."
        scp -P "$MASTER_SSH_PORT" /tmp/install-master.sh "root@$MASTER_IP:/tmp/"
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "bash /tmp/install-master.sh"
        K3S_TOKEN=$(ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "cat /tmp/k3s-token.txt" | cut -d'=' -f2)
    fi
    
    # Save token to config
    sed -i "s/^K3S_TOKEN=.*/K3S_TOKEN=\"$K3S_TOKEN\"/" "$CONFIG_FILE"
    
    log "✓ Master Node installed successfully"
    log "K3s Token: $K3S_TOKEN"
}

install_worker() {
    local worker_ip=$1
    local worker_port=$2
    local worker_num=$3
    
    log "=========================================="
    log "Installing Worker Node #$worker_num ($worker_ip)..."
    log "=========================================="
    
    # Create script for worker installation
    cat > /tmp/install-worker-$worker_num.sh <<'WORKER_SCRIPT'
#!/bin/bash
set -e

# Create registry mirror config if enabled
USE_MIRROR="USE_REGISTRY_MIRROR"
if [ "$USE_MIRROR" == "true" ]; then
    mkdir -p /etc/rancher/k3s
    
    cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://REGISTRY_DOMAIN"
  registry.k8s.io:
    endpoint:
      - "https://REGISTRY_DOMAIN"
configs:
  "REGISTRY_DOMAIN":
    auth:
      username: "REGISTRY_USER"
      password: "REGISTRY_PASS"
EOF
    echo "✓ Registry Mirror configured"
else
    echo "Using Docker Hub directly"
fi

# Install K3s Agent
echo "Installing K3s Agent..."
curl -sfL https://get.k3s.io | K3S_URL=https://MASTER_IP:6443 K3S_TOKEN=K3S_TOKEN sh -s - agent \
    --node-name worker-WORKER_NUM

echo "✓ Worker Node installation completed successfully"
WORKER_SCRIPT

    # Replace placeholders
    sed -i "s/USE_REGISTRY_MIRROR/$USE_REGISTRY_MIRROR/g" "/tmp/install-worker-$worker_num.sh"
    if [ "$USE_REGISTRY_MIRROR" == "true" ]; then
        sed -i "s/REGISTRY_DOMAIN/$REGISTRY_DOMAIN/g" "/tmp/install-worker-$worker_num.sh"
        sed -i "s/REGISTRY_USER/$REGISTRY_USER/g" "/tmp/install-worker-$worker_num.sh"
        sed -i "s/REGISTRY_PASS/$REGISTRY_PASS/g" "/tmp/install-worker-$worker_num.sh"
    fi
    sed -i "s/MASTER_IP/$MASTER_IP/g" "/tmp/install-worker-$worker_num.sh"
    sed -i "s/K3S_TOKEN/$K3S_TOKEN/g" "/tmp/install-worker-$worker_num.sh"
    sed -i "s/WORKER_NUM/$worker_num/g" "/tmp/install-worker-$worker_num.sh"
    
    # Copy and execute on worker
    log "Copying script to Worker #$worker_num..."
    scp -P "$worker_port" "/tmp/install-worker-$worker_num.sh" "root@$worker_ip:/tmp/"
    
    log "Executing script on Worker #$worker_num..."
    ssh -p "$worker_port" "root@$worker_ip" "bash /tmp/install-worker-$worker_num.sh"
    
    log "✓ Worker Node #$worker_num installed successfully"
}

install_all_workers() {
    for ((i=0; i<WORKER_COUNT; i++)); do
        worker_ip="${WORKER_IPS[$i]}"
        worker_port="${WORKER_SSH_PORTS[$i]}"
        worker_num=$((i+1))
        
        install_worker "$worker_ip" "$worker_port" "$worker_num"
        
        # Small delay between installations
        sleep 5
    done
    
    log "✓ تمام Worker Nodes نصب شدند"
}

verify_cluster() {
    log "=========================================="
    log "بررسی وضعیت کلاستر..."
    log "=========================================="
    
    # Wait a bit for nodes to register
    sleep 10
    
    # Check nodes
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        kubectl get nodes
    else
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "kubectl get nodes"
    fi
    
    log "✓ بررسی کلاستر انجام شد"
}

install_cert_manager() {
    if [ "$ENABLE_SSL" != "true" ]; then
        info "نصب SSL غیرفعال است. از cert-manager صرف‌نظر می‌شود."
        return 0
    fi
    
    log "=========================================="
    log "نصب cert-manager..."
    log "=========================================="
    
    cat > /tmp/install-cert-manager.sh <<'CERTMANAGER_SCRIPT'
#!/bin/bash
set -e

# Install cert-manager
echo "نصب cert-manager..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
echo "انتظار برای آماده شدن cert-manager..."
sleep 30

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: SSL_EMAIL
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
EOF

echo "✓ cert-manager نصب شد"
CERTMANAGER_SCRIPT

    sed -i "s/SSL_EMAIL/$SSL_EMAIL/g" /tmp/install-cert-manager.sh
    
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        bash /tmp/install-cert-manager.sh
    else
        scp -P "$MASTER_SSH_PORT" /tmp/install-cert-manager.sh "root@$MASTER_IP:/tmp/"
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "bash /tmp/install-cert-manager.sh"
    fi
    
    log "✓ cert-manager نصب شد"
}

install_management_panel() {
    if [ "$ENABLE_SSL" != "true" ] || [ -z "$PANEL_DOMAIN" ]; then
        warn "پنل مدیریت نیاز به SSL و دامنه دارد. از نصب پنل صرف‌نظر می‌شود."
        warn "برای نصب پنل بعداً، از دستور زیر استفاده کنید:"
        warn "  ./k8s-installer.sh install-panel <DOMAIN> <EMAIL>"
        return 0
    fi
    
    log "=========================================="
    log "نصب پنل مدیریت..."
    log "=========================================="
    
    cat > /tmp/install-panel.sh <<'PANEL_SCRIPT'
#!/bin/bash
set -e

echo "ساخت Namespace برای پنل مدیریت..."
kubectl create namespace k8s-management || true

echo "نصب PostgreSQL..."
cat <<EOF | kubectl apply -f -
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: k8s-management
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: k8s-management
type: Opaque
stringData:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: POSTGRES_PASSWORD_PLACEHOLDER
  POSTGRES_DB: k8s_management
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: k8s-management
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_PASSWORD
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_DB
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: k8s-management
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
EOF

echo "نصب Redis..."
cat <<EOF | kubectl apply -f -
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: k8s-management
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: k8s-management
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF

echo "انتظار برای آماده شدن PostgreSQL و Redis..."
sleep 20

echo "نصب API Backend..."
cat <<EOF | kubectl apply -f -
---
apiVersion: v1
kind: Secret
metadata:
  name: api-secret
  namespace: k8s-management
type: Opaque
stringData:
  JWT_SECRET: JWT_SECRET_PLACEHOLDER
  DATABASE_URL: postgres://postgres:POSTGRES_PASSWORD_PLACEHOLDER@postgres:5432/k8s_management?sslmode=disable
  REDIS_URL: redis://redis:6379/0
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: k8s-management
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: ghcr.io/haiocloud/k8s-management-api:latest
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: PORT
          value: "8080"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: JWT_SECRET
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: REDIS_URL
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: k8s-management
spec:
  selector:
    app: api
  ports:
  - port: 8080
    targetPort: 8080
EOF

echo "نصب Frontend Panel..."
cat <<EOF | kubectl apply -f -
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: panel
  namespace: k8s-management
spec:
  replicas: 1
  selector:
    matchLabels:
      app: panel
  template:
    metadata:
      labels:
        app: panel
    spec:
      containers:
      - name: panel
        image: ghcr.io/haiocloud/k8s-management-panel:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: panel
  namespace: k8s-management
spec:
  selector:
    app: panel
  ports:
  - port: 80
    targetPort: 80
EOF

echo "ساخت Ingress برای پنل..."
cat <<EOF | kubectl apply -f -
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: management-panel-ingress
  namespace: k8s-management
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
spec:
  ingressClassName: traefik
  tls:
  - hosts:
    - PANEL_DOMAIN_PLACEHOLDER
    secretName: panel-tls
  rules:
  - host: PANEL_DOMAIN_PLACEHOLDER
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: panel
            port:
              number: 80
EOF

echo "✓ پنل مدیریت نصب شد"
echo ""
echo "پنل در آدرس زیر در دسترس است:"
echo "  https://PANEL_DOMAIN_PLACEHOLDER"
echo ""
echo "برای ایجاد اولین کاربر admin از دستور زیر استفاده کنید:"
echo "  kubectl exec -it -n k8s-management deployment/api -- ./create-admin.sh"
PANEL_SCRIPT

    # Generate secure passwords
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Replace placeholders
    sed -i "s/POSTGRES_PASSWORD_PLACEHOLDER/$POSTGRES_PASSWORD/g" /tmp/install-panel.sh
    sed -i "s/JWT_SECRET_PLACEHOLDER/$JWT_SECRET/g" /tmp/install-panel.sh
    sed -i "s/PANEL_DOMAIN_PLACEHOLDER/$PANEL_DOMAIN/g" /tmp/install-panel.sh
    
    # Execute on master
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        bash /tmp/install-panel.sh
    else
        scp -P "$MASTER_SSH_PORT" /tmp/install-panel.sh "root@$MASTER_IP:/tmp/"
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "bash /tmp/install-panel.sh"
    fi
    
    # Save credentials to config
    echo "" >> "$CONFIG_FILE"
    echo "# Management Panel Credentials" >> "$CONFIG_FILE"
    echo "POSTGRES_PASSWORD=\"$POSTGRES_PASSWORD\"" >> "$CONFIG_FILE"
    echo "JWT_SECRET=\"$JWT_SECRET\"" >> "$CONFIG_FILE"
    
    log "✓ پنل مدیریت نصب شد"
    log ""
    log "اطلاعات دسترسی:"
    log "  URL: https://$PANEL_DOMAIN"
    log "  PostgreSQL Password: $POSTGRES_PASSWORD"
    log "  JWT Secret: (ذخیره شده در $CONFIG_FILE)"
}

install_traefik() {
    log "=========================================="
    log "نصب Traefik Ingress Controller..."
    log "=========================================="
    
    cat > /tmp/install-traefik.sh <<'TRAEFIK_SCRIPT'
#!/bin/bash
set -e

# Install Traefik using Helm
echo "نصب Traefik..."

# Install Helm if not exists
if ! command -v helm &> /dev/null; then
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# Add Traefik Helm repo
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Install Traefik
helm install traefik traefik/traefik \
    --namespace kube-system \
    --set ports.web.exposedPort=80 \
    --set ports.websecure.exposedPort=443

echo "✓ Traefik نصب شد"
TRAEFIK_SCRIPT
    
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        bash /tmp/install-traefik.sh
    else
        scp -P "$MASTER_SSH_PORT" /tmp/install-traefik.sh "root@$MASTER_IP:/tmp/"
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "bash /tmp/install-traefik.sh"
    fi
    
    log "✓ Traefik نصب شد"
}

###########################################
# Main Installation Flow
###########################################

show_summary() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    خلاصه تنظیمات                             ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}مکان:${NC} $LOCATION"
    echo -e "  ${BLUE}Registry Mirror:${NC} $REGISTRY_DOMAIN"
    echo -e "  ${BLUE}Master IP:${NC} $MASTER_IP:$MASTER_SSH_PORT"
    echo -e "  ${BLUE}تعداد Workers:${NC} $WORKER_COUNT"
    for ((i=0; i<WORKER_COUNT; i++)); do
        echo -e "    - Worker #$((i+1)): ${WORKER_IPS[$i]}:${WORKER_SSH_PORTS[$i]}"
    done
    echo -e "  ${BLUE}SSL:${NC} $ENABLE_SSL"
    if [ "$ENABLE_SSL" == "true" ]; then
        echo -e "  ${BLUE}Panel Domain:${NC} $PANEL_DOMAIN"
        echo -e "  ${BLUE}SSL Email:${NC} $SSL_EMAIL"
    fi
    echo ""
    
    read -p "آیا می‌خواهید نصب را شروع کنید؟ (y/n): " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        error "نصب لغو شد"
    fi
}

init_cluster() {
    banner
    check_root
    create_config_dir
    
    log "شروع راه‌اندازی کلاستر جدید..."
    
    # Ask questions
    ask_location
    ask_master_ip
    ask_workers
    ask_domain
    
    # Save configuration
    save_config
    
    # Show summary
    show_summary
    
    # Check SSH access
    info "بررسی دسترسی SSH به سرورها..."
    check_ssh_access "$MASTER_IP" "$MASTER_SSH_PORT" "Master"
    
    for ((i=0; i<WORKER_COUNT; i++)); do
        check_ssh_access "${WORKER_IPS[$i]}" "${WORKER_SSH_PORTS[$i]}" "Worker #$((i+1))"
    done
    
    # Install components
    install_master
    install_all_workers
    verify_cluster
    install_traefik
    install_cert_manager
    install_management_panel
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║      ✓ Installation Completed Successfully!           ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📦 Your Kubernetes Cluster is Ready!${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Cluster Information:${NC}"
    echo "   - Master IP:     $MASTER_IP"
    echo "   - Workers:       $WORKER_COUNT nodes"
    echo "   - K3s Version:   v1.28.5+k3s1"
    echo ""
    
    # Determine API URL
    if [ "$ENABLE_SSL" == "true" ] && [ -n "$PANEL_DOMAIN" ]; then
        API_URL="https://$PANEL_DOMAIN/api"
        echo -e "${YELLOW}🔑 API Connection Details:${NC}"
        echo "   ┌────────────────────────────────────────────────────┐"
        echo "   │  Copy this URL to connect your panel:             │"
        echo "   │                                                    │"
        echo -e "   │  ${GREEN}$API_URL${NC}  │"
        echo "   │                                                    │"
        echo "   └────────────────────────────────────────────────────┘"
        echo ""
        echo -e "${YELLOW}⚠️  Please wait 5-10 minutes for SSL certificate to be issued${NC}"
        echo ""
    else
        API_URL="http://$MASTER_IP:8080"
        echo -e "${YELLOW}🔑 API Endpoint (No SSL):${NC}"
        echo "   $API_URL"
        echo ""
        echo -e "${YELLOW}💡 Tip: Enable SSL for production use!${NC}"
        echo ""
    fi
    
    echo -e "${YELLOW}👤 Create First Admin User:${NC}"
    echo ""
    echo "   Run this command:"
    echo -e "   ${GREEN}\$ create-admin.sh${NC}"
    echo ""
    echo "   Or if not in PATH:"
    echo -e "   ${GREEN}\$ /usr/local/bin/k8s-create-admin${NC}"
    echo ""
    echo "   Or via SSH:"
    echo -e "   ${GREEN}\$ ssh -p $MASTER_SSH_PORT root@$MASTER_IP${NC}"
    echo -e "   ${GREEN}\$ /usr/local/bin/k8s-create-admin${NC}"
    echo ""
    
    echo -e "${BLUE}📱 Management Panel:${NC}"
    echo ""
    echo "   1. Go to: ${GREEN}https://panel.k8s-platform.app${NC}"
    echo ""
    echo "   2. Click \"${YELLOW}Connect to API${NC}\""
    echo ""
    echo "   3. Enter your API URL:"
    echo -e "      ${GREEN}$API_URL${NC}"
    echo ""
    echo "   4. Login with your admin credentials"
    echo ""
    echo "   5. Start deploying apps! 🚀"
    echo ""
    
    echo -e "${YELLOW}📚 Useful Commands:${NC}"
    echo ""
    echo "   Check cluster status:"
    echo -e "   ${GREEN}\$ k8s-installer status${NC}"
    echo ""
    echo "   Add worker node:"
    echo -e "   ${GREEN}\$ k8s-installer add-worker <IP> [PORT]${NC}"
    echo ""
    echo "   View logs:"
    echo -e "   ${GREEN}\$ tail -f /var/log/k8s-installer.log${NC}"
    echo ""
    
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   https://github.com/Mehrdad-Hooshmand/k8s-platform"
    echo ""
    echo -e "${GREEN}💡 Need help? Open an issue on GitHub!${NC}"
    echo ""
    
    # Save API URL to config for later use
    echo "" >> "$CONFIG_FILE"
    echo "# API Connection" >> "$CONFIG_FILE"
    echo "API_URL=\"$API_URL\"" >> "$CONFIG_FILE"
}

###########################################
# Add Worker Function
###########################################

add_worker_node() {
    local new_worker_ip=$1
    local new_worker_port=${2:-22}
    
    banner
    check_root
    
    if ! load_config; then
        error "ابتدا باید کلاستر را با دستور init راه‌اندازی کنید"
    fi
    
    log "=========================================="
    log "افزودن Worker Node جدید..."
    log "=========================================="
    log "IP: $new_worker_ip"
    log "SSH Port: $new_worker_port"
    log "=========================================="
    
    # Check SSH access
    check_ssh_access "$new_worker_ip" "$new_worker_port" "New Worker"
    
    # Get current worker count
    local next_worker_num=$((WORKER_COUNT + 1))
    
    # Install worker
    install_worker "$new_worker_ip" "$new_worker_port" "$next_worker_num"
    
    # Update config
    WORKER_COUNT=$next_worker_num
    WORKER_IPS+=("$new_worker_ip")
    WORKER_SSH_PORTS+=("$new_worker_port")
    
    # Save updated config
    save_config
    
    # Verify
    verify_cluster
    
    log "=========================================="
    log "✓ Worker Node جدید با موفقیت اضافه شد!"
    log "=========================================="
}

###########################################
# Usage
###########################################

usage() {
    echo ""
    echo "استفاده:"
    echo "  $0 init                          # راه‌اندازی کلاستر جدید"
    echo "  $0 add-worker <IP> [SSH_PORT]    # افزودن Worker جدید"
    echo "  $0 install-panel <DOMAIN> <EMAIL> # نصب پنل مدیریت"
    echo "  $0 status                        # نمایش وضعیت کلاستر"
    echo ""
    echo "مثال‌ها:"
    echo "  $0 init"
    echo "  $0 add-worker 94.182.92.241 2280"
    echo "  $0 install-panel panel.example.com admin@example.com"
    echo ""
}

show_status() {
    if ! load_config; then
        error "کلاستر یافت نشد. ابتدا با دستور init راه‌اندازی کنید."
    fi
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  وضعیت کلاستر Kubernetes                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}Master Node:${NC} $MASTER_IP:$MASTER_SSH_PORT"
    echo -e "  ${BLUE}Worker Nodes:${NC} $WORKER_COUNT"
    for ((i=0; i<WORKER_COUNT; i++)); do
        echo -e "    - Worker #$((i+1)): ${WORKER_IPS[$i]}:${WORKER_SSH_PORTS[$i]}"
    done
    echo ""
    
    if [ "$MASTER_IP" == "$(hostname -I | awk '{print $1}')" ] || [ "$MASTER_IP" == "127.0.0.1" ]; then
        kubectl get nodes
    else
        ssh -p "$MASTER_SSH_PORT" "root@$MASTER_IP" "kubectl get nodes"
    fi
}

###########################################
# Main
###########################################

case "${1:-}" in
    init)
        init_cluster
        ;;
    add-worker)
        if [ -z "$2" ]; then
            error "لطفاً IP Worker را مشخص کنید"
        fi
        add_worker_node "$2" "${3:-22}"
        ;;
    install-panel)
        if [ -z "$2" ] || [ -z "$3" ]; then
            error "استفاده: $0 install-panel <DOMAIN> <EMAIL>"
        fi
        PANEL_DOMAIN="$2"
        SSL_EMAIL="$3"
        ENABLE_SSL="true"
        check_root
        if ! load_config; then
            error "کلاستر یافت نشد. ابتدا با دستور init راه‌اندازی کنید."
        fi
        install_management_panel
        ;;
    status)
        show_status
        ;;
    *)
        usage
        exit 1
        ;;
esac
