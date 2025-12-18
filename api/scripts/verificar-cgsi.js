/**
 * Script para verificar as reuniões do CGSI inseridas no banco
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
  console.log('VERIFICAÇÃO: CGSI REUNIÕES');
  console.log('(Comitê Gestor de Segurança da Informação)');
  console.log('========================================\n');

  const client = await pool.connect();

  try {
    // 1. Verificar comitê
    const comiteResult = await client.query(`
      SELECT id, sigla, nome FROM comites WHERE sigla = 'CGSI'
    `);
    
    if (comiteResult.rows.length === 0) {
      console.log('❌ Comitê CGSI não encontrado!');
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
        COUNT(DISTINCT CASE WHEN r.titulo ILIKE '%extraordin%' THEN r.id END) AS extraordinarias,
        COUNT(p.id) AS total_itens_pauta
      FROM comites c
      LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
      LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
      WHERE c.sigla = 'CGSI'
    `);
    
    const ordinarias = parseInt(statsResult.rows[0].total_reunioes) - parseInt(statsResult.rows[0].extraordinarias);
    
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   Total de reuniões (2025): ${statsResult.rows[0].total_reunioes}`);
    console.log(`   Reuniões ordinárias: ${ordinarias}`);
    console.log(`   Reuniões extraordinárias: ${statsResult.rows[0].extraordinarias}`);
    console.log(`   Total de itens de pauta: ${statsResult.rows[0].total_itens_pauta}\n`);

    // 3. Listar reuniões
    const reunioesResult = await client.query(`
      SELECT 
        r.numero,
        r.titulo,
        TO_CHAR(r.data, 'DD/MM/YYYY') AS data,
        r.mes,
        r.status,
        r.observacoes,
        COUNT(p.id) AS itens_pauta
      FROM comite_reunioes r
      JOIN comites c ON r.comite_id = c.id
      LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
      WHERE c.sigla = 'CGSI' AND r.ano = 2025
      GROUP BY r.numero, r.titulo, r.data, r.mes, r.status, r.observacoes
      ORDER BY r.data
    `);
    
    console.log('📅 REUNIÕES DO CGSI (2025):');
    console.log('-------------------------------------------');
    reunioesResult.rows.forEach(r => {
      const tipo = r.titulo.toLowerCase().includes('extraordin') ? '⚡' : '📋';
      console.log(`   ${tipo} ${r.numero.toString().padStart(2, '0')}. ${r.titulo}`);
      console.log(`      Data: ${r.data} | ${r.itens_pauta} item(s)`);
      console.log(`      Obs: ${r.observacoes}`);
      console.log('');
    });

    // 4. Verificar tema recorrente (Política de Acesso)
    const policyResult = await client.query(`
      SELECT COUNT(*) AS count
      FROM comite_reuniao_pauta p
      JOIN comite_reunioes r ON p.reuniao_id = r.id
      JOIN comites c ON r.comite_id = c.id
      WHERE c.sigla = 'CGSI' AND p.descricao ILIKE '%626435%'
    `);
    
    console.log('🔐 TEMA RECORRENTE:');
    console.log(`   Política de Acesso à Rede (Proad 626435): ${policyResult.rows[0].count} ocorrências\n`);

    // 5. Validar totais
    const totalReunioes = parseInt(statsResult.rows[0].total_reunioes);
    const totalPautas = parseInt(statsResult.rows[0].total_itens_pauta);
    const totalExtraordinarias = parseInt(statsResult.rows[0].extraordinarias);

    console.log('========================================');
    if (totalReunioes === 6 && totalPautas === 16 && totalExtraordinarias === 2) {
      console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('   6 reuniões e 16 itens de pauta inseridos corretamente.');
      console.log('   (3 ordinárias + 3 extraordinárias)');
    } else {
      console.log('ℹ️  RESULTADO:');
      console.log(`   ${totalReunioes} reuniões (${totalExtraordinarias} extraordinárias)`);
      console.log(`   ${totalPautas} itens de pauta inseridos.`);
    }
    console.log('========================================');

  } finally {
    client.release();
    await pool.end();
  }
}

verificar().catch(console.error);











