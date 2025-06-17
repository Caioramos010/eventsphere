@echo off
title EventSphere - Setup Completo para Acesso Mobile
color 0B
echo ==============================================
echo   EventSphere - Setup Completo Mobile
echo ==============================================
echo.
echo Este script ira:
echo  ✅ Configurar firewall automaticamente
echo  ✅ Iniciar backend com acesso remoto
echo  ✅ Configurar e iniciar frontend para mobile
echo  ✅ Mostrar URLs para teste no celular
echo.
echo ⚠️  IMPORTANTE: Execute como ADMINISTRADOR
echo.
pause

echo.
echo 🔧 [1/5] Configurando firewall...

REM Configurar firewall
netsh advfirewall firewall delete rule name="EventSphere Backend" >nul 2>&1
netsh advfirewall firewall delete rule name="EventSphere Frontend" >nul 2>&1
netsh advfirewall firewall add rule name="EventSphere Backend" dir=in action=allow protocol=TCP localport=8080 >nul 2>&1
netsh advfirewall firewall add rule name="EventSphere Backend Out" dir=out action=allow protocol=TCP localport=8080 >nul 2>&1
netsh advfirewall firewall add rule name="EventSphere Frontend" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
netsh advfirewall firewall add rule name="EventSphere Frontend Out" dir=out action=allow protocol=TCP localport=3000 >nul 2>&1

if errorlevel 1 (
    echo ❌ Nao foi possivel configurar firewall - Execute como administrador
    pause
    exit /b 1
) else (
    echo ✅ Firewall configurado com sucesso
)

echo.
echo 🌐 [2/5] Obtendo informacoes de rede...

REM Obter IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%i
    goto :found
)
:found
set LOCAL_IP=%LOCAL_IP: =%

echo ✅ IP Local encontrado: %LOCAL_IP%

echo.
echo 🚀 [3/5] Iniciando backend...
echo.
cd /d "%~dp0backend\EventSphere"
start "EventSphere Backend" cmd /k "echo Backend iniciado em %LOCAL_IP%:8080 && mvnw.cmd spring-boot:run"

echo ⏳ Aguardando backend inicializar...
timeout /t 15 /nobreak >nul

echo.
echo 🌐 [4/5] Testando conectividade do backend...
curl -s -o NUL -w "Status: %%{http_code}\n" http://localhost:8080/api/health 2>NUL
if errorlevel 1 (
    echo ❌ Backend nao respondeu - verifique se iniciou corretamente
) else (
    echo ✅ Backend respondendo
)

echo.
echo 🎨 [5/5] Iniciando frontend...
echo.
cd /d "%~dp0frontend"

REM Configurar variavel de ambiente para o frontend
set REACT_APP_API_URL=http://%LOCAL_IP%:8080
set HOST=%LOCAL_IP%

echo ✅ Frontend configurado para usar backend em: %REACT_APP_API_URL%
echo ✅ Frontend sera acessivel em: http://%LOCAL_IP%:3000

start "EventSphere Frontend" cmd /k "echo Frontend iniciado em %LOCAL_IP%:3000 && npm start"

echo.
echo 📱 CONFIGURACAO CONCLUIDA!
echo.
echo 🔗 URLs para testar no celular:
echo    Backend Health: http://%LOCAL_IP%:8080/api/health
echo    Backend Ping:   http://%LOCAL_IP%:8080/api/ping
echo    Backend Test:   http://%LOCAL_IP%:8080/api/test
echo    Frontend:       http://%LOCAL_IP%:3000
echo.
echo 📋 PASSOS PARA TESTE NO CELULAR:
echo    1. Conecte o celular na mesma rede WiFi
echo    2. Abra o navegador do celular
echo    3. Digite uma das URLs acima
echo    4. O frontend deve carregar normalmente
echo.
echo ⚠️  Se nao funcionar:
echo    1. Verifique se o celular esta na mesma rede
echo    2. Teste as URLs de health primeiro
echo    3. Desative temporariamente antivirus/firewall
echo    4. Reinicie o roteador se necessario
echo.
echo 🛑 Para parar os servidores: Feche as janelas do backend e frontend
echo.
pause
