@echo off
REM DLRMS Quick Start Script for Windows
REM This script helps you quickly start the DLRMS application

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Digital Land Records Management System (DLRMS)           ║
echo ║  Quick Start Script (Windows)                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo 📋 Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js !NODE_VERSION!

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm !NPM_VERSION!

echo.
echo 🔧 Setting up Backend...

REM Navigate to backend
cd backend

REM Install dependencies
if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo   Creating .env file...
    copy .env.example .env
    echo [OK] .env file created
    echo [NOTE] Please edit backend\.env with your configuration
) else (
    echo [OK] .env file exists
)

REM Navigate back
cd ..

echo.
echo 🎨 Setting up Frontend...

REM Navigate to frontend
cd frontend

REM Install dependencies
if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)

REM Navigate back
cd ..

echo.
echo [OK] Setup complete!
echo.
echo 📖 Next steps:
echo.
echo 1. Start MongoDB:
echo    - Open Services ^(services.msc^)
echo    - Find "MongoDB Server" and start it
echo.
echo 2. Start Backend Server ^(Command Prompt 1^):
echo    cd backend
echo    npm start
echo.
echo 3. Start Frontend Server ^(Command Prompt 2^):
echo    cd frontend
echo    npm start
echo.
echo 4. Open browser:
echo    http://localhost:3000
echo.
echo 5. Login with test account:
echo    Email: admin@dlrms.gov
echo    Password: admin123
echo.
echo 📚 For more information, see:
echo    - README.md - Project overview
echo    - docs\SETUP_GUIDE.md - Detailed setup instructions
echo    - docs\USER_GUIDE.md - How to use the system
echo.
pause
