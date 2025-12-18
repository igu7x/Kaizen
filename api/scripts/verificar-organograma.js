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
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'plataforma_sgjt',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function verificar() {
  const client = await pool.connect();
  
  try {
    console.log('\n========================================');
    console.log('VERIFICAÇÃO DO ORGANOGRAMA');
    console.log('========================================\n');
    
    // Verificar registros por nível
    const niveis = await client.query(`
      SELECT 
        linha_organograma, 
        COUNT(*) as total,
        CASE linha_organograma
          WHEN 1 THEN 'Diretoria'
          WHEN 2 THEN 'Coordenadoria'
          WHEN 3 THEN 'Divisão'
          WHEN 4 THEN 'Núcleo'
          ELSE 'Outro'
        END as descricao
      FROM pessoas_organograma_gestores 
      WHERE ativo = TRUE 
      GROUP BY linha_organograma 
      ORDER BY linha_organograma
    `);
    
    console.log('📊 Registros por nível:');
    niveis.rows.forEach(r => {
      console.log(`   Nível ${r.linha_organograma} (${r.descricao}): ${r.total} registros`);
    });
    
    // Total
    const total = await client.query('SELECT COUNT(*) as total FROM pessoas_organograma_gestores WHERE ativo = TRUE');
    console.log(`\n✅ TOTAL: ${total.rows[0].total} registros\n`);
    
    // Verificar view
    const viewExists = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_views 
      WHERE viewname = 'pessoas_organograma_hierarquia'
    `);
    
    if (parseInt(viewExists.rows[0].count) > 0) {
      console.log('✓ View pessoas_organograma_hierarquia: OK');
      
      // Testar a view
      const viewData = await client.query('SELECT COUNT(*) as total FROM pessoas_organograma_hierarquia');
      console.log(`✓ View retorna ${viewData.rows[0].total} registros\n`);
    } else {
      console.log('✗ View pessoas_organograma_hierarquia: NÃO ENCONTRADA\n');
    }
    
    // Listar alguns registros
    console.log('📋 Amostra de registros:\n');
    const amostra = await client.query(`
      SELECT 
        linha_organograma, 
        nome_area, 
        nome_gestor, 
        nome_cargo 
      FROM pessoas_organograma_gestores 
      WHERE ativo = TRUE 
      ORDER BY linha_organograma, ordem_exibicao 
      LIMIT 5
    `);
    
    amostra.rows.forEach(r => {
      console.log(`   [Nível ${r.linha_organograma}] ${r.nome_area}`);
      console.log(`           ${r.nome_gestor} - ${r.nome_cargo}`);
    });
    
    console.log('\n========================================');
    console.log('✅ ORGANOGRAMA INSTALADO COM SUCESSO!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificar();







