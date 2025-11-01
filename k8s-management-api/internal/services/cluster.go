package services

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os/exec"
	"text/template"

	"github.com/haiocloud/k8s-management-api/internal/models"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type ClusterService struct {
	db    *gorm.DB
	redis *redis.Client
}

type K8sStatus struct {
	Version  string
	Nodes    int
	Pods     int
	Services int
}

func NewClusterService(db *gorm.DB, redis *redis.Client) *ClusterService {
	return &ClusterService{
		db:    db,
		redis: redis,
	}
}

// InstallCluster installs K3s on the master node
func (s *ClusterService) InstallCluster(cluster *models.Cluster) error {
	log.Printf("Starting installation for cluster %d (%s)", cluster.ID, cluster.Name)

	// Update status
	cluster.Status = "installing"
	cluster.StatusMessage = "Installing K3s on master node..."
	s.db.Save(cluster)

	// Generate installation script
	script, err := s.generateInstallScript(cluster)
	if err != nil {
		cluster.Status = "error"
		cluster.StatusMessage = fmt.Sprintf("Failed to generate install script: %v", err)
		s.db.Save(cluster)
		return err
	}

	// Execute installation script on master node via SSH
	if err := s.executeSSH(cluster.MasterIP, cluster.MasterSSHPort, script); err != nil {
		cluster.Status = "error"
		cluster.StatusMessage = fmt.Sprintf("Installation failed: %v", err)
		s.db.Save(cluster)
		return err
	}

	// Get K3s token from master
	token, err := s.getK3sToken(cluster.MasterIP, cluster.MasterSSHPort)
	if err != nil {
		cluster.Status = "error"
		cluster.StatusMessage = fmt.Sprintf("Failed to get K3s token: %v", err)
		s.db.Save(cluster)
		return err
	}

	cluster.K3sToken = token // TODO: Encrypt this

	// Install Traefik
	cluster.StatusMessage = "Installing Traefik ingress controller..."
	s.db.Save(cluster)
	
	if err := s.installTraefik(cluster); err != nil {
		log.Printf("Warning: Traefik installation failed: %v", err)
	}

	// Install cert-manager if SSL is enabled
	if cluster.EnableSSL {
		cluster.StatusMessage = "Installing cert-manager..."
		s.db.Save(cluster)
		
		if err := s.installCertManager(cluster); err != nil {
			log.Printf("Warning: cert-manager installation failed: %v", err)
		}
	}

	// Update status to ready
	cluster.Status = "ready"
	cluster.StatusMessage = "Cluster is ready"
	s.db.Save(cluster)

	log.Printf("Cluster %d (%s) installation completed successfully", cluster.ID, cluster.Name)
	return nil
}

// generateInstallScript creates the K3s installation script
func (s *ClusterService) generateInstallScript(cluster *models.Cluster) (string, error) {
	tmpl := `#!/bin/bash
set -e

echo "Installing K3s on master node..."

{{ if .UseRegistryMirror }}
# Configure registry mirror
mkdir -p /etc/rancher/k3s

cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://{{ .RegistryDomain }}"
  registry.k8s.io:
    endpoint:
      - "https://{{ .RegistryDomain }}"
configs:
  "{{ .RegistryDomain }}":
    auth:
      username: "{{ .RegistryUser }}"
      password: "{{ .RegistryPassword }}"
EOF
{{ end }}

# Install K3s
curl -sfL https://get.k3s.io | sh -s - server \
    --disable traefik \
    --write-kubeconfig-mode 644 \
    --node-name master

# Wait for K3s to be ready
until kubectl get nodes 2>/dev/null; do
    sleep 2
done

echo "K3s installation completed"
`

	t, err := template.New("install").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, cluster); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// executeSSH executes a script on a remote server via SSH
func (s *ClusterService) executeSSH(ip string, port int, script string) error {
	// Create temporary script file
	tmpFile := fmt.Sprintf("/tmp/k8s-install-%d.sh", port)
	
	// Write script to temp file
	writeCmd := exec.Command("ssh", 
		"-p", fmt.Sprintf("%d", port),
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("root@%s", ip),
		fmt.Sprintf("cat > %s", tmpFile),
	)
	writeCmd.Stdin = bytes.NewBufferString(script)
	
	if output, err := writeCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to write script: %v, output: %s", err, output)
	}

	// Execute script
	execCmd := exec.Command("ssh",
		"-p", fmt.Sprintf("%d", port),
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("root@%s", ip),
		fmt.Sprintf("bash %s", tmpFile),
	)

	output, err := execCmd.CombinedOutput()
	log.Printf("SSH output: %s", output)
	
	if err != nil {
		return fmt.Errorf("failed to execute script: %v, output: %s", err, output)
	}

	return nil
}

// getK3sToken retrieves the K3s token from master node
func (s *ClusterService) getK3sToken(ip string, port int) (string, error) {
	cmd := exec.Command("ssh",
		"-p", fmt.Sprintf("%d", port),
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("root@%s", ip),
		"cat /var/lib/rancher/k3s/server/node-token",
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to get token: %v, output: %s", err, output)
	}

	return string(bytes.TrimSpace(output)), nil
}

// installTraefik installs Traefik ingress controller
func (s *ClusterService) installTraefik(cluster *models.Cluster) error {
	script := `#!/bin/bash
set -e

# Install Helm if not exists
if ! command -v helm &> /dev/null; then
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# Add Traefik repo
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Install Traefik
helm install traefik traefik/traefik \
    --namespace kube-system \
    --set ports.web.exposedPort=80 \
    --set ports.websecure.exposedPort=443
`

	return s.executeSSH(cluster.MasterIP, cluster.MasterSSHPort, script)
}

// installCertManager installs cert-manager for SSL
func (s *ClusterService) installCertManager(cluster *models.Cluster) error {
	script := fmt.Sprintf(`#!/bin/bash
set -e

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
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
    email: %s
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
EOF
`, cluster.SSLEmail)

	return s.executeSSH(cluster.MasterIP, cluster.MasterSSHPort, script)
}

// GetClusterStatus returns the current status of the cluster
func (s *ClusterService) GetClusterStatus(cluster *models.Cluster) (*K8sStatus, error) {
	// Execute kubectl commands to get status
	cmd := exec.Command("ssh",
		"-p", fmt.Sprintf("%d", cluster.MasterSSHPort),
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("root@%s", cluster.MasterIP),
		"kubectl get nodes,pods,svc -A --no-headers | wc -l",
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("failed to get cluster status: %v", err)
	}

	// For now, return basic status
	// TODO: Parse output and return detailed status
	return &K8sStatus{
		Version:  "v1.28.5+k3s1",
		Nodes:    1,
		Pods:     0,
		Services: 0,
	}, nil
}

// GetKubeconfig returns the kubeconfig file content
func (s *ClusterService) GetKubeconfig(cluster *models.Cluster) (string, error) {
	cmd := exec.Command("ssh",
		"-p", fmt.Sprintf("%d", cluster.MasterSSHPort),
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("root@%s", cluster.MasterIP),
		"cat /etc/rancher/k3s/k3s.yaml",
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to get kubeconfig: %v", err)
	}

	// Replace 127.0.0.1 with actual master IP
	kubeconfig := string(output)
	// TODO: Replace server URL with actual master IP
	
	return kubeconfig, nil
}

// AddWorkerNode adds a new worker node to the cluster
func (s *ClusterService) AddWorkerNode(cluster *models.Cluster, node *models.Node) error {
	log.Printf("Adding worker node %s to cluster %d", node.IP, cluster.ID)

	node.Status = "installing"
	node.StatusMessage = "Installing K3s agent..."
	s.db.Save(node)

	script := s.generateWorkerScript(cluster, node)

	if err := s.executeSSH(node.IP, node.SSHPort, script); err != nil {
		node.Status = "error"
		node.StatusMessage = fmt.Sprintf("Installation failed: %v", err)
		s.db.Save(node)
		return err
	}

	node.Status = "ready"
	node.StatusMessage = "Node is ready"
	s.db.Save(node)

	log.Printf("Worker node %s added successfully", node.IP)
	return nil
}

// generateWorkerScript creates the worker node installation script
func (s *ClusterService) generateWorkerScript(cluster *models.Cluster, node *models.Node) string {
	script := fmt.Sprintf(`#!/bin/bash
set -e

echo "Installing K3s agent..."
`)

	if cluster.UseRegistryMirror {
		script += fmt.Sprintf(`
# Configure registry mirror
mkdir -p /etc/rancher/k3s

cat > /etc/rancher/k3s/registries.yaml <<EOF
mirrors:
  docker.io:
    endpoint:
      - "https://%s"
  registry.k8s.io:
    endpoint:
      - "https://%s"
configs:
  "%s":
    auth:
      username: "%s"
      password: "%s"
EOF
`, cluster.RegistryDomain, cluster.RegistryDomain, cluster.RegistryDomain, 
   cluster.RegistryUser, cluster.RegistryPassword)
	}

	script += fmt.Sprintf(`
# Install K3s agent
curl -sfL https://get.k3s.io | K3S_URL=https://%s:6443 K3S_TOKEN=%s sh -s - agent \
    --node-name %s

echo "K3s agent installation completed"
`, cluster.MasterIP, cluster.K3sToken, node.Name)

	return script
}
