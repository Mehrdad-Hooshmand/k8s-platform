# Makefile for K8s Management API

.PHONY: help build run test clean docker-build docker-up docker-down migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the Go application
	go build -o bin/api cmd/api/main.go

run: ## Run the application locally
	go run cmd/api/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

docker-build: ## Build Docker image
	docker-compose build

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## View logs
	docker-compose logs -f

migrate: ## Run database migrations
	@echo "Migrations will run automatically on startup"

install: ## Install dependencies
	go mod download
	go mod tidy

dev: ## Run in development mode with auto-reload
	air

.DEFAULT_GOAL := help
