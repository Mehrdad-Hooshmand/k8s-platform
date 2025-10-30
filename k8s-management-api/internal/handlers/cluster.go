package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/haiocloud/k8s-management-api/internal/middleware"
	"github.com/haiocloud/k8s-management-api/internal/models"
	"github.com/haiocloud/k8s-management-api/internal/services"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type ClusterHandler struct {
	db    *gorm.DB
	redis *redis.Client
	svc   *services.ClusterService
}

func NewClusterHandler(db *gorm.DB, redis *redis.Client) *ClusterHandler {
	return &ClusterHandler{
		db:    db,
		redis: redis,
		svc:   services.NewClusterService(db, redis),
	}
}

type CreateClusterRequest struct {
	Name              string `json:"name" binding:"required"`
	Description       string `json:"description"`
	MasterIP          string `json:"master_ip" binding:"required"`
	MasterSSHPort     int    `json:"master_ssh_port"`
	UseRegistryMirror bool   `json:"use_registry_mirror"`
	RegistryDomain    string `json:"registry_domain"`
	RegistryUser      string `json:"registry_user"`
	RegistryPassword  string `json:"registry_password"`
	EnableSSL         bool   `json:"enable_ssl"`
	PanelDomain       string `json:"panel_domain"`
	SSLEmail          string `json:"ssl_email"`
}

type UpdateClusterRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	PanelDomain string `json:"panel_domain"`
}

// List returns all clusters for the authenticated user
func (h *ClusterHandler) List(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var clusters []models.Cluster
	if err := h.db.Where("user_id = ?", userID).
		Preload("Nodes").
		Find(&clusters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clusters"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clusters": clusters,
		"total":    len(clusters),
	})
}

// Create creates a new cluster
func (h *ClusterHandler) Create(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var req CreateClusterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate SSH port
	if req.MasterSSHPort == 0 {
		req.MasterSSHPort = 22
	}

	cluster := models.Cluster{
		UserID:            userID,
		Name:              req.Name,
		Description:       req.Description,
		MasterIP:          req.MasterIP,
		MasterSSHPort:     req.MasterSSHPort,
		UseRegistryMirror: req.UseRegistryMirror,
		RegistryDomain:    req.RegistryDomain,
		RegistryUser:      req.RegistryUser,
		RegistryPassword:  req.RegistryPassword, // TODO: Encrypt this
		EnableSSL:         req.EnableSSL,
		PanelDomain:       req.PanelDomain,
		SSLEmail:          req.SSLEmail,
		Status:            "pending",
	}

	if err := h.db.Create(&cluster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cluster"})
		return
	}

	// Start cluster installation in background
	go h.svc.InstallCluster(&cluster)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Cluster creation started",
		"cluster": cluster,
	})
}

// Get returns a specific cluster
func (h *ClusterHandler) Get(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("id"))

	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).
		Preload("Nodes").
		Preload("Deployments").
		First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	c.JSON(http.StatusOK, cluster)
}

// Update updates cluster information
func (h *ClusterHandler) Update(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("id"))

	var req UpdateClusterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	// Update fields
	if req.Name != "" {
		cluster.Name = req.Name
	}
	if req.Description != "" {
		cluster.Description = req.Description
	}
	if req.PanelDomain != "" {
		cluster.PanelDomain = req.PanelDomain
	}

	if err := h.db.Save(&cluster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cluster"})
		return
	}

	c.JSON(http.StatusOK, cluster)
}

// Delete deletes a cluster
func (h *ClusterHandler) Delete(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("id"))

	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	// Delete cluster (soft delete by default)
	if err := h.db.Delete(&cluster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cluster"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cluster deleted successfully"})
}

// GetStatus returns the current status of a cluster
func (h *ClusterHandler) GetStatus(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("id"))

	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).
		Preload("Nodes").
		First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	// Get live status from Kubernetes
	k8sStatus, err := h.svc.GetClusterStatus(&cluster)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"cluster_id": cluster.ID,
			"status":     cluster.Status,
			"message":    cluster.StatusMessage,
			"error":      err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cluster_id":  cluster.ID,
		"status":      cluster.Status,
		"message":     cluster.StatusMessage,
		"k8s_version": k8sStatus.Version,
		"nodes":       k8sStatus.Nodes,
		"pods":        k8sStatus.Pods,
		"services":    k8sStatus.Services,
	})
}

// GetKubeconfig returns the kubeconfig for a cluster
func (h *ClusterHandler) GetKubeconfig(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("id"))

	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	kubeconfig, err := h.svc.GetKubeconfig(&cluster)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get kubeconfig"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"kubeconfig": kubeconfig,
	})
}
