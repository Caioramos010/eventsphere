# Stop any running EventSphere services
Write-Host "Stopping any running EventSphere services..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start EventSphere application
Write-Host "Starting EventSphere application..." -ForegroundColor Green
Set-Location -Path "backend\EventSphere"
& .\mvnw.cmd spring-boot:run
