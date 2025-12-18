@echo off
echo.
echo ========================================
echo   Reiniciando servidor de desenvolvimento
echo ========================================
echo.

echo 1. Encerrando processos Node.js antigos...
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo    Processos encerrados com sucesso!
) else (
    echo    Nenhum processo Node.js em execucao.
)

echo.
echo 2. Ativando configuracao LOCAL...
call use-local.bat

echo.
echo 3. Iniciando servidor...
npm run dev
















