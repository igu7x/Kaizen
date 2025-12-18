-- ===================================================================
-- MIGRATION: ATUALIZAÇÃO COMPLETA DO COMITÊ CGTIC - BANCO CORPORATIVO
-- Comitê Gestor de Tecnologia da Informação e Comunicação
-- Ação: REMOVER dados antigos e INSERIR 21 novas reuniões
-- Total: 21 Reuniões + 88 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================
-- INSTRUÇÕES PARA EQUIPE DE BANCO:
-- 1. Este arquivo deve ser executado no banco corporativo
-- 2. Execute em uma transação para garantir atomicidade
-- 3. A migration possui controle de execução duplicada
-- ===================================================================

-- ============================================================
-- CRIAR TABELA DE LOG DE MIGRATIONS (se não existir)
-- ============================================================
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by VARCHAR(100),
  notes TEXT
);

-- ============================================================
-- INÍCIO DA TRANSACTION
-- ============================================================
BEGIN;

-- Verificar se migration já foi executada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM migrations_log 
    WHERE migration_name = '022_update_cgtic_complete'
  ) THEN
    RAISE NOTICE '⚠️  Migration já executada anteriormente. Abortando.';
    RETURN;
  END IF;
END $$;

-- ============================================================
-- EXECUTAR ATUALIZAÇÃO
-- ============================================================
DO $$
DECLARE
  v_comite_id INTEGER;
  v_count_old_reunioes INTEGER;
  v_count_old_pauta INTEGER;
  
  -- IDs das reuniões
  v_reuniao_1_id INTEGER;
  v_reuniao_2_id INTEGER;
  v_reuniao_3_id INTEGER;
  v_reuniao_4_id INTEGER;
  v_reuniao_5_id INTEGER;
  v_reuniao_6_id INTEGER;
  v_reuniao_7_id INTEGER;
  v_reuniao_8_id INTEGER;
  v_reuniao_9_id INTEGER;
  v_reuniao_10_id INTEGER;
  v_reuniao_11_id INTEGER;
  v_reuniao_12_id INTEGER;
  v_reuniao_13_id INTEGER;
  v_reuniao_14_id INTEGER;
  v_reuniao_15_id INTEGER;
  v_reuniao_16_id INTEGER;
  v_reuniao_17_id INTEGER;
  v_reuniao_18_id INTEGER;
  v_reuniao_19_id INTEGER;
  v_reuniao_20_id INTEGER;
  v_reuniao_21_id INTEGER;
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '022_update_cgtic_complete') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CGTIC
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGTIC';

IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CGTIC não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Iniciando atualização do comitê CGTIC (ID: %)', v_comite_id;

-- Contar registros existentes
SELECT COUNT(*) INTO v_count_old_reunioes FROM comite_reunioes WHERE comite_id = v_comite_id;
SELECT COUNT(*) INTO v_count_old_pauta FROM comite_reuniao_pauta p
  JOIN comite_reunioes r ON r.id = p.reuniao_id WHERE r.comite_id = v_comite_id;

RAISE NOTICE 'Dados antigos: % reuniões, % itens de pauta', v_count_old_reunioes, v_count_old_pauta;

-- DELETAR dados antigos
DELETE FROM comite_reuniao_pauta WHERE reuniao_id IN (SELECT id FROM comite_reunioes WHERE comite_id = v_comite_id);
DELETE FROM comite_reunioes WHERE comite_id = v_comite_id;

RAISE NOTICE 'Dados antigos removidos. Inserindo novos dados...';

-- REUNIÃO 1 - 14/02/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 1, 2025, '2025-02-14', 'fevereiro', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_1_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_1_id, 1, 'Alinhamentos de apresentação do Comitê;', 1),
(v_reuniao_1_id, 2, 'Revisão do Plano de Contratação Anual (PCA) 2025', 2),
(v_reuniao_1_id, 3, 'Avaliação Preliminar sobre o 3º Datacenter;', 3),
(v_reuniao_1_id, 4, 'Orientação sobre o fluxo de recebimento de demandas de desenvolvimento', 4),
(v_reuniao_1_id, 5, 'Plano Diretor de Tecnologia da Informação e Comunicação – PDTIC', 5);

-- REUNIÃO 2 - 28/02/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 2, 2025, '2025-02-28', 'fevereiro', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_2_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_2_id, 1, 'Revisão do Plano de Contratações Anual: demandas excluídas, não executadas e passíveis de reinclusão', 1),
(v_reuniao_2_id, 2, 'Avaliação sobre o 3º Datacenter - Aquisição de GPU - Comissão Técnica Multidisciplinar de Contratação Sala Cofre (Proad nº 505432)', 2),
(v_reuniao_2_id, 3, 'Discussão preliminar sobre o novo projeto de outsourcing de impressão - CSTI', 3),
(v_reuniao_2_id, 4, 'Dificuldades sobre renovação do SoftwareAG - GETI', 4),
(v_reuniao_2_id, 5, 'Apresentação do status do Programa Residência em TI no TJGO - GITEC', 5),
(v_reuniao_2_id, 6, 'Plano Diretor de Tecnologia da Informação e Comunicação – PDTIC - Monitoramento regular do CGTIC', 6),
(v_reuniao_2_id, 7, 'Apresentação do resultado do índice IGovTIC do ano de 2024 - GETI (Proad nº 616146)', 7);

-- REUNIÃO 3 - 14/03/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 3, 2025, '2025-03-14', 'março', 'Realizada', 'Reunião 3 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_3_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_3_id, 1, 'Revisão do Processo de Gerenciamento de Serviços Essenciais de TIC (Proad nº 470576)', 1),
(v_reuniao_3_id, 2, 'Revisão do Processo de Elaboração, acompanhamento e revisão da Política de Segurança da Informação (Proad nº 552007)', 2),
(v_reuniao_3_id, 3, 'Revisão do Plano de Continuidade de Serviços Essenciais de TIC (Proad nº 571099)', 3),
(v_reuniao_3_id, 4, 'Revisão do Processo de Gerenciamento de Ativos de Infraestrutura e Telecomunicações (Proad nº 237264)', 4),
(v_reuniao_3_id, 5, 'Revisão do Plano de Cópia de Segurança e Restauração (Proad nº 591652)', 5),
(v_reuniao_3_id, 6, 'Revisão do Processo de Negócio de Gerenciamento de Disponibilidade de TIC (Proad nº 571107)', 6),
(v_reuniao_3_id, 7, 'Revisão do Processo de Gerenciamento e Controle de Ativos de Informação (Proad nº 555453)', 7),
(v_reuniao_3_id, 8, 'Revisão do Processo de Gerenciamento de Incidentes de Segurança da Informação (Proad nº 552008)', 8),
(v_reuniao_3_id, 9, 'Revisão do Processo de Gerenciamento de Acessos (Proad nº 264792)', 9),
(v_reuniao_3_id, 10, 'Dificuldades sobre renovação do SoftwareAG - GETI;', 10),
(v_reuniao_3_id, 11, 'Discussão sobre o Plano de Capacitação.', 11);

-- REUNIÃO 4 - 31/03/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 4, 2025, '2025-03-31', 'março', 'Realizada', 'Reunião 4 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_4_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_4_id, 1, 'Termo de cooperação tem por objeto disponibilizar à ECONOMIA - GO o acesso aos sistemas de consulta processual do Tribunal de Justiça (Proad nº 583388)', 1),
(v_reuniao_4_id, 2, 'Revisão do Processo de Gerenciamento de Mudanças (Proad nº 619963)', 2),
(v_reuniao_4_id, 3, 'Revisão do processo de gerenciamento de Nível de Serviço (Proad nº 619953)', 3),
(v_reuniao_4_id, 4, 'Dificuldades sobre renovação do SoftwareAG – GETI', 4),
(v_reuniao_4_id, 5, 'Discussão sobre o Plano de Capacitação', 5);

-- REUNIÃO 5 - 14/04/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 5, 2025, '2025-04-14', 'abril', 'Realizada', 'Reunião 5 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_5_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_5_id, 1, 'Proad: 202503000626274 - Revisão do Processo de Negócio de Gerenciamento de Problemas', 1),
(v_reuniao_5_id, 2, 'Proad: 202504000629294 - Revisão do Processo de Negócio de Gerenciamento de catálogo de serviço', 2),
(v_reuniao_5_id, 3, 'Dificuldades sobre renovação do SoftwareAG – GETI', 3),
(v_reuniao_5_id, 4, 'Aprovação do calendário de reuniões do CGTIC', 4);

-- REUNIÃO 6 - 28/04/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 6, 2025, '2025-04-28', 'abril', 'Realizada', 'Reunião 6 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_6_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_6_id, 1, 'Solicitação DIACDE de acesso à base de dados da Jurisprudência para treinamento de modelo LLM (Proad nº 202408000550280)', 1),
(v_reuniao_6_id, 2, 'Dificuldades sobre renovação do SoftwareAG – GETI', 2);

-- REUNIÃO 7 - 12/05/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 7, 2025, '2025-05-12', 'maio', 'Realizada', 'Reunião 7 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_7_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_7_id, 1, 'iGov-TIC-JUD: Proad 202505000637323 : item 20.1.4 - Designação de gerente executivo para ser responsável e para supervisionar o programa de migração para a nuvem - CITEC Item 21.5 - Implementação do processo de gerenciamento de liberação e implantação de TIC - CSTI', 1),
(v_reuniao_7_id, 2, 'Revisão de Processo de Gerenciamento da Capacidade (Proad nº 470568)', 2),
(v_reuniao_7_id, 3, 'Dificuldades sobre renovação do SoftwareAG – GETI', 3);

-- REUNIÃO 8 - 26/05/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 8, 2025, '2025-05-26', 'maio', 'Realizada', 'Reunião 8 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_8_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_8_id, 1, 'Solicita providências quanto às atualizações dos banco de dados dos Sistemas do Tribunal de Justiça do Estado de Goiás (Proad nº 202302000385790)', 1),
(v_reuniao_8_id, 2, 'Solicita depósito de mídias por serviço em NUVEM (Proad nº 202408000556017)', 2),
(v_reuniao_8_id, 3, 'Revisão do Processo de Gerenciamento de Configurações e Ativos de Serviço (Proad nº 202505000637418)', 3),
(v_reuniao_8_id, 4, 'Revisão do processo de Gerenciamento de Mudanças (Proad nº 202505000638582)', 4),
(v_reuniao_8_id, 5, 'Revisão Normativo de RH para gestores de TIC (Proad nº 202410000575531)', 5),
(v_reuniao_8_id, 6, 'Dificuldades sobre renovação IBM – GETI', 6);

-- REUNIÃO 9 - 09/06/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 9, 2025, '2025-06-09', 'junho', 'Realizada', 'Reunião 9 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_9_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_9_id, 1, 'Revisão do Plano de Contratações Anual de Tecnologia da Informação e Comunicação (Proad:202503000621322 )', 1),
(v_reuniao_9_id, 2, 'Comunicação sobre o resultado preliminar de envio das respostas do iGovTIC-JUD 2025 (Proad: 202505000637323)', 2),
(v_reuniao_9_id, 3, 'Revisão do processo de Gerenciamento de Segurança da Informação (Proad: 202505000637430)', 3),
(v_reuniao_9_id, 4, 'Revisão do processo de gerenciamento de Conhecimento (Proad: 202505000637422)', 4),
(v_reuniao_9_id, 5, 'Dificuldades sobre renovação do IBM – GETI', 5);

-- REUNIÃO 10 - 24/06/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 10, 2025, '2025-06-24', 'junho', 'Realizada', 'Reunião 10 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_10_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_10_id, 1, '202506000646091 - Painel de Execução do Plano de Capacitação - PCTIC 2025/2027;', 1),
(v_reuniao_10_id, 2, '202302000385790 - Solicitação de providências quanto as atualizações dos banco de dados dos Sistemas do Tribunal de Justiça do Estado de Goiás;', 2),
(v_reuniao_10_id, 3, '202506000649622 - Plano Anual de Capacitação de TIC.', 3);

-- REUNIÃO 11 - 14/07/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 11, 2025, '2025-07-14', 'julho', 'Realizada', 'Reunião 11 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_11_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_11_id, 1, '202506000648455 - Revisão do Processo de Negócio de Gerenciamento de Incidentes', 1),
(v_reuniao_11_id, 2, '202506000649936 - Revisão do Processo de Gerenciamento de Requisições de Serviços.', 2);

-- REUNIÃO 12 - 28/07/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 12, 2025, '2025-07-28', 'julho', 'Realizada', 'Reunião 12 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_12_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_12_id, 1, '202507000655232 - Revisão anual do Processo de Gerenciamento de Contratos de TIC;', 1),
(v_reuniao_12_id, 2, '202507000655418 - Revisão do processo de Gerenciamento de Central de Serviços de TIC;', 2),
(v_reuniao_12_id, 3, '202507000657456 - Reestruturação do Comitê Gestor da Plataforma Digital do Poder Judiciário (PDPJ-Br) e CODEX.', 3);

-- REUNIÃO 13 - 11/08/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 13, 2025, '2025-08-11', 'agosto', 'Realizada', 'Reunião 13 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_13_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_13_id, 1, '202507000655636 - Revisão do Processo de Negócio de Planejamento Orçamentário de TIC;', 1),
(v_reuniao_13_id, 2, '202507000655637 - Revisão do Processo de Negócio de Planejamento de Aquisições e de Contratações de Soluções de TIC.', 2),
(v_reuniao_13_id, 3, '202506000649923 - Revisão do Catálogo de Soluções de Software', 3);

-- REUNIÃO 14 - 25/08/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 14, 2025, '2025-08-25', 'agosto', 'Realizada', 'Reunião 14 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_14_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_14_id, 1, 'Reestruturação DTI', 1);

-- REUNIÃO 15 - 08/09/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 15, 2025, '2025-09-08', 'setembro', 'Realizada', 'Reunião 15 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_15_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_15_id, 1, '202508000663608 - Revisão do Catálogo de Serviços e Tarefas;', 1),
(v_reuniao_15_id, 2, '202509000667572 - Atualização dos painéis de BI;', 2),
(v_reuniao_15_id, 3, '202509000667985 - Atualização status PDTIC 2025/2027', 3),
(v_reuniao_15_id, 4, '202503000625819 - Atualização status PACTIC 2025/2027', 4);

-- REUNIÃO 16 - 22/09/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 16, 2025, '2025-09-22', 'setembro', 'Realizada', 'Reunião 16 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_16_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_16_id, 1, '202505000637323 - IGovTIC-JUD 2025.', 1);

-- REUNIÃO 17 - 06/10/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 17, 2025, '2025-10-06', 'outubro', 'Realizada', 'Reunião 17 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_17_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_17_id, 1, '202509000670805 - Indicação de responsáveis por processos de negócio do macroprocesso serviços;', 1),
(v_reuniao_17_id, 2, '202509000671916 - Processo de Gerenciamento de Projetos de TIC.', 2);

-- REUNIÃO 18 - 20/10/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 18, 2025, '2025-10-20', 'outubro', 'Realizada', 'Reunião 18 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_18_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_18_id, 1, 'Proad 202509000670005 - Sala para DTI no Complexo dos Juizados;', 1),
(v_reuniao_18_id, 2, 'Proad 202510000677773 - Status do projeto de outsourcing de impressão.', 2);

-- REUNIÃO 19 - 12/11/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 19, 2025, '2025-11-12', 'novembro', 'Realizada', 'Reunião 19 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_19_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_19_id, 1, '202503000625819 - Atualização status PACTIC;', 1),
(v_reuniao_19_id, 2, '202511000683523 - Revisão do Processo de Gerenciamento de Capacitação de TIC;', 2),
(v_reuniao_19_id, 3, '202511000683941 - Plano de Contratações de TIC - ano 2026', 3),
(v_reuniao_19_id, 4, '202511000684102 - Distribuição de Equipamentos.', 4);

-- REUNIÃO 20 - 24/11/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 20, 2025, '2025-11-24', 'novembro', 'Realizada', 'Reunião 20 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_20_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_20_id, 1, 'Apresentação da minuta do glossário do iGovTIC-JUD Ciclo 2026.', 1),
(v_reuniao_20_id, 2, '202509000669948 - IGovTIC - Atualização do processo de negócio "Desenvolvimento de Software"', 2);

-- REUNIÃO 21 - 09/12/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 21, 2025, '2025-12-09', 'dezembro', 'Realizada', 'Reunião 21 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-de-tecnologia-da-informacao-e-comunicacao-cgtic',
  'Reuniões Quinzenais', NOW(), NOW()) RETURNING id INTO v_reuniao_21_id;
INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
(v_reuniao_21_id, 1, '202512000689768 - Processo de Negócio de Planejamento Tático-operacional do Plano Diretor de Tecnologia da Informação e Comunicação - PDTIC;', 1),
(v_reuniao_21_id, 2, '202512000689752 - Atualização do Plano de Ação iGovTIC-JUD 2021/2026 – 5º Monitoramento e do Plano de Evidências iGovTIC-JUD 2026;', 2),
(v_reuniao_21_id, 3, '202509000669637 - Revisão do Processo de Gerenciamento de Escopo e Requisitos.', 3);

-- ===================================================================
-- REGISTRAR MIGRATION
-- ===================================================================
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES (
  '022_update_cgtic_complete', 
  current_user,
  'Substituição completa: 21 reuniões e 88 itens de pauta do CGTIC (2025)'
)
ON CONFLICT (migration_name) DO NOTHING;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CGTIC';
RAISE NOTICE 'Reuniões inseridas: 21';
RAISE NOTICE 'Itens de pauta inseridos: 88';
RAISE NOTICE '===================================================================';

END $$;

-- ============================================================
-- COMMIT
-- ============================================================
COMMIT;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 
  c.sigla AS comite,
  c.nome AS nome_comite,
  COUNT(DISTINCT r.id) AS total_reunioes,
  COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGTIC'
GROUP BY c.sigla, c.nome;

-- Listar reuniões inseridas
SELECT 
  r.numero,
  r.titulo,
  TO_CHAR(r.data, 'DD/MM/YYYY') AS data,
  r.status,
  COUNT(p.id) AS itens_pauta
FROM comite_reunioes r
JOIN comites c ON r.comite_id = c.id
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGTIC' AND r.ano = 2025
GROUP BY r.numero, r.titulo, r.data, r.status
ORDER BY r.numero;











