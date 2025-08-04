/*
  # Add missing enum values to fase_tipo and create remaining fases

  1. New enum values added to fase_tipo:
    - `pos_compras` (pós-compras phase)
    - `fidelizacao` (customer retention phase)

  2. New fases created:
    - Pós-Compras (order 7)
    - Fidelização (order 8)
    - Plus one more operational phase

  3. Security:
    - Uses existing RLS policies
    - Safe enum extension with ALTER TYPE
*/

-- Add missing enum values to fase_tipo
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pos_compras';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'fidelizacao';

-- Insert the 3 missing fases
INSERT INTO fases (nome, descricao, ordem, cor, ativa, descricao_completa, observacoes, duracao_minima_dias, duracao_maxima_dias, requer_aprovacao, permite_transicao_automatica, status) VALUES
  (
    'pos_compras',
    'Período pós-compras. Preparação para inauguração e organização do estoque.',
    7,
    '#f97316',
    true,
    'Fase que ocorre após o encerramento das compras, focada na preparação final para inauguração. Inclui organização do estoque, precificação final, preparação do espaço físico e comunicação da data de inauguração.',
    'Fase crítica para garantir que tudo esteja pronto para a inauguração. Comunicação clara sobre cronograma é essencial.',
    7,
    14,
    false,
    true,
    'ativa'
  ),
  (
    'fidelizacao',
    'Programa de fidelização e retenção de clientes.',
    8,
    '#dc2626',
    true,
    'Fase focada na retenção de clientes através de programas de fidelidade, ofertas exclusivas, comunicação personalizada e preparação para novos ciclos de operação.',
    'Manter engajamento alto e preparar terreno para futuros ciclos. Análise de dados de comportamento do cliente é fundamental.',
    30,
    null,
    false,
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
