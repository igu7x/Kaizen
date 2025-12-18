-- =====================================================
-- MIGRAÇÃO 013: Inserção de OKRs da Diretoria DSTI
-- Data: 2025-12-03
-- OPERAÇÃO: INSERÇÃO (adiciona dados, não substitui)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. INSERIR OBJETIVOS DA DSTI
-- =====================================================

-- Objetivo 1
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 1',
    'Implementar o Portfólio Estratégico de Soluções (PES) como agenda prioritária',
    'Implementar o Portfólio Estratégico de Soluções (PES) como agenda prioritária',
    'DSTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 2
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 2',
    'Consolidar a gestão por competências na DSTI, formando líderes, promovendo',
    'Consolidar a gestão por competências na DSTI, formando líderes, promovendo',
    'DSTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 3
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 3',
    'Estruturar e operar, no âmbito da DSTI, a Estratégia de Armazenamento',
    'Estruturar e operar, no âmbito da DSTI, a Estratégia de Armazenamento',
    'DSTI'
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
    'DSTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Objetivo 5
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 5',
    'Estruturar e operar o Processo de Gestão de Demandas por Soluções Tecnológicas',
    'Estruturar e operar o Processo de Gestão de Demandas por Soluções Tecnológicas',
    'DSTI'
)
ON CONFLICT (code, directorate_code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. INSERIR KEY RESULTS DA DSTI
-- =====================================================

-- KRs do Objetivo 1
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.1', 'Institucionalizar o Portfólio Estratégico de Soluçõ', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.2', 'Alcançar pelo menos 35% do escopo aprovado pa', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.3', 'Alcançar pelo menos 70% do escopo aprovado pa', 'NAO_INICIADO', 'NO_PRAZO', '08/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.4', 'Alcançar pelo menos 90% do escopo aprovado pa', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'DSTI';

-- KRs do Objetivo 2
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.1', 'Executar, no âmbito da DSTI, as ações do Projeto d', 'NAO_INICIADO', 'NO_PRAZO', '11/2025', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.2', 'Assegurar a participação da DSTI no Curso de Form', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.3', 'Elaborar PDI para 100% dos servidores da DSTI co', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.4', 'Implementar cultura de feedback e colaboração: p', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'DSTI';

-- KRs do Objetivo 3
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.1', 'Elaborar estudos para o fortalecimento da área de', 'NAO_INICIADO', 'NO_PRAZO', '12/2025', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.2', 'Publicar o Plano de Ação de Armazenamento de D', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.3', 'Entregar o piloto do Armazenamento de Dados (Arrecad', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.4', 'Executar pelo menos 70% das iniciativas priorizad', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'DSTI';

-- KRs do Objetivo 4
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.1', 'Planos de Gestão da DSTI elaborado, validados pe', 'NAO_INICIADO', 'EM_ATRASO', '10/2025', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.2', 'Painel de acompanhamento do ecossistema de es', 'NAO_INICIADO', 'NO_PRAZO', '02/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.3', 'Instituir ciclo de monitoramento e ajuste estratég', 'NAO_INICIADO', 'NO_PRAZO', '05/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.4', 'Preparar o ciclo estratégico 2027–2029: consolida', 'NAO_INICIADO', 'NO_PRAZO', '11/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'DSTI';

-- KRs do Objetivo 5
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.1', 'Publicar o Guia do processo de Demanda por sol', 'NAO_INICIADO', 'NO_PRAZO', '01/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.2', 'Colocar em operação a porta única de demandas', 'NAO_INICIADO', 'NO_PRAZO', '03/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.3', 'Elaborar e submeter à alta gestão o Modelo de Ge', 'NAO_INICIADO', 'NO_PRAZO', '07/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DSTI';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.4', 'Publicar o Painel de Gestão de Demandas da DSTI', 'NAO_INICIADO', 'NO_PRAZO', '12/2026', 'DSTI'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'DSTI';

COMMIT;

-- =====================================================
-- FIM DA MIGRAÇÃO 013
-- =====================================================





