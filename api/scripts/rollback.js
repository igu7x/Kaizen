#!/usr/bin/env node

/**
 * ROLLBACK - RESTAURAR DO BACKUP JSON
 * 
 * Script emergencial para restaurar dados do backup JSON
 * Usar apenas em caso de problemas críticos
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function listBackups() {
    const backupParentDir = path.join(__dirname, '..');
    const allEntries = await fs.readdir(backupParentDir);

    const backupDirs = [];
    for (const entry of allEntries) {
        if (entry.startsWith('backup_json_')) {
            const stats = await fs.stat(path.join(backupParentDir, entry));
            if (stats.isDirectory()) {
                backupDirs.push({
                    name: entry,
                    path: path.join(backupParentDir, entry),
                    mtime: stats.mtime
                });
            }
        }
    }

    // Ordenar por data (mais recente primeiro)
    backupDirs.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    return backupDirs;
}

async function main() {
    console.log('='.repeat(60));
    console.log('  ROLLBACK - RESTAURAR DO BACKUP JSON');
    console.log('='.repeat(60));
    console.log('');
    console.log('⚠️  ATENÇÃO: Este é um script EMERGENCIAL!');
    console.log('');
    console.log('Este script irá:');
    console.log('1. Listar backups JSON disponíveis');
    console.log('2. Permitir que você escolha qual backup restaurar');
    console.log('3. Copiar arquivos do backup para uso');
    console.log('');
    console.log('NOTA: Este script NÃO modifica o PostgreSQL.');
    console.log('      Ele apenas recupera os arquivos JSON originais.');
    console.log('');

    try {
        // Listar backups
        const backups = await listBackups();

        if (backups.length === 0) {
            console.log('✗ Nenhum backup JSON encontrado.');
            console.log('');
            console.log('Backups são criados automaticamente ao executar a migração.');
            console.log('');
            process.exit(1);
        }

        console.log('Backups disponíveis:');
        console.log('');

        backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup.name}`);
            console.log(`   Criado em: ${backup.mtime.toLocaleString('pt-BR')}`);
            console.log('');
        });

        // Perguntar qual backup restaurar
        const choice = await rl.question('Escolha o número do backup para restaurar (ou 0 para cancelar): ');
        const choiceNum = parseInt(choice);

        if (choiceNum === 0 || isNaN(choiceNum) || choiceNum < 0 || choiceNum > backups.length) {
            console.log('');
            console.log('Operação cancelada.');
            console.log('');
            process.exit(0);
        }

        const selectedBackup = backups[choiceNum - 1];

        // Confirmar
        console.log('');
        console.log(`Você selecionou: ${selectedBackup.name}`);
        console.log('');

        const confirm = await rl.question('Confirma a restauração? (sim/não): ');

        if (confirm.toLowerCase() !== 'sim') {
            console.log('');
            console.log('Operação cancelada.');
            console.log('');
            process.exit(0);
        }

        // Restaurar
        console.log('');
        console.log('Restaurando...');

        const backupFile = path.join(selectedBackup.path, 'localStorage_backup.json');
        const targetDir = path.join(__dirname, '..', 'data');
        const targetFile = path.join(targetDir, 'localStorage_restored.json');

        // Criar diretório data se não existir
        await fs.mkdir(targetDir, { recursive: true });

        // Copiar arquivo
        await fs.copyFile(backupFile, targetFile);

        console.log('');
        console.log('✓ Backup restaurado com sucesso!');
        console.log('');
        console.log(`Arquivo: ${targetFile}`);
        console.log('');
        console.log('Próximos passos:');
        console.log('1. Renomear o arquivo restaurado se necessário');
        console.log('2. Ou exportar novamente para o frontend');
        console.log('');

    } catch (error) {
        console.error('\n✗ Erro durante rollback:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
