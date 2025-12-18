/**
 * Script para verificar as reuniões do CGOV-TIC inseridas no banco
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'plataforma_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 2,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

async function verificar() {
  console.log('========================================');
  console.log('VERIFICAÇÃO: CGOV-TIC REUNIÕES');
  console.log('========================================\n');

  const client = await pool.connect();

  try {
    // 1. Verificar comitê
    const comiteResult = await client.query(`
      SELECT id, sigla, nome FROM comites WHERE sigla = 'CGOV-TIC'
    `);
    
    if (comiteResult.rows.length === 0) {
      console.log('❌ Comitê CGOV-TIC não encontrado!');
      return;
    }
    
    console.log('✅ COMITÊ ENCONTRADO:');
    console.log(`   ID: ${comiteResult.rows[0].id}`);
    console.log(`   Sigla: ${comiteResult.rows[0].sigla}`);
    console.log(`   Nome: ${comiteResult.rows[0].nome}\n`);

    // 2. Contar reuniões e pautas
    const statsResult = await client.query(`
      SELECT 
        COUNT(DISTINCT r.id) AS total_reunioes,
        COUNT(p.id) AS total_itens_pauta
      FROM comites c
      LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
      LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
      WHERE c.sigla = 'CGOV-TIC'
    `);
    
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   Total de reuniões (2025): ${statsResult.rows[0].total_reunioes}`);
    console.log(`   Total de itens de pauta: ${statsResult.rows[0].total_itens_pauta}\n`);

    // 3. Listar reuniões
    const reunioesResult = await client.query(`
      SELECT 
        r.numero,
        r.titulo,
        TO_CHAR(r.data, 'DD/MM/YYYY') AS data,
        r.mes,
        r.status,
        COUNT(p.id) AS itens_pauta
      FROM comite_reunioes r
      JOIN comites c ON r.comite_id = c.id
      LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
      WHERE c.sigla = 'CGOV-TIC' AND r.ano = 2025
      GROUP BY r.numero, r.titulo, r.data, r.mes, r.status
      ORDER BY r.numero
    `);
    
    console.log('📅 REUNIÕES DO CGOV-TIC (2025):');
    console.log('-------------------------------------------');
    reunioesResult.rows.forEach(r => {
      console.log(`   ${r.numero}. ${r.titulo} | ${r.data} | ${r.status} | ${r.itens_pauta} item(s)`);
    });
    console.log('');

    // 4. Listar alguns itens de pauta como amostra
    const pautasResult = await client.query(`
      SELECT 
        r.numero AS reuniao_num,
        p.numero_item,
        SUBSTRING(p.descricao, 1, 80) AS descricao
      FROM comite_reuniao_pauta p
      JOIN comite_reunioes r ON p.reuniao_id = r.id
      JOIN comites c ON r.comite_id = c.id
      WHERE c.sigla = 'CGOV-TIC' AND r.ano = 2025
      ORDER BY r.numero, p.numero_item
      LIMIT 10
    `);
    
    console.log('📋 AMOSTRA DE ITENS DE PAUTA (primeiros 10):');
    console.log('-------------------------------------------');
    pautasResult.rows.forEach(p => {
      console.log(`   Reunião ${p.reuniao_num} - Item ${p.numero_item}: ${p.descricao}...`);
    });

    console.log('\n========================================');
    console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('========================================');

  } finally {
    client.release();
    await pool.end();
  }
}

verificar().catch(console.error);











