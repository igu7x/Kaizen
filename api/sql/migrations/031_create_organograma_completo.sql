-- ===================================================================
-- MIGRATION: CRIAR ORGANOGRAMA COMPLETO
-- Data: 2025-12-16
-- Autor: Sistema
-- Descrição: Criar tabela de organograma, view hierárquica e dados iniciais
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. TABELA: pessoas_organograma_gestores
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

CREATE INDEX IF NOT EXISTS idx_organograma_linha ON pessoas_organograma_gestores(linha_organograma);
CREATE INDEX IF NOT EXISTS idx_organograma_subordinacao ON pessoas_organograma_gestores(subordinacao_id);
CREATE INDEX IF NOT EXISTS idx_organograma_diretoria ON pessoas_organograma_gestores(diretoria);
CREATE INDEX IF NOT EXISTS idx_organograma_ativo ON pessoas_organograma_gestores(ativo);

COMMENT ON TABLE pessoas_organograma_gestores IS 'Gestores e estrutura hierárquica do organograma';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_area IS 'Nome da área/unidade (ex: Diretoria 1, Coordenadoria ABC)';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_gestor IS 'Nome do gestor responsável';
COMMENT ON COLUMN pessoas_organograma_gestores.nome_cargo IS 'Cargo do gestor (ex: Diretor, Coordenador)';
COMMENT ON COLUMN pessoas_organograma_gestores.foto_gestor IS 'URL ou base64 da foto do gestor';
COMMENT ON COLUMN pessoas_organograma_gestores.linha_organograma IS 'Nível hierárquico (1=Diretoria, 2=Coordenadoria, 3=Divisão, 4=Núcleo)';
COMMENT ON COLUMN pessoas_organograma_gestores.subordinacao_id IS 'ID da área superior (NULL para linha 1)';
COMMENT ON COLUMN pessoas_organograma_gestores.cor_barra IS 'Cor da barra superior do card (hex)';
COMMENT ON COLUMN pessoas_organograma_gestores.diretoria IS 'Diretoria raiz (para filtro)';
COMMENT ON COLUMN pessoas_organograma_gestores.ordem_exibicao IS 'Ordem de exibição dentro do mesmo nível';

-- ===================================================================
-- 2. VIEW: pessoas_organograma_hierarquia
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
-- 3. DADOS INICIAIS: Organograma Exemplo (DPE)
-- ===================================================================

-- Linha 1: Diretoria
INSERT INTO pessoas_organograma_gestores (
  nome_area, nome_gestor, nome_cargo, foto_gestor, 
  linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
) VALUES 
('Diretoria de Processo Eletrônico', 'José da Silva', 'Diretor', NULL, 1, NULL, '#1976D2', 'DPE', 1);

-- Buscar o ID da diretoria recém-criada
DO $$
DECLARE
  diretoria_id INTEGER;
  coord1_id INTEGER;
  coord2_id INTEGER;
  coord3_id INTEGER;
  div1_id INTEGER;
  div2_id INTEGER;
  div3_id INTEGER;
  div4_id INTEGER;
  div5_id INTEGER;
  div6_id INTEGER;
BEGIN
  -- Buscar ID da Diretoria
  SELECT id INTO diretoria_id 
  FROM pessoas_organograma_gestores 
  WHERE nome_area = 'Diretoria de Processo Eletrônico' 
  AND linha_organograma = 1;
  
  -- Linha 2: Coordenadorias
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Coordenadoria de Desenvolvimento', 'João Santos', 'Coordenador', NULL, 2, diretoria_id, '#E53935', 'DPE', 1)
  RETURNING id INTO coord1_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Coordenadoria de Infraestrutura', 'Maria Oliveira', 'Coordenadora', NULL, 2, diretoria_id, '#1976D2', 'DPE', 2)
  RETURNING id INTO coord2_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Coordenadoria de Suporte', 'Pedro Costa', 'Coordenador', NULL, 2, diretoria_id, '#43A047', 'DPE', 3)
  RETURNING id INTO coord3_id;
  
  -- Linha 3: Divisões (2 por coordenadoria)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Sistemas', 'Ana Paula', 'Chefe de Divisão', NULL, 3, coord1_id, '#C62828', 'DPE', 1)
  RETURNING id INTO div1_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Projetos', 'Carlos Mendes', 'Chefe de Divisão', NULL, 3, coord1_id, '#8E24AA', 'DPE', 2)
  RETURNING id INTO div2_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Redes', 'Fernanda Lima', 'Chefe de Divisão', NULL, 3, coord2_id, '#AB47BC', 'DPE', 3)
  RETURNING id INTO div3_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Servidores', 'Roberto Silva', 'Chefe de Divisão', NULL, 3, coord2_id, '#00838F', 'DPE', 4)
  RETURNING id INTO div4_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Atendimento', 'Juliana Rocha', 'Chefe de Divisão', NULL, 3, coord3_id, '#00ACC1', 'DPE', 5)
  RETURNING id INTO div5_id;
  
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Divisão de Treinamento', 'Marcos Souza', 'Chefe de Divisão', NULL, 3, coord3_id, '#7CB342', 'DPE', 6)
  RETURNING id INTO div6_id;
  
  -- Linha 4: Núcleos (1 por divisão)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor, 
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
  ) VALUES 
  ('Núcleo de Desenvolvimento Web', 'Antônio Pereira', 'Diretor de Serviço', NULL, 4, div1_id, '#757575', 'DPE', 1),
  ('Núcleo de Gestão de Projetos', 'Beatriz Alves', 'Diretor de Serviço', NULL, 4, div2_id, '#757575', 'DPE', 2),
  ('Núcleo de Infraestrutura de Rede', 'Claudio Martins', 'Diretor de Serviço', NULL, 4, div3_id, '#757575', 'DPE', 3),
  ('Núcleo de Administração de Servidores', 'Diana Ferreira', 'Diretor de Serviço', NULL, 4, div4_id, '#757575', 'DPE', 4),
  ('Núcleo de Help Desk', 'Eduardo Ribeiro', 'Diretor de Serviço', NULL, 4, div5_id, '#757575', 'DPE', 5),
  ('Núcleo de Capacitação', 'Flávia Gomes', 'Diretor de Serviço', NULL, 4, div6_id, '#757575', 'DPE', 6);
  
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'ORGANOGRAMA CRIADO COM SUCESSO!';
  RAISE NOTICE 'Estrutura DPE:';
  RAISE NOTICE '  - 1 Diretoria (Nível 1)';
  RAISE NOTICE '  - 3 Coordenadorias (Nível 2)';
  RAISE NOTICE '  - 6 Divisões (Nível 3)';
  RAISE NOTICE '  - 6 Núcleos (Nível 4)';
  RAISE NOTICE '  - TOTAL: 16 registros';
  RAISE NOTICE '===================================================================';
END $$;

COMMIT;

