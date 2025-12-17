@echo off
setlocal enabledelayedexpansion

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+ or 20+ first.
  exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo [2/3] Building EXE...
call npm run dist
if errorlevel 1 exit /b 1

echo [3/3] Done. Check the dist\ folder for the .exe installer.
pause
