#!/usr/bin/env node

/**
 * SCRIPT DE BACKUP DO POSTGRESQL
 * 
 * Cria backup do banco using pg_dump
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const backupDir = path.join(__dirname, '..', 'backups');
const dbName = process.env.DB_NAME || 'plataforma_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';

async function createBackup() {
    console.log('='.repeat(60));
    console.log('  BACKUP DO POSTGRESQL');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Criar diretório de backups se não existir
        await fs.mkdir(backupDir, { recursive: true });

        // Nome do arquivo de backup
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupFile = path.join(backupDir, `backup_${dbName}_${timestamp}.sql`);
        const compressedFile = `${backupFile}.gz`;

        console.log(`Criando backup do banco '${dbName}'...`);
        console.log(`Arquivo: ${path.basename(backupFile)}`);
        console.log('');

        // Executar pg_dump
        const pgDumpCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F p -f "${backupFile}" ${dbName}`;

        // Configurar senha via variável de ambiente
        const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };

        await execAsync(pgDumpCmd, { env });
        console.log('✓ Backup SQL criado');

        // Comprimir backup
        console.log('Comprimindo backup...');
        const gzipCmd = process.platform === 'win32'
            ? `powershell -Command "Compress-Archive -Path '${backupFile}' -DestinationPath '${backupFile}.zip'"`
            : `gzip "${backupFile}"`;

        try {
            await execAsync(gzipCmd);
            console.log(`✓ Backup comprimido`);

            // Remover arquivo não comprimido no Linux (gzip já faz isso)
            if (process.platform === 'win32') {
                await fs.unlink(backupFile);
            }
        } catch (error) {
            console.log('⚠ Compressão falhou, backup SQL mantido sem compressão');
        }

        // Listar backups existentes
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(f => f.startsWith('backup_') && (f.endsWith('.sql') || f.endsWith('.gz') || f.endsWith('.zip')));

        console.log('');
        console.log(`Backups existentes: ${backupFiles.length}`);

        // Manter apenas últimos 7 backups
        if (backupFiles.length > 7) {
            console.log('Removendo backups antigos (mantendo últimos 7)...');

            // Ordenar por data de modificação
            const fileStats = await Promise.all(
                backupFiles.map(async (file) => ({
                    name: file,
                    mtime: (await fs.stat(path.join(backupDir, file))).mtime
                }))
            );

            fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

            // Remover backups mais antigos
            const toRemove = fileStats.slice(7);
            for (const file of toRemove) {
                await fs.unlink(path.join(backupDir, file.name));
                console.log(`  Removido: ${file.name}`);
            }
        }

        console.log('');
        console.log('='.repeat(60));
        console.log('  BACKUP CONCLUÍDO COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('');

    } catch (error) {
        console.error('\n✗ Erro ao criar backup:', error.message);
        console.error('');
        console.error('Certifique-se de que:');
        console.error('1. PostgreSQL está instalado e pg_dump está no PATH');
        console.error('2. As credenciais no .env estão corretas');
        console.error('3. O usuário tem permissão para fazer backup');
        console.error('');
        process.exit(1);
    }
}

createBackup();
