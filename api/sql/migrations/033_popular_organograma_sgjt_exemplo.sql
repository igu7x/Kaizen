-- ===================================================================
-- MIGRATION: POPULAR ORGANOGRAMA SGJT COM DADOS DE EXEMPLO
-- Data: 2025-12-16
-- Descrição: Criar organograma SGJT usando os 5 colaboradores existentes
-- ===================================================================

BEGIN;

-- ===================================================================
-- LIMPAR DADOS ANTERIORES
-- ===================================================================

-- Desativar organograma anterior
UPDATE pessoas_organograma_gestores 
SET ativo = FALSE, updated_at = NOW()
WHERE diretoria IN ('DPE', 'SGJT');

-- ===================================================================
-- INSERIR NOVA ESTRUTURA SGJT
-- ===================================================================

-- LINHA 1: DIRETORIA - João Fulano de Tal (Secretário)
INSERT INTO pessoas_organograma_gestores (
  nome_area, 
  nome_gestor, 
  nome_cargo, 
  foto_gestor,
  linha_organograma, 
  subordinacao_id, 
  cor_barra, 
  diretoria, 
  ordem_exibicao,
  ativo, 
  created_at, 
  updated_at
) VALUES (
  'Secretaria de Governança Judiciária e Tecnológica',
  'João Fulano de Tal',
  'Secretário',
  NULL,
  1,
  NULL,
  NULL,
  'SGJT',
  1,
  TRUE,
  NOW(),
  NOW()
);

-- ===================================================================
-- INSERIR NÍVEIS SUBSEQUENTES
-- ===================================================================
DO $$
DECLARE
  v_sgjt_id INTEGER;
  v_coord_id INTEGER;
  v_divisao_id INTEGER;
BEGIN
  -- Buscar ID da SGJT
  SELECT id INTO v_sgjt_id 
  FROM pessoas_organograma_gestores 
  WHERE nome_area = 'Secretaria de Governança Judiciária e Tecnológica'
  AND linha_organograma = 1 
  AND ativo = TRUE
  ORDER BY id DESC 
  LIMIT 1;
  
  IF v_sgjt_id IS NULL THEN
    RAISE EXCEPTION 'SGJT não encontrada!';
  END IF;
  
  RAISE NOTICE 'SGJT ID: %', v_sgjt_id;
  
  -- LINHA 2: COORDENADORIA - Jose João Pedro (Coordenador)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor,
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
    ativo, created_at, updated_at
  ) VALUES (
    'Coordenadoria XYZ',
    'Jose João Pedro',
    'Coordenador',
    NULL,
    2,
    v_sgjt_id,
    '#1976D2',
    'SGJT',
    1,
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO v_coord_id;
  
  RAISE NOTICE 'Coordenadoria XYZ ID: %', v_coord_id;
  
  -- LINHA 3: DIVISÃO - Maria do Exemplo (Auxiliar Judiciário)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor,
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
    ativo, created_at, updated_at
  ) VALUES (
    'Divisão ABC',
    'Maria do Exemplo',
    'Auxiliar Judiciário',
    NULL,
    3,
    v_coord_id,
    '#8E24AA',
    'SGJT',
    1,
    TRUE,
    NOW(),
    NOW()
  ) RETURNING id INTO v_divisao_id;
  
  RAISE NOTICE 'Divisão ABC ID: %', v_divisao_id;
  
  -- LINHA 4: NÚCLEO A - Paula Maria (Auxiliar Judiciário)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor,
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
    ativo, created_at, updated_at
  ) VALUES (
    'Núcleo A',
    'Paula Maria',
    'Auxiliar Judiciário',
    NULL,
    4,
    v_divisao_id,
    '#757575',
    'SGJT',
    1,
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Núcleo A criado (Paula Maria)';
  
  -- LINHA 4: NÚCLEO B - Susana do Exemplo (Auxiliar Judiciário)
  INSERT INTO pessoas_organograma_gestores (
    nome_area, nome_gestor, nome_cargo, foto_gestor,
    linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao,
    ativo, created_at, updated_at
  ) VALUES (
    'Núcleo XYX',
    'Susana do Exemplo',
    'Auxiliar Judiciário',
    NULL,
    4,
    v_divisao_id,
    '#757575',
    'SGJT',
    2,
    TRUE,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Núcleo XYX criado (Susana do Exemplo)';
  
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'ORGANOGRAMA SGJT CRIADO COM SUCESSO!';
  RAISE NOTICE '-------------------------------------------------------------------';
  RAISE NOTICE 'Estrutura:';
  RAISE NOTICE '  Linha 1 (Diretoria): João Fulano de Tal - Secretário';
  RAISE NOTICE '  Linha 2 (Coordenadoria): Jose João Pedro - Coordenador';
  RAISE NOTICE '  Linha 3 (Divisão): Maria do Exemplo - Auxiliar Judiciário';
  RAISE NOTICE '  Linha 4 (Núcleos):';
  RAISE NOTICE '    - Paula Maria - Auxiliar Judiciário';
  RAISE NOTICE '    - Susana do Exemplo - Auxiliar Judiciário';
  RAISE NOTICE '===================================================================';
END $$;

-- ===================================================================
-- VERIFICAÇÃO
-- ===================================================================
DO $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM pessoas_organograma_gestores
  WHERE diretoria = 'SGJT' AND ativo = TRUE;
  
  IF v_total != 5 THEN
    RAISE EXCEPTION 'Esperado 5 registros, encontrado: %', v_total;
  END IF;
  
  RAISE NOTICE 'Verificação OK: % registros criados', v_total;
END $$;

COMMIT;






