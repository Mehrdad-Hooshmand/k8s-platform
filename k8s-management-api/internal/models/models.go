package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Email        string `gorm:"uniqueIndex;not null" json:"email"`
	Password     string `gorm:"not null" json:"-"`
	Name         string `json:"name"`
	Role         string `gorm:"default:user" json:"role"` // admin, user
	IsActive     bool   `gorm:"default:true" json:"is_active"`
	
	Clusters     []Cluster `gorm:"foreignKey:UserID" json:"clusters,omitempty"`
}

// Cluster represents a Kubernetes cluster
type Cluster struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	UserID      uint   `gorm:"not null;index" json:"user_id"`
	Name        string `gorm:"not null" json:"name"`
	Description string `json:"description"`
	
	// Cluster connection info
	MasterIP       string `gorm:"not null" json:"master_ip"`
	MasterSSHPort  int    `gorm:"default:22" json:"master_ssh_port"`
	K3sToken       string `json:"-"` // Encrypted
	KubeconfigPath string `json:"-"` // Path to kubeconfig file
	
	// Registry settings
	UseRegistryMirror bool   `gorm:"default:false" json:"use_registry_mirror"`
	RegistryDomain    string `json:"registry_domain,omitempty"`
	RegistryUser      string `json:"registry_user,omitempty"`
	RegistryPassword  string `json:"-"` // Encrypted
	
	// SSL settings
	EnableSSL   bool   `gorm:"default:false" json:"enable_ssl"`
	PanelDomain string `json:"panel_domain,omitempty"`
	SSLEmail    string `json:"ssl_email,omitempty"`
	
	// Status
	Status      string `gorm:"default:pending" json:"status"` // pending, installing, ready, error
	StatusMessage string `json:"status_message,omitempty"`
	
	// Relations
	User         User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Nodes        []Node       `gorm:"foreignKey:ClusterID" json:"nodes,omitempty"`
	Deployments  []Deployment `gorm:"foreignKey:ClusterID" json:"deployments,omitempty"`
}

// Node represents a worker node in a cluster
type Node struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	ClusterID uint   `gorm:"not null;index" json:"cluster_id"`
	Name      string `gorm:"not null" json:"name"`
	
	// Node info
	IP      string `gorm:"not null" json:"ip"`
	SSHPort int    `gorm:"default:22" json:"ssh_port"`
	Role    string `gorm:"default:worker" json:"role"` // master, worker
	
	// Status
	Status         string `gorm:"default:pending" json:"status"` // pending, installing, ready, error
	StatusMessage  string `json:"status_message,omitempty"`
	K8sVersion     string `json:"k8s_version,omitempty"`
	
	// Resources
	CPUCores   int    `json:"cpu_cores,omitempty"`
	MemoryGB   int    `json:"memory_gb,omitempty"`
	DiskGB     int    `json:"disk_gb,omitempty"`
	
	// Relations
	Cluster Cluster `gorm:"foreignKey:ClusterID" json:"cluster,omitempty"`
}

// Application represents an available application (WordPress, MySQL, etc.)
type Application struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Name        string `gorm:"uniqueIndex;not null" json:"name"`
	DisplayName string `gorm:"not null" json:"display_name"`
	Description string `json:"description"`
	Category    string `json:"category"` // web, database, monitoring, devops, etc.
	Icon        string `json:"icon,omitempty"`
	
	// Version info
	Version      string `json:"version"`
	IsOfficial   bool   `gorm:"default:false" json:"is_official"`
	
	// Template reference
	TemplateID uint        `json:"template_id"`
	Template   AppTemplate `gorm:"foreignKey:TemplateID" json:"template,omitempty"`
}

// AppTemplate stores the YAML/Helm configuration for an app
type AppTemplate struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Name         string `gorm:"uniqueIndex;not null" json:"name"`
	Type         string `gorm:"default:yaml" json:"type"` // yaml, helm
	
	// Template content
	ManifestYAML string `gorm:"type:text" json:"manifest_yaml,omitempty"`
	HelmChart    string `json:"helm_chart,omitempty"`
	HelmRepo     string `json:"helm_repo,omitempty"`
	
	// Configuration schema (JSON Schema)
	ConfigSchema string `gorm:"type:text" json:"config_schema,omitempty"`
	
	// Default values
	DefaultConfig string `gorm:"type:text" json:"default_config,omitempty"`
	
	// Resource requirements
	MinCPU    string `json:"min_cpu,omitempty"`
	MinMemory string `json:"min_memory,omitempty"`
	MinDisk   string `json:"min_disk,omitempty"`
}

// Deployment represents a deployed application on a cluster
type Deployment struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	ClusterID     uint   `gorm:"not null;index" json:"cluster_id"`
	ApplicationID uint   `gorm:"not null;index" json:"application_id"`
	Name          string `gorm:"not null" json:"name"`
	Namespace     string `gorm:"default:default" json:"namespace"`
	
	// Domain and SSL
	Domain    string `json:"domain,omitempty"`
	EnableSSL bool   `gorm:"default:false" json:"enable_ssl"`
	
	// Configuration
	Config string `gorm:"type:text" json:"config,omitempty"` // User-provided config (JSON)
	
	// Credentials (for apps like WordPress)
	Username string `json:"username,omitempty"`
	Password string `json:"-"` // Encrypted
	
	// Resources
	CPURequest    string `json:"cpu_request,omitempty"`
	CPULimit      string `json:"cpu_limit,omitempty"`
	MemoryRequest string `json:"memory_request,omitempty"`
	MemoryLimit   string `json:"memory_limit,omitempty"`
	StorageSize   string `json:"storage_size,omitempty"`
	
	// Status
	Status        string `gorm:"default:pending" json:"status"` // pending, deploying, ready, error, deleting
	StatusMessage string `json:"status_message,omitempty"`
	URL           string `json:"url,omitempty"`
	
	// Relations
	Cluster     Cluster     `gorm:"foreignKey:ClusterID" json:"cluster,omitempty"`
	Application Application `gorm:"foreignKey:ApplicationID" json:"application,omitempty"`
}
