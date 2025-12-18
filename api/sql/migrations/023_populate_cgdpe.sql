-- ===================================================================
-- MIGRAÇÃO: POPULAR COMITÊ CGDPE
-- Comitê Gestor da Diretoria de Processo Eletrônico
-- Total: 1 Reunião + 4 Itens de Pauta
-- Data: 2025-12-12
-- ===================================================================

DO $$
DECLARE
  v_comite_id INTEGER;
  v_reuniao_1_id INTEGER;
BEGIN

-- ===================================================================
-- ETAPA 1: VALIDAÇÃO
-- ===================================================================

-- Buscar ID do comitê CGDPE
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGDPE';

-- Verificar se comitê existe
IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'Comitê CGDPE não encontrado. Verifique se o comitê foi criado na tabela comites.';
END IF;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'Iniciando população do comitê CGDPE (ID: %)', v_comite_id;
RAISE NOTICE '===================================================================';

-- ===================================================================
-- ETAPA 2: INSERIR DADOS
-- ===================================================================

-- ===================================================================
-- REUNIÃO 1 - 02/06/2025
-- ===================================================================
INSERT INTO comite_reunioes (
  comite_id, 
  numero, 
  ano, 
  data, 
  mes, 
  status, 
  titulo,
  link_proad, 
  link_transparencia, 
  observacoes,
  created_at, 
  updated_at
) VALUES (
  v_comite_id, 
  1, 
  2025, 
  '2025-06-02', 
  'junho', 
  'Realizada', 
  'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-gestor-da-diretoria-de-processo-eletronico',
  'Primeira reunião do CGDPE em 2025',
  NOW(), 
  NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

-- Pauta da Reunião 1
IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Apresentação da nova composição;', 1),
  (v_reuniao_1_id, 2, 'Apresentação de diagnóstico realizado pela SGJT;', 2),
  (v_reuniao_1_id, 3, 'Feedback sobre curso do ISO;', 3),
  (v_reuniao_1_id, 4, 'Estadualização de centrais.', 4)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  
  RAISE NOTICE 'Reunião 1 inserida - 4 itens de pauta';
END IF;

-- ===================================================================
-- FINALIZAÇÃO
-- ===================================================================

RAISE NOTICE '';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'POPULAÇÃO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'Comitê: CGDPE (ID: %)', v_comite_id;
RAISE NOTICE 'Reuniões inseridas: 1';
RAISE NOTICE 'Itens de pauta inseridos: 4';
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
WHERE c.sigla = 'CGDPE'
GROUP BY c.sigla;











