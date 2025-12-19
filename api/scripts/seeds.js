#!/usr/bin/env node

/**
 * SEEDS - DADOS INICIAIS
 * 
 * Popula o banco com dados iniciais necessários
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'plataforma_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

// Hash SHA-256 de "senha123"
// Calculado: crypto.createHash('sha256').update('senha123').digest('hex')
const DEFAULT_PASSWORD_HASH = '55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251';

async function seedUsers(client) {
    console.log('Criando usuários padrão...');

    const users = [
        { name: 'Admin User', email: 'admin@tjgo.jus.br', role: 'ADMIN' },
        { name: 'Gestor User', email: 'gestor@tjgo.jus.br', role: 'MANAGER' },
        { name: 'Visualizador User', email: 'viewer@tjgo.jus.br', role: 'VIEWER' },
    ];

    for (const user of users) {
        try {
            await client.query(
                `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         ON CONFLICT (email) DO NOTHING`,
                [user.name, user.email, DEFAULT_PASSWORD_HASH, user.role]
            );
            console.log(`  ✓ ${user.name} (${user.email})`);
        } catch (error) {
            console.log(`  ✗ Erro ao criar ${user.email}:`, error.message);
        }
    }
}

async function seedObjectives(client) {
    console.log('\nCriando objetivos de exemplo (SGJT)...');

    const objectives = [
        {
            code: 'Objetivo 1',
            title: 'Orquestrar a Integração Estratégica entre áreas Judiciárias e Tecnológicas',
            description: 'Potencializando a entrega de valor aos usuários do PJGO.',
            directorate: 'SGJT'
        },
        {
            code: 'Objetivo 2',
            title: 'Desenvolver Pessoas e Ampliar a Capacidade de TI',
            description: 'Investir em capacitação e ampliação da equipe de TI.',
            directorate: 'SGJT'
        }
    ];

    for (const obj of objectives) {
        try {
            const result = await client.query(
                `INSERT INTO objectives (code, title, description, directorate_code)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
                [obj.code, obj.title, obj.description, obj.directorate]
            );
            console.log(`  ✓ ${obj.code}`);

            // Adicionar KRs de exemplo para o primeiro objetivo
            if (obj.code === 'Objetivo 1') {
                await client.query(
                    `INSERT INTO key_results (objective_id, code, description, status, deadline, directorate_code)
           VALUES ($1, 'KR 1.1', 'Diretrizes e atos de institucionalização formalizados', 'CONCLUIDO', '07/2025', 'SGJT')`,
                    [result.rows[0].id]
                );

                await client.query(
                    `INSERT INTO key_results (objective_id, code, description, status, deadline, directorate_code)
           VALUES ($1, 'KR 1.2', 'Carteira de 9 iniciativas priorizadas', 'EM_ANDAMENTO', '12/2025', 'SGJT')`,
                    [result.rows[0].id]
                );

                console.log(`    ✓ 2 Key Results adicionados`);
            }
        } catch (error) {
            console.log(`  ✗ Erro ao criar ${obj.code}:`, error.message);
        }
    }
}

async function seedPrograms(client) {
    console.log('\nCriando programas estratégicos...');

    const programs = [
        {
            name: 'CONECTA JUD',
            description: 'Aproximação DPE e DJUD das Unidades Judiciárias',
            directorate: 'SGJT'
        },
        {
            name: 'CONEXÃO TI',
            description: 'Aproximação TI – Usuários',
            directorate: 'SGJT'
        },
        {
            name: 'SINERGIA TEC-JUD',
            description: 'Aproximação entre as áreas tecnológicas e judiciárias',
            directorate: 'SGJT'
        }
    ];

    for (const program of programs) {
        try {
            const result = await client.query(
                `INSERT INTO programs (name, description, directorate_code)
         VALUES ($1, $2, $3)
         RETURNING id`,
                [program.name, program.description, program.directorate]
            );
            console.log(`  ✓ ${program.name}`);

            // Adicionar iniciativa de exemplo
            if (program.name === 'CONECTA JUD') {
                await client.query(
                    `INSERT INTO program_initiatives (program_id, title, board_status, priority, directorate_code)
           VALUES ($1, 'Visitas técnicas às unidades judiciárias', 'FEITO', 'SIM', 'SGJT')`,
                    [result.rows[0].id]
                );
                console.log(`    ✓ 1 iniciativa adicionada`);
            }
        } catch (error) {
            console.log(`  ✗ Erro ao criar ${program.name}:`, error.message);
        }
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('  POPULANDO DADOS INICIAIS (SEEDS)');
    console.log('='.repeat(60));
    console.log('');
    console.log('CREDENCIAIS PADRÃO:');
    console.log('  Email: admin@tjgo.jus.br | gestor@tjgo.jus.br | viewer@tjgo.jus.br');
    console.log('  Senha: senha123');
    console.log('');

    const client = await pool.connect();

    try {
        // Seed usuários
        await client.query('BEGIN');
        await seedUsers(client);
        await client.query('COMMIT');
        
        // Seed objetivos (com tratamento de erro)
        try {
            await client.query('BEGIN');
            await seedObjectives(client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.log('  ⚠️  Alguns objetivos já existem (ignorando)');
        }
        
        // Seed programas (com tratamento de erro)
        try {
            await client.query('BEGIN');
            await seedPrograms(client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.log('  ⚠️  Alguns programas já existem (ignorando)');
        }

        console.log('');
        console.log('='.repeat(60));
        console.log('  SEEDS EXECUTADOS COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Você pode agora:');
        console.log('1. Fazer login com admin@tjgo.jus.br / senha123');
        console.log('2. Iniciar o servidor com: npm run dev');
        console.log('');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n✗ Erro ao executar seeds:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
