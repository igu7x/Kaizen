-- ===================================================================
-- MIGRATION: POPULAR COMITÊ CGP - BANCO CORPORATIVO
-- Comitê Gestor do Proad
-- Total: 2 Reuniões + 4 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================

CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by VARCHAR(100),
  notes TEXT
);

BEGIN;

DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
  v_reuniao_2_id INTEGER;
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '028_populate_cgp') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CGP
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGP';

IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CGP não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Populando comitê CGP (ID: %)', v_comite_id;

-- REUNIÃO 1 - 09/05/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 1, 2025, '2025-05-09', 'maio', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-do-proad',
  'Primeira reunião - Melhorias de layout e restrições de encaminhamento', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, '202503000626477 - Solicitação de alteração no layout para destacar sobre a existência de processos apensados;', 1),
  (v_reuniao_1_id, 2, '202503000624261 - Solicitação de restrição de encaminhamentos de Proad''s direto à caixa da unidade "441 - CORREGEDORIA-GERAL DA JUSTIÇA".', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 2 - 08/07/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 2, 2025, '2025-07-08', 'julho', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-do-proad',
  'Segunda reunião - Comunicações eletrônicas e acesso para cartorários', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, 'PROAD 202406000529452 - Institucionalização do Projeto de Comunicações Eletrônicas Puras via PROAD;', 1),
  (v_reuniao_2_id, 2, 'PROAD 202503000624285 - Login no PROAD para Cartorários extrajudiciais.', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REGISTRAR MIGRATION
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES ('028_populate_cgp', current_user, 'População CGP: 2 reuniões e 4 itens de pauta (2025)')
ON CONFLICT (migration_name) DO NOTHING;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CGP';
RAISE NOTICE 'Reuniões inseridas: 2';
RAISE NOTICE 'Itens de pauta inseridos: 4';
RAISE NOTICE '===================================================================';

END $$;

COMMIT;

-- VERIFICAÇÃO FINAL
SELECT c.sigla, c.nome, COUNT(DISTINCT r.id) AS total_reunioes, COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CGP' GROUP BY c.sigla, c.nome;











