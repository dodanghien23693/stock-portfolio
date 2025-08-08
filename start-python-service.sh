#!/bin/bash

# Script to start Python VNStock Service

echo "Starting Python VNStock Service..."

# Check if virtual environment exists
if [ ! -d "python-service/venv" ]; then
    echo "Creating virtual environment..."
    cd python-service
    python -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "Installing dependencies..."
cd python-service

# Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env file with your database connection string"
fi

# Start the service
echo "Starting Python service on http://localhost:8001"
python main.py
