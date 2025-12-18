-- ===================================================================
-- MIGRATION: MÓDULO PESSOAS - COLABORADORES E ORGANOGRAMA
-- Data: 2025-12-16
-- Versão: LOCAL
-- Autor: Equipe SGJT
-- Descrição: Criar tabelas, views e dados iniciais do módulo Pessoas
-- ===================================================================
-- 
-- Este arquivo consolida as migrações 029-033 para deploy
-- Deve ser executado APÓS a migração 028_populate_cgp.sql
--
-- ===================================================================

BEGIN;

-- ===================================================================
-- PARTE 1: TABELA DE COLABORADORES
-- ===================================================================

-- Criar tabela de colaboradores (se não existir)
CREATE TABLE IF NOT EXISTS pessoas_colaboradores (
  id SERIAL PRIMARY KEY,
  colaborador VARCHAR(255) NOT NULL,
  unidade_lotacao VARCHAR(255) NOT NULL,
  situacao_funcional VARCHAR(100) NOT NULL,
  nome_cc_fc VARCHAR(255),
  classe_cc_fc VARCHAR(50),
  cargo_efetivo VARCHAR(255),
  classe_efetivo VARCHAR(50),
  diretoria VARCHAR(10) DEFAULT 'SGJT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by INTEGER REFERENCES users(id)
);

-- Constraint para situação funcional (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_situacao_funcional'
    ) THEN
        ALTER TABLE pessoas_colaboradores 
        ADD CONSTRAINT chk_situacao_funcional CHECK (
            situacao_funcional IN (
                'ESTATUTÁRIO',
                'NOMEADO EM COMISSÃO - INSS',
                'CEDIDO',
                'TERCEIRIZADO',
                'RESIDENTE',
                'ESTAGIÁRIO'
            )
        );
    END IF;
END $$;

-- Constraint para diretoria (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_colaboradores_diretoria'
    ) THEN
        ALTER TABLE pessoas_colaboradores 
        ADD CONSTRAINT chk_colaboradores_diretoria CHECK (
            diretoria IN ('DIJUD', 'DPE', 'DTI', 'DSTI', 'SGJT')
        );
    END IF;
END $$;

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_nome 
ON pessoas_colaboradores(colaborador);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_unidade 
ON pessoas_colaboradores(unidade_lotacao);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_situacao 
ON pessoas_colaboradores(situacao_funcional);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_deleted 
ON pessoas_colaboradores(is_deleted);

CREATE INDEX IF NOT EXISTS idx_pessoas_colaboradores_diretoria
ON pessoas_colaboradores(diretoria);

-- Comentários
COMMENT ON TABLE pessoas_colaboradores IS 'Cadastro de colaboradores do TJGO';
COMMENT ON COLUMN pessoas_colaboradores.colaborador IS 'Nome completo do colaborador';
COMMENT ON COLUMN pessoas_colaboradores.unidade_lotacao IS 'Unidade onde o colaborador está lotado';
COMMENT ON COLUMN pessoas_colaboradores.situacao_funcional IS 'Situação funcional do colaborador';
COMMENT ON COLUMN pessoas_colaboradores.nome_cc_fc IS 'Nome do Cargo em Comissão ou Função Comissionada';
COMMENT ON COLUMN pessoas_colaboradores.classe_cc_fc IS 'Classe do CC/FC';
COMMENT ON COLUMN pessoas_colaboradores.cargo_efetivo IS 'Nome do cargo efetivo do servidor';
COMMENT ON COLUMN pessoas_colaboradores.classe_efetivo IS 'Classe do cargo efetivo';
COMMENT ON COLUMN pessoas_colaboradores.diretoria IS 'Diretoria à qual o colaborador pertence';

-- View de estatísticas (com agrupamento por diretoria)
DROP VIEW IF EXISTS pessoas_estatisticas;

CREATE OR REPLACE VIEW pessoas_estatisticas AS
SELECT 
  diretoria,
  COUNT(*) AS total_colaboradores,
  COUNT(*) FILTER (WHERE situacao_funcional = 'ESTATUTÁRIO') AS total_estatutarios,
  COUNT(*) FILTER (WHERE situacao_funcional = 'CEDIDO') AS total_cedidos,
  COUNT(*) FILTER (WHERE situacao_funcional = 'NOMEADO EM COMISSÃO - INSS') AS total_comissionados,
  COUNT(*) FILTER (WHERE situacao_funcional = 'TERCEIRIZADO') AS total_terceirizados,
  COUNT(*) FILTER (WHERE situacao_funcional = 'RESIDENTE') AS total_residentes,
  COUNT(*) FILTER (WHERE situacao_funcional = 'ESTAGIÁRIO') AS total_estagiarios,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'ESTATUTÁRIO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_estatutarios,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'CEDIDO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_cedidos,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'NOMEADO EM COMISSÃO - INSS')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_comissionados,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'TERCEIRIZADO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_terceirizados,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'RESIDENTE')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_residentes,
  ROUND((COUNT(*) FILTER (WHERE situacao_funcional = 'ESTAGIÁRIO')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 0) AS percentual_estagiarios
FROM pessoas_colaboradores
WHERE is_deleted = FALSE
GROUP BY diretoria;

COMMENT ON VIEW pessoas_estatisticas IS 'Estatísticas calculadas automaticamente dos colaboradores por diretoria';

-- ===================================================================
-- PARTE 2: TABELA DE ORGANOGRAMA (GESTORES)
-- ===================================================================

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

-- Índices para organograma
CREATE INDEX IF NOT EXISTS idx_organograma_linha ON pessoas_organograma_gestores(linha_organograma);
CREATE INDEX IF NOT EXISTS idx_organograma_subordinacao ON pessoas_organograma_gestores(subordinacao_id);
CREATE INDEX IF NOT EXISTS idx_organograma_diretoria ON pessoas_organograma_gestores(diretoria);
CREATE INDEX IF NOT EXISTS idx_organograma_ativo ON pessoas_organograma_gestores(ativo);

-- Comentários
COMMENT ON TABLE pessoas_organograma_gestores IS 'Gestores e estrutura hierárquica do organograma';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_area IS 'Nome da área/unidade (ex: Diretoria 1, Coordenadoria ABC)';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_gestor IS 'Nome do gestor responsável';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_cargo IS 'Cargo do gestor (ex: Diretor, Coordenador)';
COMMENT ON COLUMN pessoas_organograma_gestores.foto_gestor IS 'URL ou caminho da foto do gestor';
COMMENT ON COLUMN pessoas_organograma_gestores.linha_organograma IS 'Nível hierárquico (1=Diretoria, 2=Coordenadoria, 3=Divisão, 4=Núcleo)';
COMMENT ON COLUMN pessoas_organograma_gestores.subordinacao_id IS 'ID da área superior (NULL para linha 1)';
COMMENT ON COLUMN pessoas_organograma_gestores.cor_barra IS 'Cor da barra superior do card (hex)';
COMMENT ON COLUMN pessoas_organograma_gestores.diretoria IS 'Diretoria raiz (para filtro)';
COMMENT ON COLUMN pessoas_organograma_gestores.ordem_exibicao IS 'Ordem de exibição dentro do mesmo nível';

-- ===================================================================
-- PARTE 3: VIEW HIERÁRQUICA DO ORGANOGRAMA
-- ===================================================================

CREATE OR REPLACE VIEW pessoas_organograma_hierarquia AS
WITH RECURSIVE hierarquia AS (
  -- Nível 1: Diretorias (raiz)
  SELECT 
    id,
    nome_area,
    nome_gestor,
    nome_cargo,
    foto_gestor,
    linha_organograma,
    subordinacao_id,
    cor_barra,
    diretoria,
    ordem_exibicao,
    ARRAY[id] AS caminho,
    CAST(nome_area AS TEXT) AS caminho_texto
  FROM pessoas_organograma_gestores
  WHERE linha_organograma = 1 AND ativo = TRUE
  
  UNION ALL
  
  -- Níveis subsequentes
  SELECT 
    g.id,
    g.nome_area,
    g.nome_gestor,
    g.nome_cargo,
    g.foto_gestor,
    g.linha_organograma,
    g.subordinacao_id,
    g.cor_barra,
    g.diretoria,
    g.ordem_exibicao,
    h.caminho || g.id,
    CAST(h.caminho_texto || ' > ' || g.nome_area AS TEXT)
  FROM pessoas_organograma_gestores g
  INNER JOIN hierarquia h ON g.subordinacao_id = h.id
  WHERE g.ativo = TRUE
)
SELECT 
  id,
  nome_area,
  nome_gestor,
  nome_cargo,
  foto_gestor,
  linha_organograma,
  subordinacao_id,
  cor_barra,
  diretoria,
  ordem_exibicao,
  caminho,
  caminho_texto,
  array_length(caminho, 1) AS profundidade
FROM hierarquia
ORDER BY caminho;

COMMENT ON VIEW pessoas_organograma_hierarquia IS 'View recursiva com hierarquia completa do organograma';

-- ===================================================================
-- PARTE 4: DADOS INICIAIS - COLABORADORES SGJT
-- ===================================================================

-- Inserir colaboradores de exemplo (apenas se não existirem)
INSERT INTO pessoas_colaboradores (
  colaborador, unidade_lotacao, situacao_funcional, 
  nome_cc_fc, classe_cc_fc, cargo_efetivo, classe_efetivo, diretoria
) 
SELECT * FROM (VALUES
  ('José João Pedro', 'Coordenadoria de Tecnologia da Informação', 'ESTATUTÁRIO', 'COORDENADOR', 'DAE8', 'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 'F2', 'SGJT'),
  ('Maria do Exemplo', 'Núcleo de Sistemas', 'NOMEADO EM COMISSÃO - INSS', 'Assessor Técnico', 'FEC3', NULL, NULL, 'SGJT'),
  ('João Fulano de Tal', 'Diretoria de Tecnologia', 'CEDIDO', 'ASSESSOR ADMINISTRATIVO I', 'DAE2', NULL, NULL, 'SGJT'),
  ('Paula Maria', 'Gerência de Infraestrutura', 'ESTATUTÁRIO', NULL, NULL, 'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 'F1', 'SGJT'),
  ('Susana do Exemplo', 'Núcleo de Suporte', 'ESTATUTÁRIO', NULL, NULL, 'AUXILIAR JUDICIARIO-CATEGORIA DIVERSOS', 'C3', 'SGJT')
) AS t(colaborador, unidade_lotacao, situacao_funcional, nome_cc_fc, classe_cc_fc, cargo_efetivo, classe_efetivo, diretoria)
WHERE NOT EXISTS (
  SELECT 1 FROM pessoas_colaboradores 
  WHERE colaborador = t.colaborador AND diretoria = t.diretoria
);

-- ===================================================================
-- PARTE 5: DADOS INICIAIS - ORGANOGRAMA SGJT
-- ===================================================================

DO $$
DECLARE
  v_sgjt_id INTEGER;
  v_coord_id INTEGER;
  v_divisao_id INTEGER;
  v_exists INTEGER;
BEGIN
  -- Verificar se já existe organograma SGJT ativo
  SELECT COUNT(*) INTO v_exists 
  FROM pessoas_organograma_gestores 
  WHERE diretoria = 'SGJT' AND ativo = TRUE;
  
  IF v_exists > 0 THEN
    RAISE NOTICE 'Organograma SGJT já existe. Pulando inserção de dados iniciais.';
  ELSE
    -- LINHA 1: DIRETORIA - João Fulano de Tal (Secretário)
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, foto_gestor,
      linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
      ativo, created_at, updated_at
    ) VALUES (
      'Secretaria de Governança Judiciária e Tecnológica',
      'João Fulano de Tal',
      'Secretário',
      NULL,
      1,
      NULL,
      NULL,
      'SGJT',
      1,
      TRUE,
      NOW(),
      NOW()
    ) RETURNING id INTO v_sgjt_id;
    
    -- LINHA 2: COORDENADORIA - Jose João Pedro (Coordenador)
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, foto_gestor,
      linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
      ativo, created_at, updated_at
    ) VALUES (
      'Coordenadoria XYZ',
      'Jose João Pedro',
      'Coordenador',
      NULL,
      2,
      v_sgjt_id,
      '#1976D2',
      'SGJT',
      1,
      TRUE,
      NOW(),
      NOW()
    ) RETURNING id INTO v_coord_id;
    
    -- LINHA 3: DIVISÃO - Maria do Exemplo
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, foto_gestor,
      linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
      ativo, created_at, updated_at
    ) VALUES (
      'Divisão ABC',
      'Maria do Exemplo',
      'Auxiliar Judiciário',
      NULL,
      3,
      v_coord_id,
      '#8E24AA',
      'SGJT',
      1,
      TRUE,
      NOW(),
      NOW()
    ) RETURNING id INTO v_divisao_id;
    
    -- LINHA 4: NÚCLEOS
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, foto_gestor,
      linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
      ativo, created_at, updated_at
    ) VALUES 
    (
      'Núcleo A',
      'Paula Maria',
      'Auxiliar Judiciário',
      NULL,
      4,
      v_divisao_id,
      '#757575',
      'SGJT',
      1,
      TRUE,
      NOW(),
      NOW()
    ),
    (
      'Núcleo XYX',
      'Susana do Exemplo',
      'Auxiliar Judiciário',
      NULL,
      4,
      v_divisao_id,
      '#757575',
      'SGJT',
      2,
      TRUE,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Organograma SGJT criado com sucesso!';
    RAISE NOTICE 'Estrutura: 1 Diretoria, 1 Coordenadoria, 1 Divisão, 2 Núcleos';
  END IF;
END $$;

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

DO $$
DECLARE
  v_colaboradores INTEGER;
  v_gestores INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_colaboradores FROM pessoas_colaboradores WHERE is_deleted = FALSE;
  SELECT COUNT(*) INTO v_gestores FROM pessoas_organograma_gestores WHERE ativo = TRUE;
  
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'MIGRATION 029 EXECUTADA COM SUCESSO!';
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Tabelas criadas:';
  RAISE NOTICE '  - pessoas_colaboradores';
  RAISE NOTICE '  - pessoas_organograma_gestores';
  RAISE NOTICE 'Views criadas:';
  RAISE NOTICE '  - pessoas_estatisticas';
  RAISE NOTICE '  - pessoas_organograma_hierarquia';
  RAISE NOTICE 'Dados:';
  RAISE NOTICE '  - Colaboradores: %', v_colaboradores;
  RAISE NOTICE '  - Gestores/Áreas: %', v_gestores;
  RAISE NOTICE '===================================================================';
END $$;

COMMIT;





