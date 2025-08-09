# Makefile for VNStock Python Service

.PHONY: help install run test test-unit test-integration clean lint format

# Default target
help:
	@echo "Available commands:"
	@echo "  install          - Install dependencies"
	@echo "  run             - Run the service"
	@echo "  test            - Run all tests"
	@echo "  test-unit       - Run unit tests only"
	@echo "  test-integration - Run integration tests only"
	@echo "  clean           - Clean cache and temp files"
	@echo "  lint            - Run code linting"
	@echo "  format          - Format code"

# Install dependencies
install:
	pip install -r requirements.txt

# Run the service
run:
	python run.py

# Run all tests
test:
	pytest tests/ -v

# Run unit tests only
test-unit:
	pytest tests/test_*.py -v

# Run integration tests only  
test-integration:
	pytest tests/integration/ -v -m integration

# Clean cache and temp files
clean:
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name ".pytest_cache" -delete

# Code linting (if you want to add flake8 or similar)
lint:
	@echo "Linting not configured yet. Add flake8 or similar to requirements.txt"

# Code formatting (if you want to add black or similar)
format:
	@echo "Formatting not configured yet. Add black or similar to requirements.txt"
