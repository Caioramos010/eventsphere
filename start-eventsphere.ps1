# Stop any running EventSphere services
Write-Host "Stopping any running EventSphere services..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Reset database
Write-Host "Resetting EventSphere database..." -ForegroundColor Yellow
$mysqlCmd = "mysql"
$user = "root"
$password = "1234"
$sqlFile = "reset_database.sql"

# Execute SQL script to reset database
Write-Host "Executing SQL script to drop and recreate the database..." -ForegroundColor Yellow
Get-Content $sqlFile | & $mysqlCmd -u$user -p$password

Write-Host "Database reset successfully!" -ForegroundColor Green

# Start EventSphere application
Write-Host "Starting EventSphere application with clean database..." -ForegroundColor Green
Set-Location -Path "backend\EventSphere"
& .\mvnw.cmd spring-boot:run
