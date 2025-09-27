@echo off
echo Starting AI Startup Analyst Application...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python main.py"
cd ..

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:7680
echo Frontend: http://localhost:3000
echo.
pause