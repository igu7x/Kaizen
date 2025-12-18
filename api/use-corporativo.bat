@echo off
echo.
echo ========================================
echo   🏢 Alternando para ambiente CORPORATIVO
echo ========================================
echo.

if exist .env.corporativo (
    copy /Y .env.corporativo .env >nul
    echo ✓ Configuração CORPORATIVO ativada!
    echo.
    echo Configurações:
    findstr "DB_HOST DB_NAME" .env
    echo.
    echo ATENÇÃO: Esta configuração é para DEPLOY
    echo Não rode localmente - você não tem acesso à rede corporativa.
    echo.
    echo Para deploy, faça:
    echo   git add .
    echo   git commit -m "sua mensagem"
    echo   git push
    echo.
) else (
    echo X Arquivo .env.corporativo não encontrado!
    echo.
)
















