-- ===================================================================
-- ADICIONAR ORGANOGRAMA PARA SGJT
-- Data: 2025-12-16
-- Descrição: Adicionar estrutura hierárquica para SGJT
-- ===================================================================

BEGIN;

-- Verificar se já existem dados SGJT
DO $$
DECLARE
  sgjt_exists INTEGER;
  diretoria_id INTEGER;
  coord1_id INTEGER;
  coord2_id INTEGER;
  div1_id INTEGER;
  div2_id INTEGER;
  div3_id INTEGER;
  div4_id INTEGER;
BEGIN
  SELECT COUNT(*) INTO sgjt_exists 
  FROM pessoas_organograma_gestores 
  WHERE diretoria = 'SGJT' AND ativo = TRUE;
  
  IF sgjt_exists > 0 THEN
    RAISE NOTICE '⚠ Organograma SGJT já existe. Pulando inserção.';
  ELSE
    RAISE NOTICE 'Criando organograma SGJT...';
    
    -- Linha 1: Diretoria SGJT
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Secretaria de Governança Judiciária e Tecnológica', 'Carlos Eduardo Mendes', 'Secretário', 1, '#1565C0', 'SGJT', 1)
    RETURNING id INTO diretoria_id;
    
    RAISE NOTICE '  ✓ Diretoria criada (ID: %)', diretoria_id;
    
    -- Linha 2: Coordenadorias
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Coordenadoria de Governança', 'Ana Paula Santos', 'Coordenadora', 2, diretoria_id, '#2E7D32', 'SGJT', 1)
    RETURNING id INTO coord1_id;
    
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Coordenadoria de Tecnologia', 'Roberto Silva', 'Coordenador', 2, diretoria_id, '#D32F2F', 'SGJT', 2)
    RETURNING id INTO coord2_id;
    
    RAISE NOTICE '  ✓ 2 Coordenadorias criadas';
    
    -- Linha 3: Divisões (2 por coordenadoria)
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Divisão de Planejamento Estratégico', 'Juliana Costa', 'Chefe de Divisão', 3, coord1_id, '#388E3C', 'SGJT', 1)
    RETURNING id INTO div1_id;
    
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Divisão de Gestão de Projetos', 'Marcos Oliveira', 'Chefe de Divisão', 3, coord1_id, '#4CAF50', 'SGJT', 2)
    RETURNING id INTO div2_id;
    
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Divisão de Infraestrutura Tecnológica', 'Patricia Rodrigues', 'Chefe de Divisão', 3, coord2_id, '#E53935', 'SGJT', 3)
    RETURNING id INTO div3_id;
    
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Divisão de Desenvolvimento de Sistemas', 'Fernando Alves', 'Chefe de Divisão', 3, coord2_id, '#C62828', 'SGJT', 4)
    RETURNING id INTO div4_id;
    
    RAISE NOTICE '  ✓ 4 Divisões criadas';
    
    -- Linha 4: Núcleos (1 por divisão)
    INSERT INTO pessoas_organograma_gestores (
      nome_area, nome_gestor, nome_cargo, linha_organograma, subordinacao_id, cor_barra, diretoria, ordem_exibicao
    ) VALUES 
    ('Núcleo de Indicadores e Métricas', 'Beatriz Lima', 'Diretor de Serviço', 4, div1_id, '#616161', 'SGJT', 1),
    ('Núcleo de Gestão de Portfólio', 'Claudio Martins', 'Diretor de Serviço', 4, div2_id, '#616161', 'SGJT', 2),
    ('Núcleo de Redes e Comunicação', 'Diana Ferreira', 'Diretor de Serviço', 4, div3_id, '#616161', 'SGJT', 3),
    ('Núcleo de Aplicações Corporativas', 'Eduardo Ribeiro', 'Diretor de Serviço', 4, div4_id, '#616161', 'SGJT', 4);
    
    RAISE NOTICE '  ✓ 4 Núcleos criados';
    
    RAISE NOTICE '===================================================================';
    RAISE NOTICE '✅ ORGANOGRAMA SGJT CRIADO COM SUCESSO!';
    RAISE NOTICE 'Estrutura SGJT:';
    RAISE NOTICE '  - 1 Secretaria (Nível 1)';
    RAISE NOTICE '  - 2 Coordenadorias (Nível 2)';
    RAISE NOTICE '  - 4 Divisões (Nível 3)';
    RAISE NOTICE '  - 4 Núcleos (Nível 4)';
    RAISE NOTICE '  - TOTAL: 11 registros';
    RAISE NOTICE '===================================================================';
  END IF;
END $$;

COMMIT;







