-- ===================================================================
-- MIGRAÇÃO: POPULAR COMITÊ CTITI
-- Comitê de Tratamento de Incidentes de TI
-- Total: 3 Reuniões + 6 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================

DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
  v_reuniao_2_id INTEGER;
  v_reuniao_3_id INTEGER;
BEGIN

-- ===================================================================
-- ETAPA 1: VALIDAÇÃO
-- ===================================================================

-- Buscar ID do comitê CTITI
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CTITI';

-- Verificar se comitê existe
IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'Comitê CTITI não encontrado. Verifique se o comitê foi criado na tabela comites.';
END IF;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'Iniciando população do comitê CTITI (ID: %)', v_comite_id;
RAISE NOTICE '===================================================================';

-- ===================================================================
-- REUNIÃO 1 - 31/03/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 1, 2025, '2025-03-31', 'março', 'Realizada', 'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Primeira reunião - Definição de escopo e fluxo de trabalho',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Apresentação do escopo do Comitê;', 1),
  (v_reuniao_1_id, 2, 'Definição do fluxo de trabalho;', 2),
  (v_reuniao_1_id, 3, 'Incidente no PROJUDI do fim de semana de 21 a 23/03.', 3)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 1 inserida - 3 itens de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 2 - 09/05/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 2, 2025, '2025-05-09', 'maio', 'Realizada', 'Reunião 2 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Apresentação de relatórios e ferramentas',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_2_id;

IF v_reuniao_2_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_2_id, 1, '202502000612948 - Apresentação ao Comitê do Relatório da Oficina de Incidentes Críticos de TI e a Matriz de Incidentes e Nível de Criticidade;', 1),
  (v_reuniao_2_id, 2, 'Sugestão de adoção da ferramenta para documentação: Huly', 2)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 2 inserida - 2 itens de pauta';
END IF;

-- ===================================================================
-- REUNIÃO 3 - 05/08/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, numero, ano, data, mes, status, titulo,
  link_proad, link_transparencia, observacoes,
  created_at, updated_at
) VALUES (
  v_comite_id, 3, 2025, '2025-08-05', 'agosto', 'Realizada', 'Reunião 3 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-tratamento-de-incidentes-de-ti',
  'Análise de incidente crítico no Projudi',
  NOW(), NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_3_id;

IF v_reuniao_3_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_3_id, 1, 'Instabilidade no Projudi - dia 04/08/2025', 1)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  RAISE NOTICE 'Reunião 3 inserida - 1 item de pauta';
END IF;

-- ===================================================================
-- FINALIZAÇÃO
-- ===================================================================

RAISE NOTICE '';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'POPULAÇÃO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'Comitê: CTITI (ID: %)', v_comite_id;
RAISE NOTICE 'Reuniões inseridas: 3';
RAISE NOTICE 'Itens de pauta inseridos: 6';
RAISE NOTICE '===================================================================';

END $$;

-- ============================================================
-- VERIFICAÇÃO: Contar reuniões e pautas inseridas
-- ============================================================
SELECT 
  c.sigla AS comite,
  COUNT(DISTINCT r.id) AS total_reunioes,
  COUNT(p.id) AS total_itens_pauta
FROM comites c
LEFT JOIN comite_reunioes r ON r.comite_id = c.id AND r.ano = 2025
LEFT JOIN comite_reuniao_pauta p ON p.reuniao_id = r.id
WHERE c.sigla = 'CTITI'
GROUP BY c.sigla;











