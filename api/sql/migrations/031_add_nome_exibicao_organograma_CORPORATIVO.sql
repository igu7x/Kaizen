-- ============================================================
-- MIGRAÇÃO 031: Adicionar campo nome_exibicao no organograma
-- VERSÃO CORPORATIVO - Com correção de tipo para VIEW recursiva
-- ============================================================

-- Adicionar coluna nome_exibicao na tabela pessoas_organograma_gestores
ALTER TABLE pessoas_organograma_gestores
ADD COLUMN IF NOT EXISTS nome_exibicao VARCHAR(100) NULL;

-- Comentário da coluna
COMMENT ON COLUMN pessoas_organograma_gestores.nome_exibicao IS 
'Nome abreviado/curto para exibição no card do organograma. Se vazio, usa nome_area.';

-- ============================================================
-- ATUALIZAR A VIEW pessoas_organograma_hierarquia
-- ============================================================

-- Dropar a view existente
DROP VIEW IF EXISTS pessoas_organograma_hierarquia;

-- Recriar a view com as colunas corretas que a API espera:
-- caminho, caminho_texto, profundidade
CREATE VIEW pessoas_organograma_hierarquia AS
WITH RECURSIVE hierarquia AS (
    -- Nível raiz (Diretorias - linha 1)
    SELECT 
        g.id,
        g.nome_area,
        g.nome_exibicao,
        g.nome_gestor,
        g.nome_cargo,
        g.foto_gestor,
        g.cor_barra,
        g.linha_organograma,
        g.subordinacao_id,
        g.diretoria,
        g.ordem_exibicao,
        ARRAY[g.id] AS caminho,
        CAST(g.nome_area AS TEXT) AS caminho_texto
    FROM pessoas_organograma_gestores g
    WHERE g.linha_organograma = 1 AND g.ativo = TRUE
    
    UNION ALL
    
    -- Níveis subordinados
    SELECT 
        g.id,
        g.nome_area,
        g.nome_exibicao,
        g.nome_gestor,
        g.nome_cargo,
        g.foto_gestor,
        g.cor_barra,
        g.linha_organograma,
        g.subordinacao_id,
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
    nome_exibicao,
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

-- ============================================================
-- GRANT para o usuário da API
-- ============================================================
GRANT SELECT ON pessoas_organograma_hierarquia TO sgjt;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT nome_area, nome_exibicao, caminho, caminho_texto, profundidade 
-- FROM pessoas_organograma_hierarquia LIMIT 10;
