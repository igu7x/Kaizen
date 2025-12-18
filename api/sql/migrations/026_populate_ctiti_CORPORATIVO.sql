-- ===================================================================
-- MIGRATION: POPULAR COMITÊ CTITI - BANCO CORPORATIVO
-- Comitê de Tratamento de Incidentes de TI
-- Total: 3 Reuniões + 6 Itens de Pauta
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
  v_reuniao_3_id INTEGER;
BEGIN

-- Verificar se migration já foi executada
IF EXISTS (SELECT 1 FROM migrations_log WHERE migration_name = '026_populate_ctiti') THEN
  RAISE NOTICE 'Migration já executada. Pulando...';
  RETURN;
END IF;

-- Buscar ID do comitê CTITI
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CTITI';

IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'ERRO: Comitê CTITI não encontrado no banco de dados.';
END IF;

RAISE NOTICE 'Populando comitê CTITI (ID: %)', v_comite_id;

-- REUNIÃO 1 - 31/03/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 1, 2025, '2025-03-31', 'março', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Primeira reunião - Definição de escopo e fluxo de trabalho', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Apresentação do escopo do Comitê;', 1),
  (v_reuniao_1_id, 2, 'Definição do fluxo de trabalho;', 2),
  (v_reuniao_1_id, 3, 'Incidente no PROJUDI do fim de semana de 21 a 23/03.', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 2 - 09/05/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 2, 2025, '2025-05-09', 'maio', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Apresentação de relatórios e ferramentas', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, '202502000612948 - Apresentação ao Comitê do Relatório da Oficina de Incidentes Críticos de TI e a Matriz de Incidentes e Nível de Criticidade;', 1),
  (v_reuniao_2_id, 2, 'Sugestão de adoção da ferramenta para documentação: Huly', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REUNIÃO 3 - 05/08/2025
INSERT INTO comite_reunioes (comite_id, numero, ano, data, mes, status, titulo, link_proad, link_transparencia, observacoes, created_at, updated_at)
VALUES (v_comite_id, 3, 2025, '2025-08-05', 'agosto', 'Realizada', 'Reunião 3 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Análise de incidente crítico no Projudi', NOW(), NOW())
ON CONFLICT (comite_id, numero, ano) DO NOTHING RETURNING id INTO v_reuniao_3_id;

IF v_reuniao_3_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_3_id, 1, 'Instabilidade no Projudi - dia 04/08/2025', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
END IF;

-- REGISTRAR MIGRATION
INSERT INTO migrations_log (migration_name, executed_by, notes)
VALUES ('026_populate_ctiti', current_user, 'População CTITI: 3 reuniões e 6 itens de pauta (2025)')
ON CONFLICT (migration_name) DO NOTHING;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'MIGRATION EXECUTADA COM SUCESSO!';
RAISE NOTICE 'Comitê: CTITI';
RAISE NOTICE 'Reuniões inseridas: 3';
RAISE NOTICE 'Itens de pauta inseridos: 6';
RAISE NOTICE '===================================================================';

END $$;

COMMIT;

-- VERIFICAÇÃO FINAL
SELECT c.sigla, c.nome, COUNT(DISTINCT r.id) AS total_reunioes, COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CTITI' GROUP BY c.sigla, c.nome;











