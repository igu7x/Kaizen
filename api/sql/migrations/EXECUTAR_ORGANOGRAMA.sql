-- ===================================================================
-- EXECUTAR ESTE ARQUIVO DIRETAMENTE NO PGADMIN OU PSQL
-- ===================================================================
-- Arquivo: EXECUTAR_ORGANOGRAMA.sql
-- Copie e cole este conteúdo no Query Tool do pgAdmin
-- Ou execute via psql: \i EXECUTAR_ORGANOGRAMA.sql
-- ===================================================================

\echo '=========================================='
\echo 'CRIANDO MÓDULO ORGANOGRAMA'
\echo '=========================================='

-- ===================================================================
-- 1. TABELA: pessoas_organograma_gestores
-- ===================================================================
\echo ''
\echo '1. Criando tabela pessoas_organograma_gestores...'

CREATE TABLE IF NOT EXISTS pessoas_organograma_gestores (
  id SERIAL PRIMARY KEY,
  nome_area VARCHAR(255) NOT NULL,
  nome_gestor VARCHAR(255) NOT NULL,
  nome_cargo VARCHAR(255) NOT NULL,
  foto_gestor TEXT,
  linha_organograma INTEGER NOT NULL,
  subordinacao_id INTEGER REFERENCES pessoas_organograma_gestores(id),
  cor_barra VARCHAR(7),
  diretoria VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  ordem_exibicao INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  
  CONSTRAINT chk_linha_organograma CHECK (linha_organograma BETWEEN 1 AND 10)
);

\echo '   ✓ Tabela criada'

-- ===================================================================
-- 2. ÍNDICES
-- ===================================================================
\echo '2. Criando índices...'

CREATE INDEX IF NOT EXISTS idx_organograma_linha ON pessoas_organograma_gestores(linha_organograma);
CREATE INDEX IF NOT EXISTS idx_organograma_subordinacao ON pessoas_organograma_gestores(subordinacao_id);
CREATE INDEX IF NOT EXISTS idx_organograma_diretoria ON pessoas_organograma_gestores(diretoria);
CREATE INDEX IF NOT EXISTS idx_organograma_ativo ON pessoas_organograma_gestores(ativo);

\echo '   ✓ Índices criados'

-- ===================================================================
-- 3. COMENTÁRIOS
-- ===================================================================
\echo '3. Adicionando comentários...'

COMMENT ON TABLE pessoas_organograma_gestores IS 'Gestores e estrutura hierárquica do organograma';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_area IS 'Nome da área/unidade';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_gestor IS 'Nome do gestor responsável';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_cargo IS 'Cargo do gestor';
COMMENT ON COLUMN pessoas_organograma_gestores.linha_organograma IS 'Nível hierárquico (1=Diretoria, 2=Coordenadoria, 3=Divisão, 4=Núcleo)';
COMMENT ON COLUMN pessoas_organograma_gestores.subordinacao_id IS 'ID da área superior (NULL para linha 1)';

\echo '   ✓ Comentários adicionados'

-- ===================================================================
-- 4. VIEW HIERÁRQUICA
-- ===================================================================
\echo '4. Criando view pessoas_organograma_hierarquia...'

CREATE OR REPLACE VIEW pessoas_organograma_hierarquia AS
WITH RECURSIVE hierarquia AS (
  -- Nível 1: Diretorias (raiz)
  SELECT 
    id, nome_area, nome_gestor, nome_cargo, foto_gestor,
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
    ARRAY[id] AS caminho,
    nome_area AS caminho_texto
  FROM pessoas_organograma_gestores
  WHERE linha_organograma = 1 AND ativo = TRUE
  
  UNION ALL
  
  -- Níveis subsequentes
  SELECT 
    g.id, g.nome_area, g.nome_gestor, g.nome_cargo, g.foto_gestor,
    g.linha_organograma, g.subordinacao_id, g.cor_barra, g.diretoria, g.ordem_exibicao,
    h.caminho || g.id,
    h.caminho_texto || ' > ' || g.nome_area
  FROM pessoas_organograma_gestores g
  INNER JOIN hierarquia h ON g.subordinacao_id = h.id
  WHERE g.ativo = TRUE
)
SELECT 
  id, nome_area, nome_gestor, nome_cargo, foto_gestor,
  linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
  caminho, caminho_texto,
  array_length(caminho, 1) AS profundidade
FROM hierarquia
ORDER BY caminho;

\echo '   ✓ View criada'

-- ===================================================================
-- 5. DADOS INICIAIS - ORGANOGRAMA DPE
-- ===================================================================
\echo '5. Inserindo dados iniciais (DPE - 16 registros)...'

-- Verificar se já existem dados
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pessoas_organograma_gestores LIMIT 1) THEN
    RAISE NOTICE '   ⚠ Dados já existem. Pulando inserção inicial.';
  ELSE
    -- Linha 1: Diretoria
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Diretoria de Processo Eletrônico', 'José da Silva', 'Diretor', 1, '#1976D2', 'DPE', 1);
    
    -- Linha 2: Coordenadorias (buscar ID da diretoria)
    WITH diretoria AS (
      SELECT id FROM pessoas_organograma_gestores WHERE linha_organograma = 1 AND diretoria = 'DPE' LIMIT 1
    )
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) 
    SELECT 'Coordenadoria de Desenvolvimento', 'João Santos', 'Coordenador', 2, d.id, '#E53935', 'DPE', 1 FROM diretoria d
    UNION ALL
    SELECT 'Coordenadoria de Infraestrutura', 'Maria Oliveira', 'Coordenadora', 2, d.id, '#1976D2', 'DPE', 2 FROM diretoria d
    UNION ALL
    SELECT 'Coordenadoria de Suporte', 'Pedro Costa', 'Coordenador', 2, d.id, '#43A047', 'DPE', 3 FROM diretoria d;
    
    -- Linha 3: Divisões
    WITH coords AS (
      SELECT id, ordem_exibicao FROM pessoas_organograma_gestores WHERE linha_organograma = 2 AND diretoria = 'DPE' ORDER BY ordem_exibicao
    )
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    )
    SELECT 'Divisão de Sistemas', 'Ana Paula', 'Chefe de Divisão', 3, c.id, '#C62828', 'DPE', 1 
    FROM coords c WHERE c.ordem_exibicao = 1
    UNION ALL
    SELECT 'Divisão de Projetos', 'Carlos Mendes', 'Chefe de Divisão', 3, c.id, '#8E24AA', 'DPE', 2 
    FROM coords c WHERE c.ordem_exibicao = 1
    UNION ALL
    SELECT 'Divisão de Redes', 'Fernanda Lima', 'Chefe de Divisão', 3, c.id, '#AB47BC', 'DPE', 3 
    FROM coords c WHERE c.ordem_exibicao = 2
    UNION ALL
    SELECT 'Divisão de Servidores', 'Roberto Silva', 'Chefe de Divisão', 3, c.id, '#00838F', 'DPE', 4 
    FROM coords c WHERE c.ordem_exibicao = 2
    UNION ALL
    SELECT 'Divisão de Atendimento', 'Juliana Rocha', 'Chefe de Divisão', 3, c.id, '#00ACC1', 'DPE', 5 
    FROM coords c WHERE c.ordem_exibicao = 3
    UNION ALL
    SELECT 'Divisão de Treinamento', 'Marcos Souza', 'Chefe de Divisão', 3, c.id, '#7CB342', 'DPE', 6 
    FROM coords c WHERE c.ordem_exibicao = 3;
    
    -- Linha 4: Núcleos
    WITH divisoes AS (
      SELECT id, ordem_exibicao FROM pessoas_organograma_gestores WHERE linha_organograma = 3 AND diretoria = 'DPE' ORDER BY ordem_exibicao
    )
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    )
    SELECT 'Núcleo de Desenvolvimento Web', 'Antônio Pereira', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 1 
    FROM divisoes d WHERE d.ordem_exibicao = 1
    UNION ALL
    SELECT 'Núcleo de Gestão de Projetos', 'Beatriz Alves', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 2 
    FROM divisoes d WHERE d.ordem_exibicao = 2
    UNION ALL
    SELECT 'Núcleo de Infraestrutura de Rede', 'Claudio Martins', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 3 
    FROM divisoes d WHERE d.ordem_exibicao = 3
    UNION ALL
    SELECT 'Núcleo de Administração de Servidores', 'Diana Ferreira', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 4 
    FROM divisoes d WHERE d.ordem_exibicao = 4
    UNION ALL
    SELECT 'Núcleo de Help Desk', 'Eduardo Ribeiro', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 5 
    FROM divisoes d WHERE d.ordem_exibicao = 5
    UNION ALL
    SELECT 'Núcleo de Capacitação', 'Flávia Gomes', 'Diretor de Serviço', 4, d.id, '#757575', 'DPE', 6 
    FROM divisoes d WHERE d.ordem_exibicao = 6;
    
    RAISE NOTICE '   ✓ 16 registros inseridos com sucesso!';
  END IF;
END $$;

-- ===================================================================
-- 6. VERIFICAÇÃO FINAL
-- ===================================================================
\echo ''
\echo '6. Verificando instalação...'
\echo ''

SELECT 
  linha_organograma as "Nível",
  COUNT(*) as "Total de Registros",
  CASE linha_organograma
    WHEN 1 THEN 'Diretoria'
    WHEN 2 THEN 'Coordenadoria'
    WHEN 3 THEN 'Divisão'
    WHEN 4 THEN 'Núcleo'
    ELSE 'Outro'
  END as "Descrição"
FROM pessoas_organograma_gestores
WHERE ativo = TRUE
GROUP BY linha_organograma
ORDER BY linha_organograma;

\echo ''
\echo '=========================================='
\echo '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!'
\echo '=========================================='
\echo ''
\echo 'Tabela: pessoas_organograma_gestores'
\echo 'View: pessoas_organograma_hierarquia'
\echo 'Dados iniciais: 16 registros (DPE)'
\echo ''
\echo 'Próximos passos:'
\echo '  1. Iniciar o backend: cd api && npm run dev'
\echo '  2. Iniciar o frontend: cd frontend && npm run dev'
\echo '  3. Acessar: http://localhost:5173'
\echo '  4. Navegar: Menu → Pessoas → Painel'
\echo ''
\echo '=========================================='







