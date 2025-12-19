#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function fixPasswords() {
    console.log('Corrigindo senhas dos usuários...\n');

    // Hash correto de "senha123"
    const correctHash = crypto.createHash('sha256').update('senha123').digest('hex');
    console.log('Hash correto de "senha123":', correctHash);
    console.log('');

    try {
        const result = await pool.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email IN ('admin@tjgo.jus.br', 'gestor@tjgo.jus.br', 'viewer@tjgo.jus.br')
            RETURNING email, role
        `, [correctHash]);

        console.log(`✓ ${result.rows.length} usuários atualizados:`);
        result.rows.forEach(u => {
            console.log(`  - ${u.email} (${u.role})`);
        });

        console.log('\n✅ Senhas corrigidas com sucesso!');
        console.log('Agora você pode fazer login com:');
        console.log('  Email: admin@tjgo.jus.br | gestor@tjgo.jus.br | viewer@tjgo.jus.br');
        console.log('  Senha: senha123');

    } catch (error) {
        console.error('Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

fixPasswords();

