@echo off
echo Starting FutureReady Development Environment...

echo.
echo Starting Node.js Backend (Port 3001)...
start "Node.js Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Starting Python AI Service (Port 8000)...
start "Python AI Service" cmd /k "cd backend\python-ai-service && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services are starting up...
echo.
echo Frontend: http://localhost:5173
echo Node.js Backend: http://localhost:3001
echo Python AI Service: http://localhost:8000
echo.
echo Press any key to exit...
pause > nul
