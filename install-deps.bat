@echo off
echo Installing FutureReady Dependencies...

echo.
echo Installing Frontend Dependencies...
cd frontend
npm install
cd ..

echo.
echo Installing Backend Dependencies...
cd backend
npm install
cd ..

echo.
echo Installing Python AI Service Dependencies...
cd backend\python-ai-service
pip install -r requirements.txt
cd ..\..

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Set up your environment variables (.env files)
echo 2. Run start-dev.bat to start all services
echo.
pause
