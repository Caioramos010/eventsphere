@echo off
echo Stopping any running EventSphere services...
taskkill /F /IM java.exe 2>nul

echo Starting EventSphere application...
cd backend\EventSphere
call mvnw spring-boot:run
