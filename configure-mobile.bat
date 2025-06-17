@echo off
title EventSphere - Configurador para Acesso Mobile
color 0A
echo ============================================
echo   EventSphere - Configurador Mobile
echo ============================================
echo.

REM Obter IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%i
    goto :found
)
:found
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 IP Local detectado: %LOCAL_IP%
echo.
echo 🔧 Configurando frontend para acesso mobile...

REM Navegar para pasta do frontend
cd /d "%~dp0..\frontend"

REM Criar arquivo .env com IP local
echo REACT_APP_API_URL=http://%LOCAL_IP%:8080 > .env

echo ✅ Arquivo .env criado com sucesso!
echo.
echo 📋 Configuração aplicada:
echo    REACT_APP_API_URL=http://%LOCAL_IP%:8080
echo.
echo 🚀 Agora execute o frontend:
echo    npm start
echo.
echo 📱 URLs para acesso no celular:
echo    Frontend: http://%LOCAL_IP%:3000
echo    Backend:  http://%LOCAL_IP%:8080
echo.
echo ⚠️  IMPORTANTE: 
echo    - Certifique-se que o celular está na mesma rede WiFi
echo    - Se ainda não funcionar, desabilite firewall temporariamente
echo.
pause

echo.
echo 🚀 Iniciando frontend com configuração mobile...
npm start
