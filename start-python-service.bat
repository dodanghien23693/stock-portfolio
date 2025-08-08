@echo off
REM Script to start Python VNStock Service on Windows

echo Starting Python VNStock Service...

REM Check if virtual environment exists
if not exist "python-service\venv" (
    echo Creating virtual environment...
    cd python-service
    python -m venv venv
    cd ..
)

REM Activate virtual environment and install dependencies
echo Installing dependencies...
cd python-service
call venv\Scripts\activate

pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo Please update .env file with your database connection string
)

REM Start the service
echo Starting Python service on http://localhost:8001
python main.py

pause
