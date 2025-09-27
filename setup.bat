@echo off
echo Setting up AI Startup Analyst Application...
echo.

echo Installing Frontend Dependencies...
npm install
echo.

echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo Setup complete! You can now run the application with start-app.bat
echo.
pause