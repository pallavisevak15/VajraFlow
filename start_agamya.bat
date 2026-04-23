@echo off
echo ===================================================
echo   AGAMYA SUPPLY CHAIN - STARTUP SCRIPT
echo ===================================================

echo [1/4] Installing Backend Dependencies...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    pause
    exit /b %errorlevel%
)

echo [3/4] Starting Backend Server (New Window)...
start cmd /k "cd ..\backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [4/4] Starting Frontend Server...
echo Your app will be available at http://localhost:5173
npm run dev

pause
