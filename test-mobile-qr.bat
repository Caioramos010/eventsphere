@echo off
echo ========================================
echo EventSphere - Teste Mobile QR Scanner
echo ========================================
echo.

REM Detectar IP da máquina
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set LOCAL_IP=%%j
        goto :found_ip
    )
)

:found_ip
echo IP da máquina: %LOCAL_IP%
echo.

echo Testando conectividade do backend...
curl -s -o nul -w "Backend status: %%{http_code}\n" http://%LOCAL_IP%:8080/api/health

echo.
echo URLs para teste no dispositivo móvel:
echo.
echo 1. Debug de Câmera (NOVO):
echo    http://%LOCAL_IP%:3000/camera-debug
echo.
echo 2. Teste de Câmera (HTML):
echo    http://%LOCAL_IP%:3000/camera-test.html
echo.
echo 3. QR Scanner (após login):
echo    http://%LOCAL_IP%:3000/event/[ID_DO_EVENTO]/qr-scanner
echo.
echo 4. Login no sistema:
echo    http://%LOCAL_IP%:3000/login
echo.

echo Instruções para teste:
echo 1. Conecte o dispositivo móvel na mesma rede WiFi
echo 2. Abra o navegador mobile e acesse a URL de teste de câmera
echo 3. Clique em "Testar Acesso à Câmera"
echo 4. Verifique se a câmera abre corretamente
echo 5. Se funcionar, teste o QR Scanner no sistema
echo.

echo Problemas comuns:
echo - HTTPS pode ser necessário em dispositivos móveis
echo - Verifique permissões de câmera no navegador
echo - Teste em diferentes navegadores (Chrome, Safari, Firefox)
echo - Certifique-se que a câmera não está em uso por outro app
echo.

echo Pressione qualquer tecla para sair...
pause >nul
