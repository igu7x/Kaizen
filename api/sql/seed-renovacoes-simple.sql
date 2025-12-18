-- ============================================================
-- SEED SIMPLES DE RENOVAÇÕES - EXECUTAR NO PGADMIN
-- ============================================================

-- 1. Limpar dados existentes (se houver)
DELETE FROM pca_renovacoes;

-- 2. Resetar sequência do ID
ALTER SEQUENCE pca_renovacoes_id_seq RESTART WITH 1;

-- 3. Inserir os 12 registros
INSERT INTO pca_renovacoes (
  item_pca, 
  area_demandante, 
  gestor_demandante, 
  contratada, 
  objeto, 
  valor_anual, 
  data_estimada_contratacao,
  status,
  is_deleted
) VALUES
-- Janeiro
('PCA 255', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'DISRUPTEC BRASIL S/A',
 'Renovação do contrato de fornecimento de plataforma em nuvem para detecção e remediação de ameaças cibernéticas.',
 1828260.02, 'Janeiro', 'Não Iniciada', FALSE),

-- Fevereiro
('PCA 256', 'CSTI', 'Marcus Vinicius Gonzaga Ferreira', 'GLOBALWEB S/A',
 'Renovação do contrato de prestação de serviços de suporte às equipes de gestão técnica dos sistemas informatizados, envolvendo as soluções de redes, bancos de dados, storage, backup, virtualização e cloud computing.',
 10917500.00, 'Fevereiro', 'Não Iniciada', FALSE),

-- Maio
('PCA 236', 'CITEC', 'Adail Antônio Pinto Junior', 'X DIGITAL BRASIL LTDA', 
 'Renovação do contrato de fornecimento de 2 (dois) certificados digitais SSL, do tipo "wildcard" OV e do tipo A1 para computadores servidores com a finalidade de atender às necessidades atualmente demandadas.',
 9434.70, 'Maio', 'Não Iniciada', FALSE),

-- Julho
('PCA 237', 'CITEC', 'Adail Antônio Pinto Junior', 'OI S/A',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 2571660.00, 'Julho', 'Não Iniciada', FALSE),
('PCA 239', 'CITEC', 'Adail Antônio Pinto Junior', 'BRFIBRA TELECOMUNICAÇÕES LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 3390949.42, 'Julho', 'Não Iniciada', FALSE),
('PCA 240', 'CITEC', 'Adail Antônio Pinto Junior', 'RD TELECOM LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 557542.94, 'Julho', 'Não Iniciada', FALSE),
('PCA 241', 'CITEC', 'Adail Antônio Pinto Junior', 'CIRION TECHNOLOGIES DO BRASIL LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 1369658.30, 'Julho', 'Não Iniciada', FALSE),

-- Agosto
('PCA 238', 'CITEC', 'Adail Antônio Pinto Junior', 'VALE DO RIBEIRA INTERNET LTDA',
 'Renovação do contrato de prestação de serviço de Link de Dados e fornecimento de equipamentos em regime de comodato.',
 18320.40, 'Agosto', 'Não Iniciada', FALSE),
('PCA 264', 'CES', 'Wilana Carlos da Silva', 'MLV PRODUTOS E SERV. EM TECNOLOGIA',
 'Renovação do contrato de gestão de processos de desenvolvimento e manutenção de sistemas.',
 200590.00, 'Agosto', 'Não Iniciada', FALSE),

-- Setembro
('PCA 242', 'CITEC', 'Adail Antônio Pinto Junior', 'KTREE PENSO LTDA',
 'Renovação do contrato de fornecimento de licenças de software de e-mail Zimbra, com disponibilização de ambiente de homologação (HML) e treinamento.',
 388202.79, 'Setembro', 'Não Iniciada', FALSE),

-- Dezembro
('PCA 243', 'CITEC', 'Adail Antônio Pinto Junior', 'NIVA TECNOLOGIA LTDA',
 'Renovação do contrato de serviço de suporte e subscrição de licenças de Inteligência Artificial e solução de Business Intelligence.',
 1659777.00, 'Dezembro', 'Não Iniciada', FALSE),
('PCA 272', 'SGJT', 'Gustavo Machado do Prado Dias Maciel', 'UFG',
 'Contratação de serviços destinados à realização do Programa de Residência em Tecnologia da Informação e Comunicação (TIC) para o Poder Judiciário de Goiás.',
 8355274.08, 'Dezembro', 'Não Iniciada', FALSE);

-- 4. Verificar inserção
SELECT 
    COUNT(*) as total_registros,
    SUM(valor_anual) as valor_total
FROM pca_renovacoes
WHERE is_deleted = FALSE;

-- 5. Listar todos em ordem cronológica
SELECT 
    id, 
    item_pca, 
    area_demandante, 
    LEFT(gestor_demandante, 30) as gestor,
    valor_anual, 
    data_estimada_contratacao, 
    status
FROM pca_renovacoes 
WHERE is_deleted = FALSE
ORDER BY 
    CASE data_estimada_contratacao
        WHEN 'Janeiro' THEN 1
        WHEN 'Fevereiro' THEN 2
        WHEN 'Março' THEN 3
        WHEN 'Abril' THEN 4
        WHEN 'Maio' THEN 5
        WHEN 'Junho' THEN 6
        WHEN 'Julho' THEN 7
        WHEN 'Agosto' THEN 8
        WHEN 'Setembro' THEN 9
        WHEN 'Outubro' THEN 10
        WHEN 'Novembro' THEN 11
        WHEN 'Dezembro' THEN 12
    END,
    item_pca;

-- 6. Resumo por área
SELECT 
    area_demandante,
    COUNT(*) as quantidade,
    SUM(valor_anual) as valor_total
FROM pca_renovacoes
WHERE is_deleted = FALSE
GROUP BY area_demandante
ORDER BY valor_total DESC;

-- ============================================================
-- RESULTADO ESPERADO:
-- - Total: 12 registros
-- - Valor Total: R$ 31.267.169,66
-- - CITEC: 8 registros
-- - CSTI: 2 registros
-- - CES: 1 registro
-- - SGJT: 1 registro
-- ============================================================

























