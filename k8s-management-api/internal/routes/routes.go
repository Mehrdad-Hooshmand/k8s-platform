package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/haiocloud/k8s-management-api/internal/config"
	"github.com/haiocloud/k8s-management-api/internal/handlers"
	"github.com/haiocloud/k8s-management-api/internal/middleware"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Setup(router *gin.Engine, db *gorm.DB, redis *redis.Client, cfg *config.Config) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"message": "K8s Management API is running",
		})
	})

	// API v1
	v1 := router.Group("/api/v1")
	
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	clusterHandler := handlers.NewClusterHandler(db, redis)
	nodeHandler := handlers.NewNodeHandler(db, redis)
	appHandler := handlers.NewApplicationHandler(db)
	deploymentHandler := handlers.NewDeploymentHandler(db, redis)

	// Public routes
	auth := v1.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
	}

	// Protected routes (require authentication)
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// User management
		users := protected.Group("/users")
		{
			users.GET("/me", authHandler.GetCurrentUser)
			users.PUT("/me", authHandler.UpdateProfile)
			users.PUT("/me/password", authHandler.ChangePassword)
		}

		// Cluster management
		clusters := protected.Group("/clusters")
		{
			clusters.GET("", clusterHandler.List)
			clusters.POST("", clusterHandler.Create)
			clusters.GET("/:id", clusterHandler.Get)
			clusters.PUT("/:id", clusterHandler.Update)
			clusters.DELETE("/:id", clusterHandler.Delete)
			clusters.GET("/:id/status", clusterHandler.GetStatus)
			clusters.GET("/:id/kubeconfig", clusterHandler.GetKubeconfig)
		}

		// Node management
		nodes := protected.Group("/clusters/:cluster_id/nodes")
		{
			nodes.GET("", nodeHandler.List)
			nodes.POST("", nodeHandler.Add)
			nodes.GET("/:id", nodeHandler.Get)
			nodes.DELETE("/:id", nodeHandler.Remove)
			nodes.GET("/:id/status", nodeHandler.GetStatus)
		}

		// Application catalog
		apps := protected.Group("/applications")
		{
			apps.GET("", appHandler.List)
			apps.GET("/:id", appHandler.Get)
			apps.GET("/categories", appHandler.GetCategories)
		}

		// Deployments
		deployments := protected.Group("/clusters/:cluster_id/deployments")
		{
			deployments.GET("", deploymentHandler.List)
			deployments.POST("", deploymentHandler.Deploy)
			deployments.GET("/:id", deploymentHandler.Get)
			deployments.PUT("/:id", deploymentHandler.Update)
			deployments.DELETE("/:id", deploymentHandler.Delete)
			deployments.GET("/:id/status", deploymentHandler.GetStatus)
			deployments.GET("/:id/logs", deploymentHandler.GetLogs)
		}

		// Admin routes
		admin := protected.Group("/admin")
		admin.Use(middleware.AdminMiddleware())
		{
			// User management (admin only)
			admin.GET("/users", authHandler.ListUsers)
			admin.PUT("/users/:id/role", authHandler.UpdateUserRole)
			admin.DELETE("/users/:id", authHandler.DeleteUser)

			// Application management
			admin.POST("/applications", appHandler.Create)
			admin.PUT("/applications/:id", appHandler.Update)
			admin.DELETE("/applications/:id", appHandler.Delete)

			// Templates
			admin.POST("/templates", appHandler.CreateTemplate)
			admin.PUT("/templates/:id", appHandler.UpdateTemplate)
			admin.DELETE("/templates/:id", appHandler.DeleteTemplate)
		}
	}
}
