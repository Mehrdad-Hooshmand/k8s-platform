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

type NodeHandler struct {
	db    *gorm.DB
	redis *redis.Client
	svc   *services.ClusterService
}

func NewNodeHandler(db *gorm.DB, redis *redis.Client) *NodeHandler {
	return &NodeHandler{
		db:    db,
		redis: redis,
		svc:   services.NewClusterService(db, redis),
	}
}

type AddNodeRequest struct {
	Name    string `json:"name" binding:"required"`
	IP      string `json:"ip" binding:"required"`
	SSHPort int    `json:"ssh_port"`
}

// List returns all nodes in a cluster
func (h *NodeHandler) List(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("cluster_id"))

	// Verify cluster ownership
	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	var nodes []models.Node
	if err := h.db.Where("cluster_id = ?", clusterID).Find(&nodes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch nodes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"nodes": nodes,
		"total": len(nodes),
	})
}

// Add adds a new worker node to the cluster
func (h *NodeHandler) Add(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("cluster_id"))

	var req AddNodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify cluster ownership
	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).
		First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	// Check cluster status
	if cluster.Status != "ready" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cluster is not ready. Cannot add nodes."})
		return
	}

	// Set default SSH port
	if req.SSHPort == 0 {
		req.SSHPort = 22
	}

	// Create node
	node := models.Node{
		ClusterID: uint(clusterID),
		Name:      req.Name,
		IP:        req.IP,
		SSHPort:   req.SSHPort,
		Role:      "worker",
		Status:    "pending",
	}

	if err := h.db.Create(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create node"})
		return
	}

	// Start node installation in background
	go h.svc.AddWorkerNode(&cluster, &node)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Node installation started",
		"node":    node,
	})
}

// Get returns a specific node
func (h *NodeHandler) Get(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("cluster_id"))
	nodeID, _ := strconv.Atoi(c.Param("id"))

	// Verify cluster ownership
	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	var node models.Node
	if err := h.db.Where("id = ? AND cluster_id = ?", nodeID, clusterID).First(&node).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch node"})
		}
		return
	}

	c.JSON(http.StatusOK, node)
}

// Remove removes a node from the cluster
func (h *NodeHandler) Remove(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("cluster_id"))
	nodeID, _ := strconv.Atoi(c.Param("id"))

	// Verify cluster ownership
	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	var node models.Node
	if err := h.db.Where("id = ? AND cluster_id = ?", nodeID, clusterID).First(&node).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch node"})
		}
		return
	}

	// Don't allow removing master node
	if node.Role == "master" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot remove master node"})
		return
	}

	// TODO: Drain node and remove from cluster before deleting from DB

	if err := h.db.Delete(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete node"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Node removed successfully"})
}

// GetStatus returns the status of a node
func (h *NodeHandler) GetStatus(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	clusterID, _ := strconv.Atoi(c.Param("cluster_id"))
	nodeID, _ := strconv.Atoi(c.Param("id"))

	// Verify cluster ownership
	var cluster models.Cluster
	if err := h.db.Where("id = ? AND user_id = ?", clusterID, userID).First(&cluster).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cluster not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cluster"})
		}
		return
	}

	var node models.Node
	if err := h.db.Where("id = ? AND cluster_id = ?", nodeID, clusterID).First(&node).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch node"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"node_id":        node.ID,
		"status":         node.Status,
		"message":        node.StatusMessage,
		"k8s_version":    node.K8sVersion,
		"cpu_cores":      node.CPUCores,
		"memory_gb":      node.MemoryGB,
		"disk_gb":        node.DiskGB,
	})
}
