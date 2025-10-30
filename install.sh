#!/bin/bash
#
# Kubernetes Self-Hosted Platform - One-Line Installer
# 
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh | sudo bash
#
# Or download and run:
#   wget https://raw.githubusercontent.com/YOUR_USERNAME/k8s-platform/main/install.sh
#   chmod +x install.sh
#   sudo ./install.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub repository
GITHUB_USER="YOUR_USERNAME"
GITHUB_REPO="k8s-platform"
GITHUB_BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}"

# Installation directory
INSTALL_DIR="/opt/k8s-platform"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║       ☸️  Kubernetes Self-Hosted Platform Installer     ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root. Please use sudo.${NC}"
   exit 1
fi

echo -e "${GREEN}[1/5] Checking system requirements...${NC}"

# Check OS
if [[ ! -f /etc/os-release ]]; then
    echo -e "${RED}Cannot detect OS. This installer supports Ubuntu and Debian only.${NC}"
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
    echo -e "${YELLOW}Warning: This OS ($ID) is not officially supported.${NC}"
    echo -e "${YELLOW}Supported: Ubuntu 20.04/22.04, Debian 11/12${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ OS: $PRETTY_NAME${NC}"

# Check architecture
ARCH=$(uname -m)
if [[ "$ARCH" != "x86_64" && "$ARCH" != "aarch64" ]]; then
    echo -e "${RED}Unsupported architecture: $ARCH${NC}"
    echo -e "${RED}Supported: x86_64 (amd64), aarch64 (arm64)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Architecture: $ARCH${NC}"

# Check minimum resources
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
if [[ $TOTAL_MEM -lt 3500 ]]; then
    echo -e "${YELLOW}Warning: Low memory detected (${TOTAL_MEM}MB). Recommended: 4GB+${NC}"
fi

CPU_CORES=$(nproc)
if [[ $CPU_CORES -lt 2 ]]; then
    echo -e "${YELLOW}Warning: Only ${CPU_CORES} CPU core(s) detected. Recommended: 2+${NC}"
fi

echo -e "${GREEN}✓ Memory: ${TOTAL_MEM}MB${NC}"
echo -e "${GREEN}✓ CPU Cores: ${CPU_CORES}${NC}"

echo ""
echo -e "${GREEN}[2/5] Installing dependencies...${NC}"

# Update package list
apt-get update -qq > /dev/null 2>&1

# Install required packages
PACKAGES="curl wget git openssh-client"
for pkg in $PACKAGES; do
    if ! dpkg -s $pkg > /dev/null 2>&1; then
        echo -e "${BLUE}Installing $pkg...${NC}"
        apt-get install -y $pkg > /dev/null 2>&1
    fi
done

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${GREEN}[3/5] Creating installation directory...${NC}"

# Create installation directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${GREEN}✓ Directory: $INSTALL_DIR${NC}"

echo ""
echo -e "${GREEN}[4/5] Downloading installer scripts...${NC}"

# Download main installer
echo -e "${BLUE}Downloading k8s-installer.sh...${NC}"
curl -fsSL "${BASE_URL}/k8s-installer.sh" -o k8s-installer.sh
chmod +x k8s-installer.sh
echo -e "${GREEN}✓ k8s-installer.sh${NC}"

# Download admin creation script
echo -e "${BLUE}Downloading create-admin.sh...${NC}"
curl -fsSL "${BASE_URL}/create-admin.sh" -o create-admin.sh
chmod +x create-admin.sh
echo -e "${GREEN}✓ create-admin.sh${NC}"

# Create symlinks in /usr/local/bin for easy access
ln -sf "$INSTALL_DIR/k8s-installer.sh" /usr/local/bin/k8s-installer
ln -sf "$INSTALL_DIR/create-admin.sh" /usr/local/bin/k8s-create-admin

echo ""
echo -e "${GREEN}[5/5] Starting installation wizard...${NC}"
echo ""

# Run the main installer
./k8s-installer.sh init

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║              ✓ Installation Started Successfully         ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo -e "1. Wait for installation to complete (10-15 minutes)"
echo -e "2. Create admin user:"
echo -e "   ${YELLOW}k8s-create-admin${NC}"
echo ""
echo -e "3. Access your panel at the URL shown above"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  ${YELLOW}k8s-installer status${NC}         - Check cluster status"
echo -e "  ${YELLOW}k8s-installer add-worker${NC}     - Add worker node"
echo -e "  ${YELLOW}k8s-create-admin${NC}             - Create admin user"
echo ""
echo -e "${GREEN}Documentation:${NC} https://github.com/${GITHUB_USER}/${GITHUB_REPO}${NC}"
echo ""
echo -e "${GREEN}Happy Clustering! 🚀${NC}"
echo ""
