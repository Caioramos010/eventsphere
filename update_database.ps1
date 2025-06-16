# Script to directly update the database schema
Write-Host "Updating database schema for photo columns..." -ForegroundColor Green

# Database connection settings
$mysqlCmd = "mysql"
$user = "root"
$password = "1234"
$database = "event_sphere"
$sqlFile = "update_photo_columns.sql"

# Execute the SQL file
Write-Host "Running SQL commands to increase column sizes..." -ForegroundColor Yellow
Get-Content $sqlFile | & $mysqlCmd -u$user -p$password $database

Write-Host "Database schema updated successfully!" -ForegroundColor Green
