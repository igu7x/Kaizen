import { query, pool } from '../config/database.js';
import crypto from 'crypto';

async function createAdminUser() {
    try {
        console.log('🔄 Criando usuário ADMIN...');

        const name = 'Administrador';
        const email = 'adm@adm.com';
        const password = 'senha123';
        const role = 'ADMIN';
        const status = 'ACTIVE';

        // Hash da senha (SHA-256)
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // Verificar se já existe
        const check = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('⚠️ Usuário já existe. Atualizando senha e permissões...');
            await query(
                'UPDATE users SET password_hash = $1, role = $2, status = $3 WHERE email = $4',
                [passwordHash, role, status, email]
            );
        } else {
            await query(
                `INSERT INTO users (name, email, password_hash, role, status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [name, email, passwordHash, role, status]
            );
        }

        console.log('✅ Usuário ADMIN criado/atualizado com sucesso!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password}`);

    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
    } finally {
        await pool.end();
    }
}

createAdminUser();
