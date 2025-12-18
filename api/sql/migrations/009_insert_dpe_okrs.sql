-- =====================================================
-- MIGRAÇÃO 009: Inserção de OKRs da Diretoria DPE
-- Data: 2025-12-03
-- =====================================================

-- Inserir os 5 Objetivos Estratégicos da DPE
-- (Usando INSERT ... ON CONFLICT para evitar duplicatas)

BEGIN;

-- =====================================================
-- 1. INSERIR OBJETIVOS
-- =====================================================

-- Objetivo 1
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 1',
    'Escalar a atuação das Centrais da DPE para todas as comarcas do interior.',
    'Escalar a atuação das Centrais da DPE para todas as comarcas do interior.',
    'DPE'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 2
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 2',
    'Consolidar a gestão por processos e a cultura de melhoria contínua.',
    'Consolidar a gestão por processos e a cultura de melhoria contínua.',
    'DPE'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 3
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 3',
    'or competências na DPE, formando líderes e cultivando feedback e colabor',
    'or competências na DPE, formando líderes e cultivando feedback e colabor',
    'DPE'
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
    'DPE'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 5
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 5',
    'Avançar tecnologia e automação.',
    'Avançar tecnologia e automação.',
    'DPE'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. INSERIR KEY RESULTS
-- =====================================================

-- KRs do Objetivo 1
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.1', 'Articular com a SGIT a aprovação de ato da Presidência que autorize a adesão de todas as comarcas à', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.2', 'Publicar o Cronograma Integrado de Interiorização — abrangendo cada uma das centrais — com map', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.3', 'Desenvolver e implementar o Modelo de Expansão por Volume de Serviço, aplicável quando cada cen', 'NAO_INICIADO', 'NO_PRAZO', '08/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.4', 'Concluir expansão das centrais da DPE para todas as comarcas do interior.', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DPE';

-- KRs do Objetivo 2
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.1', 'Publicar a Diretriz de Processos da DPE, estabelecendo Modelo Padrão de Serviço (MPS) — composto', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.2', 'Publicar MPS de cada serviço das centrais —com adoção obrigatória em toda nova atuação de comar', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.3', 'Implementar o critério"Pronto para Tecnologia": somente ingressam na esteira de TI demandas de au', 'NAO_INICIADO', 'NO_PRAZO', '04/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.4', 'Identificar e modelar pelo menos 2 novos serviços da DPE para apoio às comarcas, a partir de diagnól', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.5', 'Implementar o "DPE Day " como evento institucional de reconhecimento, integração e intercâmbio di', 'NAO_INICIADO', 'NO_PRAZO', '03/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DPE';

-- KRs do Objetivo 3
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.1', 'Executar, no âmbito da DPE, as ações do Projeto de Gestão por Competências da SGIT: definir o refer', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.2', 'Assegurar a participação da DPE no Curso de Formação de Gestores da SGIT, organizar iniciativas com', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.3', 'Elaborar PDI para 100% do corpo funcional da DPE com base no diagnóstico de competências e valida', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.4', 'Implantar cultura de feedback e colaboração: 1:1 trimestral entre líderes e liderados e agenda de boa', 'NAO_INICIADO', 'NO_PRAZO', '06/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.5', 'Sensibilizar todas as Centrais quanto à cultura de qualidade, promovendo capacitações.', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DPE';

-- KRs do Objetivo 4
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.1', 'Planos de Gestão da DPE elaborado, validados pela SGIT e alinhados à metodologia OKR e à cultura d', 'CONCLUIDO', 'FINALIZADO', '10/2025', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.2', 'Painel de acompanhamento do ecossistema de estratégia da DPE publicado.', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.3', 'Instituir ciclo de monitoramento e ajuste estratégico: check-ins mensais dos OKRs e revisões trimestrn', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.4', 'Preparar o ciclo estratégico 2027–2029: consolidar e publicar o Dossiê de Gestão 2025–2027 da DPE (', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.5', 'Cada Central/unidade deverá elaborar seu Plano Operacional validado pela DPE, assegurando coerên', 'NAO_INICIADO', 'NO_PRAZO', '06/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DPE';

-- KRs do Objetivo 5
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.1', 'Realizar o diagnóstico técnico-operacional do Sistema Operacionalizar pelo Núcleo de Automação, identi', 'NAO_INICIADO', 'NO_PRAZO', '12/2025', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.2', 'Executar o Plano de Governança: Aprimoramento em gestão de acessos, monitoramento/ logs, SLOs ı', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.3', 'Operar a Esteira DPE de Automação e Desenvolvimento, alinhada ao "Pronto para Tecnologia" (KR 2.3', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DPE';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.4', 'Aprimorar o Sistema de Plantão Judicial, padronizando fluxos, possibilitando automação de escalas e', 'NAO_INICIADO', 'NO_PRAZO', '09/2026', 'DPE'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DPE';

-- =====================================================
-- 3. VALIDAÇÃO
-- =====================================================

-- Contar objetivos inseridos
DO $$
DECLARE
    obj_count INTEGER;
    kr_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO obj_count FROM objectives WHERE directorate_code = 'DPE';
    SELECT COUNT(*) INTO kr_count FROM key_results WHERE directorate_code = 'DPE';
    
    RAISE NOTICE '=== VALIDAÇÃO DA INSERÇÃO ===';
    RAISE NOTICE 'Objetivos DPE inseridos: %', obj_count;
    RAISE NOTICE 'Key Results DPE inseridos: %', kr_count;
    
    IF obj_count >= 5 AND kr_count >= 23 THEN
        RAISE NOTICE '✅ Inserção concluída com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Contagem menor que esperado. Verifique os dados.';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- FIM DA MIGRAÇÃO 009
-- =====================================================





