@echo off
echo.
echo ========================================
echo   🏠 Alternando para ambiente LOCAL
echo ========================================
echo.

if exist .env.local (
    copy /Y .env.local .env >nul
    echo ✓ Configuração LOCAL ativada!
    echo.
    echo Configurações:
    findstr "DB_HOST DB_NAME" .env
    echo.
    echo Agora você pode rodar: npm run dev
    echo.
) else (
    echo X Arquivo .env.local não encontrado!
    echo Crie o arquivo com suas credenciais locais.
    echo.
)
















