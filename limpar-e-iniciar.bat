@echo off
echo Parando qualquer servico do EventSphere...
taskkill /F /IM java.exe 2>nul

echo Resetando o banco de dados...
echo Por favor, aguarde. Isso pode levar alguns instantes...
mysql -u root -p1234 < reset_database.sql

echo.
echo Banco de dados recriado com sucesso!
echo.
echo Iniciando o EventSphere com o banco de dados limpo...
cd backend\EventSphere
call mvnw spring-boot:run
