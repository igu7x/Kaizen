-- ===================================================================
-- MIGRAÇÃO: POPULAR COMITÊ CGGPIAC
-- Comitê de Governança e Gestão de Projetos de Inteligência 
-- Artificial e Cognição Automatizada
-- Total: 1 Reunião + 6 Itens de Pauta
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

-- Buscar ID do comitê CGGPIAC
SELECT id INTO v_comite_id FROM comites WHERE sigla = 'CGGPIAC';

-- Verificar se comitê existe
IF v_comite_id IS NULL THEN
  RAISE EXCEPTION 'Comitê CGGPIAC não encontrado. Verifique se o comitê foi criado na tabela comites.';
END IF;

RAISE NOTICE '===================================================================';
RAISE NOTICE 'Iniciando população do comitê CGGPIAC (ID: %)', v_comite_id;
RAISE NOTICE '===================================================================';

-- ===================================================================
-- ETAPA 2: INSERIR DADOS
-- ===================================================================

-- ===================================================================
-- REUNIÃO 1 - 16/07/2025
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
  '2025-07-16', 
  'julho', 
  'Realizada', 
  'Reunião 1 - 2025',
  'https://portaltj.tjgo.jus.br/sistemas/index.php?s=corporativo&mensagem=ausencia_cookies_proad',
  'https://www.tjgo.jus.br/index.php/comissoes-comites/comites/comite-de-governanca-e-gestao-de-projetos-de-inteligencia-artificial-e-cognicao-automatizada',
  'Primeira reunião do CGGPIAC em 2025 - Foco em IA e governança de dados',
  NOW(), 
  NOW()
)
ON CONFLICT (comite_id, numero, ano) DO NOTHING
RETURNING id INTO v_reuniao_1_id;

-- Pauta da Reunião 1
IF v_reuniao_1_id IS NOT NULL THEN
  INSERT INTO comite_reuniao_pauta (reuniao_id, numero_item, descricao, ordem) VALUES
  (v_reuniao_1_id, 1, 'Apresentação da nova composição, conforme Decreto Judiciário 3.352/2025 (Proad 202205000337259);', 1),
  (v_reuniao_1_id, 2, 'Fluxo de apresentação das novas aplicações;', 2),
  (v_reuniao_1_id, 3, 'Parcerias interinstitucionais;', 3),
  (v_reuniao_1_id, 4, 'Proad 202410000576720 - TJMT solicita compartilhamento AGAIA;', 4),
  (v_reuniao_1_id, 5, 'Proad 202402000484813 - Integração Berna 2º Grau;', 5),
  (v_reuniao_1_id, 6, '202503000623404 - Resolução CNJ 615/2025 — Normas sobre IA.', 6)
  ON CONFLICT (reuniao_id, numero_item) DO NOTHING;
  
  RAISE NOTICE 'Reunião 1 inserida - 6 itens de pauta';
END IF;

-- ===================================================================
-- FINALIZAÇÃO
-- ===================================================================

RAISE NOTICE '';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'POPULAÇÃO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '===================================================================';
RAISE NOTICE 'Comitê: CGGPIAC (ID: %)', v_comite_id;
RAISE NOTICE 'Reuniões inseridas: 1';
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
WHERE c.sigla = 'CGGPIAC'
GROUP BY c.sigla;











