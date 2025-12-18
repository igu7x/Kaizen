-- ============================================================
-- MIGRATION: POPULAR COMITÊ CGOV-TIC - BANCO CORPORATIVO
-- Data: 2025-12-12
-- Autor: Sistema
-- Descrição: Inserir 11 reuniões e 18 itens de pauta do CGOV-TIC
-- ============================================================
-- INSTRUÇÕES PARA EQUIPE DE BANCO:
-- 1. Este arquivo deve ser executado no banco corporativo
-- 2. Execute em uma transação para garantir atomicidade
-- 3. A migration é idempotente (pode ser executada múltiplas vezes)
-- ============================================================

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

COMMENT ON TABLE migrations_log IS 'Log de migrations executadas no banco de dados';

-- ============================================================
-- INÍCIO DA TRANSACTION
-- ============================================================
BEGIN;

-- Verificar se migration já foi executada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM migrations_log 
    WHERE migration_name = '021_populate_cgov_tic_reunioes'
  ) THEN
    RAISE NOTICE '⚠️  Migration já executada anteriormente. Abortando.';
    -- Não levanta exceção, apenas retorna
    RETURN;
  END IF;
END $$;

-- ============================================================
-- INSERIR REUNIÕES E PAUTAS DO CGOV-TIC
-- ============================================================
DO $$
DECLARE
  v_comite_id INTEGER;
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
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '021_populate_cgov_tic_reunioes') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CGOV-TIC
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGOV-TIC';

-- Validar que comitê existe
IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CGOV-TIC não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Comitê CGOV-TIC encontrado com ID: %', v_comite_id;

-- ===================================================================
-- REUNIÃO 1 - 28/02/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 1, 2025, '2025-02-28', 'fevereiro', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Painel de execução de Cursos e Treinamentos (Proad nº 606217)', 1),
  (v_reuniao_1_id, 2, 'Painel de Execução das Ações Planejadas para o Plano Diretor de Tecnologia da Informação e Comunicação (PDTIC) (Proad nº 606208)', 2),
  (v_reuniao_1_id, 3, 'Levantamento de requisitos para eventual revisão do Plano de Contratação Anual', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 2 - 14/03/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 2, 2025, '2025-03-14', 'março', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, 'Revisão do Plano de Contratações Anual de Tecnologia da Informação e Comunicação (Proad nº 621322)', 1),
  (v_reuniao_2_id, 2, 'O encerramento do Painel de Execução do Plano de Capacitação de Tecnologia da Informação e Comunicação (PCTIC) para o biênio 2023/2025 ( Proad nº 606217)', 2),
  (v_reuniao_2_id, 3, 'Revisão do Plano de Contratações Anual: demandas excluídas, não executadas e passíveis de reinclusão.', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 3 - 14/04/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 3, 2025, '2025-04-14', 'abril', 'Realizada', 'Reunião 3 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_3_id;

IF v_reuniao_3_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_3_id, 1, '202503000621374 - Solicita Viabilização de Implantação de um novo datacenter', 1),
  (v_reuniao_3_id, 2, 'Registro do Monitoramento do Plano Diretor TIC', 2),
  (v_reuniao_3_id, 3, 'Aprovação do calendário de reuniões do CGTIC', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 4 - 12/05/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 4, 2025, '2025-05-12', 'maio', 'Realizada', 'Reunião 4 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_4_id;

IF v_reuniao_4_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_4_id, 1, 'PROAD 202505000637449 - Solicitação de orientação quanto à escolha de monitores para aquisição;', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 5 - 09/06/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 5, 2025, '2025-06-09', 'junho', 'Realizada', 'Reunião 5 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_5_id;

IF v_reuniao_5_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_5_id, 1, '202503000621322 - Revisão do Plano de Contratações Anual de Tecnologia da Informação e Comunicação;', 1),
  (v_reuniao_5_id, 2, '202505000637323 - Comunicação sobre o resultado preliminar de envio das respostas do iGovTIC-JUD 2025.', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 6 - 14/07/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 6, 2025, '2025-07-14', 'julho', 'Realizada', 'Reunião 6 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_6_id;

IF v_reuniao_6_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_6_id, 1, '202503000621374 - Atualização sobre andamento do Grupo de Trabalho Datacenter', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 7 - 11/08/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 7, 2025, '2025-08-11', 'agosto', 'Realizada', 'Reunião 7 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_7_id;

IF v_reuniao_7_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_7_id, 1, '202412000592439 - Revisar Normativo de RH para gestores de TIC', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 8 - 08/09/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 8, 2025, '2025-09-08', 'setembro', 'Realizada', 'Reunião 8 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_8_id;

IF v_reuniao_8_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_8_id, 1, '202503000625819 - Plano Anual de Capacitação - V1.', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 9 - 22/09/2025 (EXTRAORDINÁRIA)
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 9, 2025, '2025-09-22', 'setembro', 'Realizada', 'Reunião 9 - 2025 (Extraordinária)',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reunião Extraordinária', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_9_id;

IF v_reuniao_9_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_9_id, 1, 'Proad 202503000621322 - Proad de revisão do PCA 2025.', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 10 - 06/10/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 10, 2025, '2025-10-06', 'outubro', 'Realizada', 'Reunião 10 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_10_id;

IF v_reuniao_10_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_10_id, 1, 'Proad: 202509000667985 - Atualização PDTIC.', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REUNIÃO 11 - 10/11/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 11, 2025, '2025-11-10', 'novembro', 'Realizada', 'Reunião 11 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-de-tecnologia-da-informacao-e-comunicacao',
  'Reuniões mensais', NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_11_id;

IF v_reuniao_11_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_11_id, 1, 'Proad: 202511000683941- Plano de Contratações de TIC - Ano 2026;', 1),
  (v_reuniao_11_id, 2, 'Proad: 202503000625819 - Atualização status PACTIC.', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- ===================================================================
-- REGISTRAR MIGRATION COMO EXECUTADA
-- ===================================================================
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES (
  '021_populate_cgov_tic_reunioes', 
  current_user,
  'Inserção de 11 reuniões e 18 itens de pauta do CGOV-TIC (2025)'
)
ON CONFLICT (migration_name) DO NOTHING;

-- ===================================================================
-- LOG DE SUCESSO
-- ===================================================================
RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CGOV-TIC';
RAISE NOTICE 'Reuniões inseridas: 11';
RAISE NOTICE 'Itens de pauta inseridos: 18';
RAISE NOTICE '===================================================================';

END $$;

-- ============================================================
-- COMMIT DA TRANSACTION
-- ============================================================
COMMIT;

-- ============================================================
-- VERIFICAÇÃO FINAL: Exibir dados inseridos
-- ============================================================
SELECT 
  c.sigla AS comite,
  c.nome AS nome_comite,
  COUNT(DISTINCT r.id) AS total_reunioes,
  COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGOV-TIC'
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
WHERE c.sigla = 'CGOV-TIC' AND r.ano = 2025
GROUP BY r.numero, r.titulo, r.data, r.status
ORDER BY r.numero;











