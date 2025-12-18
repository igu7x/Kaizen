-- =====================================================
-- MIGRAÇÃO 010: Substituição Completa de OKRs da SGJT
-- Data: 2025-12-03
-- ATENÇÃO: Esta migração EXCLUI todos os dados antigos
--          da SGJT e insere os novos dados
-- =====================================================

BEGIN;

-- =====================================================
-- 1. EXCLUIR DADOS ANTIGOS DA SGJT (SOFT DELETE)
-- =====================================================

-- Primeiro, fazer soft delete dos Key Results da SGJT
UPDATE key_results 
SET is_deleted = TRUE, updated_at = NOW()
WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);

-- Depois, fazer soft delete dos Objectives da SGJT
UPDATE objectives 
SET is_deleted = TRUE, updated_at = NOW()
WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);

-- Também fazer hard delete para garantir limpeza total
-- (Primeiro KRs, depois Objectives por causa da FK)
DELETE FROM key_results WHERE directorate_code = 'SGJT';
DELETE FROM objectives WHERE directorate_code = 'SGJT';

-- =====================================================
-- 2. INSERIR NOVOS OBJETIVOS DA SGJT
-- =====================================================

-- Objetivo 1
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 1',
    'Orquestrar a Integração Estratégica entre áreas Judiciárias e Tecnológicas, potencializando a entrega de valor sob usuários do PJGO.',
    'Orquestrar a Integração Estratégica entre áreas Judiciárias e Tecnológicas, potencializando a entrega de valor sob usuários do PJGO.',
    'SGJT'
);

-- Objetivo 2
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 2',
    'Desenvolver Pessoas e Ampliar a Capacidade de TI.',
    'Desenvolver Pessoas e Ampliar a Capacidade de TI.',
    'SGJT'
);

-- Objetivo 3
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 3',
    'Modernizar Serviços de TI e Estrutura Organizacional.',
    'Modernizar Serviços de TI e Estrutura Organizacional.',
    'SGJT'
);

-- Objetivo 4
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 4',
    'Consolidar Governança de Desempenho (OKR e Dados).',
    'Consolidar Governança de Desempenho (OKR e Dados).',
    'SGJT'
);

-- Objetivo 5
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 5',
    'Implantar Gestão por Processos e Cultura de Melhoria Contínua no âmbito da Secretaria de Governança Judiciária e Tecnológica.',
    'Implantar Gestão por Processos e Cultura de Melhoria Contínua no âmbito da Secretaria de Governança Judiciária e Tecnológica.',
    'SGJT'
);

-- Objetivo 6 Técnico
INSERT INTO objectives (code, title, description, directorate_code)
VALUES (
    'Objetivo 6 Técnico',
    'Legado e Continuidade: nov/2026 → jan/2027',
    'Legado e Continuidade: nov/2026 → jan/2027',
    'SGJT'
);

-- =====================================================
-- 3. INSERIR KEY RESULTS DA SGJT
-- =====================================================

-- KRs do Objetivo 1
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.1', 'Diretrizes e atos de institucionalização dos Programas Sinergia TECJUD, ConectJOTI e ConectatJUT formalizados.', 'CONCLUIDO', 'FINALIZADO', 'fev/2025 a jul/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.2', 'Carteira de 9 iniciativas priorizadas (3 por programa) com responsáveis designados.', 'EM_ANDAMENTO', 'EM_ATRASO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.3', 'Pelo menos 6 iniciativas (2 por programa) lançadas e gerando dados de uso.', 'NAO_INICIADO', 'NO_PRAZO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 1.4', 'Pelo menos 12 iniciativas operacionais e documentadas, com lições aprendidas consolidadas.', 'NAO_INICIADO', 'NO_PRAZO', 'jun/2026 a out/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 1' AND o.directorate_code = 'SGJT';

-- KRs do Objetivo 2
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.1', 'Formalização e aprovação do Projeto Gestão por Competências - SGIT, com cronograma.', 'CONCLUIDO', 'FINALIZADO', 'dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.2', 'Matriz de competências publicada e Plano Anual de Capacitação 2026 elaborados.', 'NAO_INICIADO', 'NO_PRAZO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.3', 'Ciclo de Formação de Gestores construído e pelo menos 25 Servidores matriculados.', 'NAO_INICIADO', 'NO_PRAZO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.4', 'Conversão de cargos aprovada; primeira nomeação do cadastro de reserva de TI.', 'NAO_INICIADO', 'NO_PRAZO', 'jan/2026 a mai/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 2.5', '80% dos servidores das quatro diretorias com Plano de Desenvolvimento Individual ativo e cumprimento de pelo menos 80% das 1258 hs de capacitação registradas em painel de monitoramento.', 'NAO_INICIADO', 'NO_PRAZO', 'jun/2026 a out/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 2' AND o.directorate_code = 'SGJT';

-- KRs do Objetivo 3
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.1', 'Estudo técnico realizado com proposta de reorganização das diretorias de TI, incluindo análise de reestruturação de cargos e regimento interno operacional.', 'NAO_INICIADO', 'EM_ATRASO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.2', 'Gestão de serviços e ativos aplicada conforme ITIL v4: ITSM e Gestão de Ativos funcionais, com documentação integrada a Plano de Trabalho para implementação formalizado.', 'NAO_INICIADO', 'EM_ATRASO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.3', 'ITSM e ITAM operacionais no catálogo EDTI em produtividade, SPOCs ativo como ponto único de contato com serviços priorizados; fluxos básicos de atendimento e solicitações em produção; inventário inicial com base de relacionamento de ativos; padrões mínimos de estrutura, processo e indicadores publicados.', 'NAO_INICIADO', 'NO_PRAZO', 'jan/2026 a mai/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.4', 'Ecossistema no sistema Log único de log com integração inicial de monitoramento e tracing de sistemas críticos divulgados; processos de ciclo de vida de ativos estabelecidos; integrações em operação e cronograma de evolução validado.', 'NAO_INICIADO', 'NO_PRAZO', 'jun/2026 a out/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 3.5', 'SLAs e indicadores de serviços e ativos padronizados institucionalmente, com cobertura ampliada, qualidade de dados auditada e relatórios executivos claros de melhoria contínua aprovado para o ciclo seguinte.', 'NAO_INICIADO', 'NO_PRAZO', 'jun/2026 a out/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 3' AND o.directorate_code = 'SGJT';

-- KRs do Objetivo 4
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.1', 'Planos de Coordenadorias elaborados: criação de agenda estratégica, objetivos e diretrizes definidos, com objetivos viés à governança de acompanhamento definidos.', 'CONCLUIDO', 'FINALIZADO', 'fev/2025 a jul/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.2', 'As quatro diretorias com padrão de gestão, com processos essenciais de forma colaborativa, validadas pela SGIT e alinhadas à metodologia OKR e à cultura de dados.', 'NAO_INICIADO', 'EM_ATRASO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.3', 'Painel on-line da SGIT publicado, com foco no acompanhamento de ecosistema de estratégia, abrangendo o Plano de Gestão detalhado dos programas estruturantes e eixos de institucionalização de equipamento, com atualização semanal.', 'NAO_INICIADO', 'NO_PRAZO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 4.4', 'Diretrizes da coordenação de Legado e Continuidade para 2026 definida, que integra os planos de acordo com metodologia OKR e a cultura de dados dos seus planos, com revisão trimestral.', 'NAO_INICIADO', 'NO_PRAZO', 'jan/2026 a mai/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 4' AND o.directorate_code = 'SGJT';

-- KRs do Objetivo 5
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.1', 'Plano de Melhoria Contínua por processos e Cultura de Melhor contínua definido, com controle de atuação sistêmica, resultados e abordagem de acompanhamento estabelecidos.', 'NAO_INICIADO', 'EM_ATRASO', 'ago/2025 a dez/2025', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.2', 'Execução iniciada: diagnóstico dos processos já executado em nível de maturidade concluído, e publicação do primeiro instrumento prático, mapeamento de acessos e dados, com controle de acompanhamento dos processos.', 'NAO_INICIADO', 'NO_PRAZO', 'jan/2026 a mai/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.3', 'Quatro processos piloto, um por diretoria, mapeados e modelados com indicadores básicos em operação, Painel de monitoramento de eficiência publicado, com controle de aumento de rota de melhoria operacional promovido.', 'NAO_INICIADO', 'NO_PRAZO', 'jan/2026 a mai/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR 5.4', 'Consolidação inicial da cultura de melhoria contínua: Painel de Governança evolutivo, carteira inicial de processos em ciclos de melhoria e cronograma pactuado para expansão TI e demais estruturas.', 'NAO_INICIADO', 'NO_PRAZO', 'jun/2026 a out/2026', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 5' AND o.directorate_code = 'SGJT';

-- KRs do Objetivo 6 Técnico
INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR L.1', 'Relatório de Transição consolidado resultados e recomendações.', 'NAO_INICIADO', 'NO_PRAZO', 'nov/26 a jan/2027', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 6 Técnico' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR L.2', 'Workshop de conhecimento para nova gestão com 100% dos líderes.', 'NAO_INICIADO', 'NO_PRAZO', 'nov/26 a jan/2027', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 6 Técnico' AND o.directorate_code = 'SGJT';

INSERT INTO key_results (objective_id, code, description, status, situation, deadline, directorate_code)
SELECT o.id, 'KR L.3', 'Relatório de lições aprendidas e checklist 2027-2028 entregue à próxima gestão.', 'NAO_INICIADO', 'NO_PRAZO', 'nov/26 a jan/2027', 'SGJT'
FROM objectives o WHERE o.code = 'Objetivo 6 Técnico' AND o.directorate_code = 'SGJT';

-- =====================================================
-- 4. VALIDAÇÃO
-- =====================================================

DO $$
DECLARE
    sgjt_obj_count INTEGER;
    sgjt_kr_count INTEGER;
    dpe_obj_count INTEGER;
    dpe_kr_count INTEGER;
BEGIN
    -- Contar SGJT
    SELECT COUNT(*) INTO sgjt_obj_count FROM objectives 
    WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    SELECT COUNT(*) INTO sgjt_kr_count FROM key_results 
    WHERE directorate_code = 'SGJT' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    -- Contar DPE (deve permanecer intacto)
    SELECT COUNT(*) INTO dpe_obj_count FROM objectives 
    WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    SELECT COUNT(*) INTO dpe_kr_count FROM key_results 
    WHERE directorate_code = 'DPE' AND (is_deleted = FALSE OR is_deleted IS NULL);
    
    RAISE NOTICE '=== VALIDAÇÃO DA SUBSTITUIÇÃO ===';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SGJT (NOVOS DADOS):';
    RAISE NOTICE '   Objetivos: %', sgjt_obj_count;
    RAISE NOTICE '   Key Results: %', sgjt_kr_count;
    RAISE NOTICE '';
    RAISE NOTICE '📊 DPE (DEVE ESTAR INTACTO):';
    RAISE NOTICE '   Objetivos: %', dpe_obj_count;
    RAISE NOTICE '   Key Results: %', dpe_kr_count;
    RAISE NOTICE '';
    
    IF sgjt_obj_count = 6 AND sgjt_kr_count = 25 THEN
        RAISE NOTICE '✅ SGJT: Substituição concluída com sucesso!';
    ELSE
        RAISE WARNING '⚠️ SGJT: Contagem diferente do esperado (6 obj, 25 KRs)';
    END IF;
    
    IF dpe_obj_count >= 5 AND dpe_kr_count >= 23 THEN
        RAISE NOTICE '✅ DPE: Dados preservados corretamente!';
    ELSE
        RAISE WARNING '⚠️ DPE: Dados podem ter sido afetados!';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- FIM DA MIGRAÇÃO 010
-- =====================================================





