-- Migration: Semear renovações do PCA 2026
-- Objetivo: garantir que os 12 registros estejam inseridos, com details e checklist
-- Seguro para reexecução (usa ON CONFLICT / WHERE NOT EXISTS)

-- ============================================================================
-- Inserir (ou garantir) as 12 renovações
-- ============================================================================

INSERT INTO pca_renovacoes (
  item_pca, area_demandante, gestor_demandante, contratada, objeto,
  valor_anual, data_estimada_contratacao, status
) VALUES
('PCA 236', 'CITEC', 'Adail Antônio Pinto Junior', 'X DIGITAL BRASIL LTDA',
 'Renovação do contrato de fornecimento de 2 (dois) certificados digitais SSL, do tipo "wildcard" OV e do tipo A1 para computadores servidores com a finalidade de atender às necessidades atualmente demandadas.',
 9434.70, 'Maio', 'Não Iniciada'),
('PCA 237', 'CITEC', 'Adail Antônio Pinto Junior', 'OI S/A',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 2571660.00, 'Julho', 'Não Iniciada'),
('PCA 238', 'CITEC', 'Adail Antônio Pinto Junior', 'VALE DO RIBEIRA INTERNET LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 18320.40, 'Agosto', 'Não Iniciada'),
('PCA 239', 'CITEC', 'Adail Antônio Pinto Junior', 'BRFIBRA TELECOMUNICAÇÕES LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 3390949.42, 'Julho', 'Não Iniciada'),
('PCA 240', 'CITEC', 'Adail Antônio Pinto Junior', 'RD TELECOM LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 557542.94, 'Julho', 'Não Iniciada'),
('PCA 241', 'CITEC', 'Adail Antônio Pinto Junior', 'CIRION TECHNOLOGIES DO BRASIL LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 1369658.30, 'Julho', 'Não Iniciada'),
('PCA 242', 'CITEC', 'Adail Antônio Pinto Junior', 'KTREE PENSO LTDA',
 'Renovação do contrato de fornecimento de licenças de software de e-mail Zimbra, com disponibilização de ambiente de homologação (HML) e treinamento.',
 388202.79, 'Setembro', 'Não Iniciada'),
('PCA 243', 'CITEC', 'Adail Antônio Pinto Junior', 'NIVA TECNOLOGIA LTDA',
 'Renovação do contrato de serviço de suporte e subscrição de licenças de Inteligência Artificial e solução de Business Intelligence.',
 1659777.00, 'Dezembro', 'Não Iniciada'),
('PCA 255', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'DISRUPTEC BRASIL S/A',
 'Renovação do contrato de fornecimento de plataforma em nuvem para detecção e remediação de ameaças cibernéticas.',
 1828260.02, 'Janeiro', 'Não Iniciada'),
('PCA 256', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'GLOBALWEB S/A',
 'Renovação do contrato de prestação de serviços de suporte às equipes de gestão técnica dos sistemas informatizados, envolvendo as soluções de redes, bancos de dados, storage, backup, virtualização e cloud computing.',
 10917500.00, 'Fevereiro', 'Não Iniciada'),
('PCA 264', 'CES', 'Wilana Carlos da Silva', 'MLV PRODUTOS E SERV. EM TECNOLOGIA',
 'Renovação do contrato de gestão de processos de desenvolvimento e manutenção de sistemas.',
 200590.00, 'Agosto', 'Não Iniciada'),
('PCA 272', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'UFG',
 'Contratação de serviços destinados à realização do Programa de Residência em Tecnologia da Informação e Comunicação (TIC) para o Poder Judiciário de Goiás.',
 8355274.08, 'Dezembro', 'Não Iniciada')
ON CONFLICT (item_pca) DO NOTHING;

-- ============================================================================
-- Inserir details (1 por renovação) caso falte
-- ============================================================================

INSERT INTO pca_item_details (renovacao_id, tipo, validacao_dg_tipo, validacao_dg_data, fase_atual)
SELECT id, 'renovacao', 'Pendente', NULL, NULL
FROM pca_renovacoes r
WHERE NOT EXISTS (
  SELECT 1 FROM pca_item_details d WHERE d.renovacao_id = r.id
);

-- ============================================================================
-- Inserir checklist (6 itens por renovação) caso falte
-- ============================================================================

INSERT INTO pca_checklist_items (renovacao_id, tipo, item_nome, item_ordem, status)
SELECT 
  r.id,
  'renovacao',
  items.nome,
  items.ordem,
  'Não Iniciada'
FROM pca_renovacoes r
CROSS JOIN (
  VALUES 
    ('DOD', 1),
    ('ETP', 2),
    ('TR', 3),
    ('MGR', 4),
    ('Análise de mercado', 5),
    ('Distribuição orçamentária', 6)
) AS items(nome, ordem)
WHERE NOT EXISTS (
  SELECT 1 FROM pca_checklist_items c
  WHERE c.renovacao_id = r.id AND c.item_nome = items.nome
);

























