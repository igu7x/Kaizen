-- =====================================================
-- MIGRAÇÃO 012: Inserção de OKRs da Diretoria DTI
-- Data: 2025-12-03
-- OPERAÇÃO: INSERÇÃO (adiciona dados, não substitui)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. INSERIR OBJETIVOS DA DTI
-- =====================================================

-- Objetivo 1
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 1',
    'Consolidar os projetos estratégicos da DTI no ciclo 2025/2027, garantindo',
    'Consolidar os projetos estratégicos da DTI no ciclo 2025/2027, garantindo',
    'DTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 2
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 2',
    'Consolidar a gestão por competências na DTI, formando líderes, promovendo',
    'Consolidar a gestão por competências na DTI, formando líderes, promovendo',
    'DTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 3
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 3',
    'Estruturar e implantar o ecossistema integrado de gestão de serviços, ativ',
    'Estruturar e implantar o ecossistema integrado de gestão de serviços, ativ',
    'DTI'
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
    'DTI'
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
    'DTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. INSERIR KEY RESULTS DA DTI
-- =====================================================

-- KRs do Objetivo 1
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.1', 'Elaborar o Plano de Entregas Prioritárias - PEP com', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.2', 'Iniciar a execução dos quatro projetos estratégico', 'NAO_INICIADO', 'NO_PRAZO', '04/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.3', 'Alcançar 60% da execução global dos projetos do', 'NAO_INICIADO', 'NO_PRAZO', '08/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.4', 'Concluir 90% do escopo do PEP e apresentar à pré', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DTI';

-- KRs do Objetivo 2
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.1', 'Executar, no âmbito da DTI, as ações do Projeto d', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.2', 'Assegurar a participação da DTI no Curso de Form', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.3', 'Elaborar PDI para 100% dos servidores da DTI con', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.4', 'Implementar cultura de feedback e colaboração: p', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DTI';

-- KRs do Objetivo 3
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.1', 'Elaborar o Plano de Implementação do Ecossistem', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.2', 'ITSM e ITAM operacionais no sistema GLPI em vers', 'NAO_INICIADO', 'NO_PRAZO', '03/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.3', 'Ecossistema GLPI ampliado: SPOCs consolidado e c', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.4', 'Implementar módulos de Gestão do Conhecim', 'NAO_INICIADO', 'NO_PRAZO', '09/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DTI';

-- KRs do Objetivo 4
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.1', 'Planos de Gestão da DTI elaborado, validados pela', 'NAO_INICIADO', 'EM_ATRASO', '10/2025', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.2', 'Painel de acompanhamento do ecossistema de es', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.3', 'Instituir ciclo de monitoramento e ajuste estratég', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.4', 'Preparar o ciclo estratégico 2027–2029: consolida', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DTI';

-- KRs do Objetivo 5
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.1', 'Elaborar o Catálogo de Processos da DTI, com pelo', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.2', 'Elaborar e submeter à apreciação das instâncias c', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.3', 'Ampliar o Catálogo de Processos da DTI, incorpor', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.4', 'Dar continuidade à ampliação do Catálogo e ativa', 'NAO_INICIADO', 'NO_PRAZO', '09/2026', 'DTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DTI';

COMMIT;

-- =====================================================
-- FIM DA MIGRAÇÃO 012
-- =====================================================





