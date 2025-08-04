/*
  # Create complete fases system

  1. Complete Fases
    - Create all 9 operational phases
    - Proper ordering and relationships
    - Complete configuration

  2. Features
    - All enum values from previous migration
    - Proper phase flow and relationships
    - Complete descriptions and configurations
*/

-- Clear existing fases to rebuild completely
DELETE FROM fases;

-- Insert all 9 operational phases with complete configuration
INSERT INTO fases (
  nome, 
  descricao, 
  ordem, 
  cor, 
  ativa,
  descricao_completa,
  observacoes,
  duracao_minima_dias,
  duracao_maxima_dias,
  requer_aprovacao,
  permite_transicao_automatica,
  status
) VALUES 
  (
    'interacao',
    'Fase inicial de atração e engajamento. Foco em construir audiência e gerar expectativa.',
    1,
    '#3b82f6',
    true,
    'Fase fundamental para construir base sólida de seguidores interessados no conceito brechó. Foco em educação sobre sustentabilidade e moda circular.',
    'Não revelar preços ou aceitar desapegos nesta fase. Foco total em construção de audiência qualificada.',
    null,
    null,
    false,
    false,
    'ativa'
  ),
  (
    'pre_compras',
    'Preparação para início das compras. Comunicação sobre cronograma e expectativas.',
    2,
    '#eab308',
    true,
    'Preparação da comunidade para o período de compras. Comunicação clara sobre cronograma, critérios e processo.',
    'Comunicação clara sobre cronograma é essencial para preparar a comunidade adequadamente.',
    7,
    14,
    false,
    false,
    'ativa'
  ),
  (
    'compras',
    'Período ativo de recebimento de desapegos. Foco em aquisição de estoque.',
    3,
    '#10b981',
    true,
    'Período mais importante para construção do estoque. Avaliação criteriosa de peças para garantir qualidade do acervo final.',
    'Manter critérios de qualidade rigorosos para garantir estoque atrativo para os clientes.',
    14,
    30,
    false,
    false,
    'ativa'
  ),
  (
    'pre_inauguracao_semana_1',
    'Última semana de compras com urgência. Finalização do estoque.',
    4,
    '#8b5cf6',
    true,
    'Intensificação das compras com senso de urgência real. Foco em completar categorias em falta no estoque.',
    'Criar senso real de urgência sem gerar ansiedade excessiva na comunidade.',
    7,
    7,
    false,
    false,
    'ativa'
  ),
  (
    'pre_inauguracao_semana_2',
    'Compras encerradas. Preparação final e comunicação da data de inauguração.',
    5,
    '#ec4899',
    true,
    'Preparação final da loja e comunicação oficial da data de inauguração. Organização do estoque e precificação.',
    'Momento crucial para gerar expectativa máxima e garantir presença na inauguração.',
    7,
    7,
    false,
    false,
    'ativa'
  ),
  (
    'inauguracao',
    'Dia da inauguração oficial. Evento de abertura e primeiras vendas.',
    6,
    '#6366f1',
    true,
    'Evento de inauguração com foco na experiência do cliente. Primeiras vendas e estabelecimento da presença local.',
    'Foco total na experiência do cliente e criação de buzz positivo para a marca.',
    1,
    3,
    false,
    false,
    'ativa'
  ),
  (
    'operacao',
    'Operação normal da loja. Vendas regulares e atendimento ao cliente.',
    7,
    '#059669',
    true,
    'Operação regular da loja com vendas consistentes. Atendimento ao cliente e gestão do estoque até esgotamento.',
    'Manter qualidade do atendimento e começar planejamento do próximo ciclo.',
    30,
    90,
    false,
    false,
    'ativa'
  ),
  (
    'loja_fechada_temporariamente',
    'Fechamento temporário para manutenção, reforma ou preparação de novo ciclo.',
    8,
    '#f97316',
    true,
    'Fechamento temporário para preparação de novo ciclo, manutenções ou reformas necessárias.',
    'Manter comunicação ativa para não perder conexão com a comunidade.',
    null,
    null,
    false,
    false,
    'ativa'
  ),
  (
    'loja_fechada_definitivamente',
    'Encerramento definitivo das operações da unidade.',
    9,
    '#dc2626',
    true,
    'Encerramento definitivo e respeitoso das operações, com comunicação transparente à comunidade.',
    'Encerramento respeitoso e transparente, mantendo boa reputação da marca.',
    null,
    null,
    true,
    false,
    'ativa'
  )
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor,
  ativa = EXCLUDED.ativa,
  descricao_completa = EXCLUDED.descricao_completa,
  observacoes = EXCLUDED.observacoes,
  duracao_minima_dias = EXCLUDED.duracao_minima_dias,
  duracao_maxima_dias = EXCLUDED.duracao_maxima_dias,
  requer_aprovacao = EXCLUDED.requer_aprovacao,
  permite_transicao_automatica = EXCLUDED.permite_transicao_automatica,
  status = EXCLUDED.status,
  updated_at = now();

-- Update phase relationships (proxima_fase_id)
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'pre_compras') WHERE nome = 'interacao';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'compras') WHERE nome = 'pre_compras';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'pre_inauguracao_semana_1') WHERE nome = 'compras';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'pre_inauguracao_semana_2') WHERE nome = 'pre_inauguracao_semana_1';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'inauguracao') WHERE nome = 'pre_inauguracao_semana_2';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'operacao') WHERE nome = 'inauguracao';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'loja_fechada_temporariamente') WHERE nome = 'operacao';
UPDATE fases SET proxima_fase_id = (SELECT id FROM fases WHERE nome = 'interacao') WHERE nome = 'loja_fechada_temporariamente';
-- loja_fechada_definitivamente não tem próxima fase (fim do ciclo)
