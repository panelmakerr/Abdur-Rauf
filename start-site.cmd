@echo off
cd /d "%~dp0"
echo Starting Hospital Careers on http://localhost:3000 ...
echo (close this window to stop the server)
call npm run start
pause