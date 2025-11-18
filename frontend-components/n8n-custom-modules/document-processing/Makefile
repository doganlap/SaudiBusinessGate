.PHONY: help setup build start stop restart logs clean test deploy

help:
	@echo "Document Processing Module - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup              Setup module and dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make start              Start all services"
	@echo "  make stop               Stop all services"
	@echo "  make restart            Restart all services"
	@echo "  make logs               Show live logs"
	@echo "  make clean              Clean all data"
	@echo ""
	@echo "Build:"
	@echo "  make build              Build Docker image"
	@echo "  make build-prod         Build production image"
	@echo ""
	@echo "Testing:"
	@echo "  make test               Run test suite"
	@echo "  make test-integration   Run integration tests"
	@echo "  make validate-config    Validate configuration"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-docker      Deploy to Docker"
	@echo "  make deploy-k8s         Deploy to Kubernetes"
	@echo ""
	@echo "Database:"
	@echo "  make db-backup          Create database backup"
	@echo "  make db-restore         Restore from backup"
	@echo ""

setup:
	@echo "Setting up Document Processing Module..."
	npm install
	cp .env.example .env
	npm run setup
	npm run validate-config
	@echo "✓ Setup complete! Run 'make start' to begin."

build:
	@echo "Building Docker image..."
	docker build -t n8n-document-processing:latest .
	@echo "✓ Build complete!"

build-prod:
	@echo "Building production Docker image..."
	docker build -t n8n-document-processing:prod --target production .
	@echo "✓ Production build complete!"

start:
	@echo "Starting services..."
	docker-compose up -d
	@echo "✓ Services started!"
	@echo "Access n8n at: http://localhost:5678"
	@echo "Access Grafana at: http://localhost:3000"

stop:
	@echo "Stopping services..."
	docker-compose down
	@echo "✓ Services stopped!"

restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "✓ Services restarted!"

logs:
	docker-compose logs -f n8n

logs-mongodb:
	docker-compose logs -f mongodb

logs-all:
	docker-compose logs -f

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf logs/*
	@echo "✓ Cleanup complete!"

test:
	@echo "Running tests..."
	npm test

test-integration:
	@echo "Running integration tests..."
	npm run test:integration

validate-config:
	npm run validate-config

deploy-docker:
	@echo "Deploying to Docker..."
	docker build -t n8n-document-processing:latest .
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✓ Deployment complete!"

deploy-k8s:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f k8s-deployment.yaml
	@echo "✓ Deployment complete!"

db-backup:
	@echo "Creating database backup..."
	mkdir -p backups
	docker exec n8n-mongodb mongodump --out=backups/$$(date +%Y%m%d_%H%M%S)
	@echo "✓ Backup created!"

db-restore:
	@echo "Restoring database..."
	@echo "Available backups:"
	@ls -d backups/*/ | head -5
	docker exec n8n-mongodb mongorestore --dir=$${BACKUP}
	@echo "✓ Restore complete!"

status:
	@echo "Service Status:"
	@docker-compose ps

health:
	@echo "Checking health..."
	@curl -s http://localhost:5678/health | jq .
	@echo "✓ n8n is healthy!"

import-workflows:
	npm run import-workflows

export-workflows:
	npm run export-workflows

db-shell:
	docker exec -it n8n-mongodb mongosh

ps:
	docker-compose ps

stats:
	docker stats

info:
	@echo "Document Processing Module - Information"
	@echo ""
	@echo "n8n: http://localhost:5678"
	@echo "Grafana: http://localhost:3000"
	@echo "Prometheus: http://localhost:9090"
	@echo "MongoDB: mongodb://admin:password@localhost:27017"
	@echo ""
	@echo "Configured Document Types:"
	@echo "  - Invoice"
	@echo "  - Contract"
	@echo "  - Report"
	@echo "  - Letter"
	@echo "  - Form"
	@echo ""
	@echo "Workflows:"
	@echo "  - Document Processor API"
	@echo "  - Document Processor UI"
	@echo "  - Document Analyzer"
	@echo "  - Document Transformer"
	@echo "  - Invoice Generator"