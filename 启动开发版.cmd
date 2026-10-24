@echo off
setlocal
cd /d "%~dp0"
call npm start
if errorlevel 1 pause
