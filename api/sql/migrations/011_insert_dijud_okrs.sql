-- =====================================================
-- MIGRAÇÃO 011: Inserção de OKRs da Diretoria DIJUD
-- Data: 2025-12-03
-- OPERAÇÃO: INSERÇÃO (adiciona dados, não substitui)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. INSERIR OBJETIVOS DA DIJUD
-- =====================================================

-- Objetivo 1
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 1',
    'Consolidar o modelo de atuação integrada da Diretoria Judiciária, fortalecendo',
    'Consolidar o modelo de atuação integrada da Diretoria Judiciária, fortalecendo',
    'DIJUD'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 2
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 2',
    'Consolidar a gestão por competências na DJUD, formando líderes, implantando',
    'Consolidar a gestão por competências na DJUD, formando líderes, implantando',
    'DIJUD'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 3
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 3',
    'Estruturar e expandir o uso de tecnologia e automação.',
    'Estruturar e expandir o uso de tecnologia e automação.',
    'DIJUD'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 4
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 4',
    'Consolidar a governança de desempenho (OKR e Dados).',
    'Consolidar a governança de desempenho (OKR e Dados).',
    'DIJUD'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 5
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 5',
    'Implementar gestão por processos e melhoria contínua.',
    'Implementar gestão por processos e melhoria contínua.',
    'DIJUD'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. INSERIR KEY RESULTS DA DIJUD
-- =====================================================

-- KRs do Objetivo 1
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.1', 'Elaborar, aprovar e publicar o Plano de Entregas P', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.2', 'Estruturar as iniciativas de cada frente de entrega', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.3', 'Executar, sob acompanhamento periódico, pelo m', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.4', 'Concluir integralmente as cinco frentes de entreg', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DIJUD';

-- KRs do Objetivo 2
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.1', 'Executar, no âmbito da DJUD, as ações do Projet', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.2', 'Assegurar a participação da DJUD no Curso de Fo', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.3', 'Elaborar PDIs para 100% dos servidores da DJUD', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.4', 'Implantar cultura de feedback e colaboração: 1:1', 'NAO_INICIADO', 'NO_PRAZO', '06/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DIJUD';

-- KRs do Objetivo 3
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.1', 'Mapear todas as automações e soluções digitais já', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.2', 'Implantar a base do Sistema Orquestrador da DJU', 'NAO_INICIADO', 'NO_PRAZO', '04/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.3', 'Ampliar a centralização das automações, integran', 'NAO_INICIADO', 'NO_PRAZO', '08/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.4', 'Concluir a integração de 100% do Catálogo de Sol', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DIJUD';

-- KRs do Objetivo 4
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.1', 'Planos de Gestão da DJUD elaborado, validados p', 'NAO_INICIADO', 'EM_ATRASO', '10/2025', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.2', 'Painel de acompanhamento do ecossistema de es', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.3', 'Instituir ciclo de monitoramento e ajuste estraté', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.4', 'Preparar o ciclo estratégico 2027–2029: consolida', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DIJUD';

-- KRs do Objetivo 5
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.1', 'Concluir o levantamento inicial de ao menos 10 p', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.2', 'Definir e formalizar o Modelo Padrão de Gestão p', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.3', 'Ampliar o Catálogo de Processos da DJUD com m', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DIJUD';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.4', 'Dar continuidade à ampliação do Catálogo de Pro', 'NAO_INICIADO', 'NO_PRAZO', '09/2026', 'DIJUD'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DIJUD';

-- =====================================================
-- 3. VALIDAÇÃO
-- =====================================================

DO $$
DECLARE
    dijud_obj_count INTEGER;
    dijud_kr_count INTEGER;
    dpe_obj_count INTEGER;
    dpe_kr_count INTEGER;
    sgjt_obj_count INTEGER;
    sgjt_kr_count INTEGER;
BEGIN
    -- Contar DIJUD
    SELECT COUNT(*) INTO dijud_obj_count FROM objectives 
    WHERE directorate_code = 'DIJUD' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    SELECT COUNT(*) INTO dijud_kr_count FROM key_results 
    WHERE directorate_code = 'DIJUD' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    -- Contar DPE (deve permanecer intacto)
    SELECT COUNT(*) INTO dpe_obj_count FROM objectives 
    WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    SELECT COUNT(*) INTO dpe_kr_count FROM key_results 
    WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    -- Contar SGJT (deve permanecer intacto)
    SELECT COUNT(*) INTO sgjt_obj_count FROM objectives 
    WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    SELECT COUNT(*) INTO sgjt_kr_count FROM key_results 
    WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    RAISE NOTICE '=== VALIDAÇÃO DA INSERÇÃO ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DIJUD (NOVOS DADOS):';
    RAISE NOTICE '   Objetivos: %', dijud_obj_count;
    RAISE NOTICE '   Key Results: %', dijud_kr_count;
    RAISE NOTICE '';
    RAISE NOTICE '📊 DPE (DEVE ESTAR INTACTO):';
    RAISE NOTICE '   Objetivos: %', dpe_obj_count;
    RAISE NOTICE '   Key Results: %', dpe_kr_count;
    RAISE NOTICE '';
    RAISE NOTICE '📊 SGJT (DEVE ESTAR INTACTO):';
    RAISE NOTICE '   Objetivos: %', sgjt_obj_count;
    RAISE NOTICE '   Key Results: %', sgjt_kr_count;
    
    IF dijud_obj_count >= 5 AND dijud_kr_count >= 20 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ DIJUD: Inserção concluída com sucesso!';
    ELSE
        RAISE WARNING '⚠️ DIJUD: Contagem diferente do esperado';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- FIM DA MIGRAÇÃO 011
-- =====================================================





