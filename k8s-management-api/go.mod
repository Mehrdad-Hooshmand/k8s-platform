module github.com/haiocloud/k8s-management-api

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/golang-jwt/jwt/v5 v5.2.0
	github.com/joho/godotenv v1.5.1
	golang.org/x/crypto v0.17.0
	gorm.io/driver/postgres v1.5.4
	gorm.io/gorm v1.25.5
	k8s.io/api v0.28.4
	k8s.io/apimachinery v0.28.4
	k8s.io/client-go v0.28.4
	github.com/redis/go-redis/v9 v9.3.0
	github.com/google/uuid v1.5.0
	gopkg.in/yaml.v3 v3.0.1
)
