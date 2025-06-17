@echo off
title EventSphere - Teste de Conectividade Mobile
echo ========================================
echo   EventSphere - Teste Mobile
echo ========================================
echo.

REM Obter IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%i
    goto :found
)
:found
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 IP Local da maquina: %LOCAL_IP%
echo.

echo 🔍 Testando endpoints de saude (nao precisam autenticacao)...
echo.

echo Testando /api/health...
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/api/health | findstr "Status:"
echo.

echo Testando /api/ping...
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/api/ping | findstr "Status:"
echo.

echo Testando /api/test...
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/api/test | findstr "Status:"
echo.

echo 🔍 Testando via IP local...
echo.

echo Testando /api/health via IP...
curl -s -w "Status: %%{http_code}\n" http://%LOCAL_IP%:8080/api/health | findstr "Status:"
echo.

echo 📱 TESTE NO CELULAR:
echo.
echo 1. Conecte o celular na mesma rede WiFi
echo 2. Abra o navegador do celular
echo 3. Digite exatamente estas URLs:
echo.
echo    ✅ http://%LOCAL_IP%:8080/api/health
echo    ✅ http://%LOCAL_IP%:8080/api/ping  
echo    ✅ http://%LOCAL_IP%:8080/api/test
echo.
echo 4. Voce deve ver uma resposta JSON em cada URL
echo.
echo 5. Para testar o frontend completo:
echo    ✅ http://%LOCAL_IP%:3000
echo    (Configure REACT_APP_API_URL=http://%LOCAL_IP%:8080 antes)
echo.
echo 🔧 Se nao funcionar, execute como administrador:
echo    netsh advfirewall firewall add rule name="EventSphere" dir=in action=allow protocol=TCP localport=8080
echo.

pause
