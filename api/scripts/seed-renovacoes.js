import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'plataforma_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const renovacoes = [
  {
    item_pca: 'PCA 236',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'X DIGITAL BRASIL LTDA',
    objeto: 'Renovação do contrato de fornecimento de 2 (dois) certificados digitais SSL, do tipo "wildcard" OV e do tipo A1 para computadores servidores com a finalidade de atender às necessidades atualmente demandadas.',
    valor_anual: 9434.70,
    data_estimada_contratacao: 'Maio',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 237',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'OI S/A',
    objeto: 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
    valor_anual: 2571660.00,
    data_estimada_contratacao: 'Julho',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 238',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'VALE DO RIBEIRA INTERNET LTDA',
    objeto: 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
    valor_anual: 18320.40,
    data_estimada_contratacao: 'Agosto',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 239',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'BRFIBRA TELECOMUNICAÇÕES LTDA',
    objeto: 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
    valor_anual: 3390949.42,
    data_estimada_contratacao: 'Julho',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 240',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'RD TELECOM LTDA',
    objeto: 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
    valor_anual: 557542.94,
    data_estimada_contratacao: 'Julho',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 241',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'CIRION TECHNOLOGIES DO BRASIL LTDA',
    objeto: 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
    valor_anual: 1369658.30,
    data_estimada_contratacao: 'Julho',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 242',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'KTREE PENSO LTDA',
    objeto: 'Renovação do contrato de fornecimento de licenças de software de e-mail Zimbra, com disponibilização de ambiente de homologação (HML) e treinamento.',
    valor_anual: 388202.79,
    data_estimada_contratacao: 'Setembro',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 243',
    area_demandante: 'CITEC',
    gestor_demandante: 'Adail Antônio Pinto Junior',
    contratada: 'NIVA TECNOLOGIA LTDA',
    objeto: 'Renovação do contrato de serviço de suporte e subscrição de licenças de Inteligência Artificial e solução de Business Intelligence.',
    valor_anual: 1659777.00,
    data_estimada_contratacao: 'Dezembro',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 255',
    area_demandante: 'CSTI',
    gestor_demandante: 'Marcus Vinicius Gonzaga Ferreira',
    contratada: 'DISRUPTEC BRASIL S/A',
    objeto: 'Renovação do contrato de fornecimento de plataforma em nuvem para detecção e remediação de ameaças cibernéticas.',
    valor_anual: 1828260.02,
    data_estimada_contratacao: 'Janeiro',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 256',
    area_demandante: 'CSTI',
    gestor_demandante: 'Marcus Vinicius Gonzaga Ferreira',
    contratada: 'GLOBALWEB S/A',
    objeto: 'Renovação do contrato de prestação de serviços de suporte às equipes de gestão técnica dos sistemas informatizados, envolvendo as soluções de redes, bancos de dados, storage, backup, virtualização e cloud computing.',
    valor_anual: 10917500.00,
    data_estimada_contratacao: 'Fevereiro',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 264',
    area_demandante: 'CES',
    gestor_demandante: 'Wilana Carlos da Silva',
    contratada: 'MLV PRODUTOS E SERV. EM TECNOLOGIA',
    objeto: 'Renovação do contrato de gestão de processos de desenvolvimento e manutenção de sistemas.',
    valor_anual: 200590.00,
    data_estimada_contratacao: 'Agosto',
    status: 'Não Iniciada'
  },
  {
    item_pca: 'PCA 272',
    area_demandante: 'SGJT',
    gestor_demandante: 'Gustavo Machado do Prado Dias Maciel',
    contratada: 'UFG',
    objeto: 'Contratação de serviços destinados à realização do Programa de Residência em Tecnologia da Informação e Comunicação (TIC) para o Poder Judiciário de Goiás.',
    valor_anual: 8355274.08,
    data_estimada_contratacao: 'Dezembro',
    status: 'Não Iniciada'
  }
];

const checklistItems = [
  { nome: 'DOD', ordem: 1 },
  { nome: 'ETP', ordem: 2 },
  { nome: 'TR', ordem: 3 },
  { nome: 'MGR', ordem: 4 },
  { nome: 'Análise de mercado', ordem: 5 },
  { nome: 'Distribuição orçamentária', ordem: 6 }
];

async function seedRenovacoes() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando seed de Renovações...\n');
    
    await client.query('BEGIN');
    
    // Deletar renovações existentes e seus dados relacionados
    console.log('🗑️  Limpando dados existentes...');
    await client.query("DELETE FROM pca_checklist_items WHERE tipo = 'renovacao'");
    await client.query("DELETE FROM pca_item_details WHERE tipo = 'renovacao'");
    await client.query("DELETE FROM pca_tarefas WHERE tipo = 'renovacao'");
    await client.query("DELETE FROM pca_pontos_controle WHERE tipo = 'renovacao'");
    await client.query("DELETE FROM pca_renovacoes");
    
    // Inserir renovações
    console.log('📝 Inserindo 12 renovações...');
    for (const renovacao of renovacoes) {
      const result = await client.query(
        `INSERT INTO pca_renovacoes (
          item_pca, area_demandante, gestor_demandante, contratada, objeto,
          valor_anual, data_estimada_contratacao, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          renovacao.item_pca,
          renovacao.area_demandante,
          renovacao.gestor_demandante,
          renovacao.contratada,
          renovacao.objeto,
          renovacao.valor_anual,
          renovacao.data_estimada_contratacao,
          renovacao.status
        ]
      );
      
      const renovacaoId = result.rows[0].id;
      
      // Inserir details
      await client.query(
        `INSERT INTO pca_item_details (renovacao_id, tipo, validacao_dg_tipo, fase_atual)
         VALUES ($1, 'renovacao', 'Pendente', NULL)`,
        [renovacaoId]
      );
      
      // Inserir checklist
      for (const item of checklistItems) {
        await client.query(
          `INSERT INTO pca_checklist_items (renovacao_id, tipo, item_nome, item_ordem, status)
           VALUES ($1, 'renovacao', $2, $3, 'Não Iniciada')`,
          [renovacaoId, item.nome, item.ordem]
        );
      }
    }
    
    await client.query('COMMIT');
    
    console.log('✅ Seed executado com sucesso!\n');
    
    // Verificar resultados
    const renovacoesCount = await client.query('SELECT COUNT(*) FROM pca_renovacoes');
    console.log(`📊 Total de renovações: ${renovacoesCount.rows[0].count}`);
    
    const detailsCount = await client.query("SELECT COUNT(*) FROM pca_item_details WHERE tipo = 'renovacao'");
    console.log(`📊 Total de details: ${detailsCount.rows[0].count}`);
    
    const checklistCount = await client.query("SELECT COUNT(*) FROM pca_checklist_items WHERE tipo = 'renovacao'");
    console.log(`📊 Total de checklist items: ${checklistCount.rows[0].count}`);
    
    // Mostrar resumo por área
    const porArea = await client.query(`
      SELECT 
        area_demandante, 
        COUNT(*) as quantidade,
        SUM(valor_anual) as valor_total
      FROM pca_renovacoes
      GROUP BY area_demandante
      ORDER BY valor_total DESC
    `);
    
    console.log('\n📋 Resumo por área:');
    porArea.rows.forEach(row => {
      console.log(`   ${row.area_demandante}: ${row.quantidade} renovações, R$ ${Number(row.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    });
    
    // Total geral
    const total = await client.query('SELECT SUM(valor_anual) as total FROM pca_renovacoes');
    console.log(`\n💰 Valor total: R$ ${Number(total.rows[0].total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no seed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedRenovacoes()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha no seed:', error);
    process.exit(1);
  });

























