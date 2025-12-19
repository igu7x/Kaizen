-- ============================================================
-- MIGRAÇÃO 031: Adicionar campo nome_exibicao no organograma
-- ============================================================
-- Este campo permite definir um nome curto/abreviado para ser
-- exibido no card do organograma em vez do nome completo da área.
-- Exemplo: "CODESG" em vez de "Coordenadoria de Desenvolvimento de Sistemas e Gestão"
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

-- Dropar e recriar a view para incluir o novo campo
DROP VIEW IF EXISTS pessoas_organograma_hierarquia;

CREATE OR REPLACE VIEW pessoas_organograma_hierarquia AS
WITH RECURSIVE hierarquia AS (
    -- Nível raiz (Diretorias - linha 1)
    SELECT 
        g.id,
        g.nome_area,
        COALESCE(g.nome_exibicao, '')::VARCHAR(100) AS nome_exibicao,
        g.nome_gestor,
        g.nome_cargo,
        g.foto_gestor,
        g.cor_barra,
        g.linha_organograma,
        g.subordinacao_id,
        g.diretoria,
        g.ordem_exibicao,
        g.ativo,
        g.ativo = FALSE AS is_deleted,
        1 AS nivel_hierarquia,
        g.nome_area::TEXT AS caminho_hierarquia,
        ARRAY[g.id] AS ancestrais
    FROM pessoas_organograma_gestores g
    WHERE g.subordinacao_id IS NULL AND g.ativo = TRUE
    
    UNION ALL
    
    -- Níveis subordinados
    SELECT 
        g.id,
        g.nome_area,
        COALESCE(g.nome_exibicao, '')::VARCHAR(100) AS nome_exibicao,
        g.nome_gestor,
        g.nome_cargo,
        g.foto_gestor,
        g.cor_barra,
        g.linha_organograma,
        g.subordinacao_id,
        g.diretoria,
        g.ordem_exibicao,
        g.ativo,
        g.ativo = FALSE AS is_deleted,
        h.nivel_hierarquia + 1,
        (h.caminho_hierarquia || ' > ' || g.nome_area)::TEXT AS caminho_hierarquia,
        h.ancestrais || g.id
    FROM pessoas_organograma_gestores g
    INNER JOIN hierarquia h ON g.subordinacao_id = h.id
    WHERE g.ativo = TRUE
)
SELECT 
    h.*,
    p.nome_area AS pai_nome_area,
    p.nome_gestor AS pai_nome_gestor,
    (SELECT COUNT(*) FROM pessoas_organograma_gestores s 
     WHERE s.subordinacao_id = h.id AND s.ativo = TRUE) AS total_subordinados
FROM hierarquia h
LEFT JOIN pessoas_organograma_gestores p ON h.subordinacao_id = p.id
ORDER BY h.diretoria, h.linha_organograma, h.ordem_exibicao;

-- ============================================================
-- GRANT para o usuário da API (se necessário)
-- ============================================================
-- GRANT SELECT ON pessoas_organograma_hierarquia TO sgjt;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT nome_area, nome_exibicao FROM pessoas_organograma_gestores LIMIT 5;




