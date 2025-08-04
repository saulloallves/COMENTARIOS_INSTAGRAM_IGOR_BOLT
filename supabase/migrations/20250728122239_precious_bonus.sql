/*
  # Insert exact fases matching database enum

  1. Fases
    - Uses only valid enum values from fase_tipo
    - Based on actual database schema
    - 6 phases total matching enum definition
*/

-- Insert fases using exact enum values from database schema
INSERT INTO fases (nome, descricao, ordem, cor, ativa) VALUES
  (
    'interacao',
    'Fase inicial de atração e engajamento. Foco em construir audiência e gerar expectativa.',
    1,
    '#3b82f6',
    true
  ),
  (
    'pre_compras', 
    'Preparação para início das compras. Comunicação sobre cronograma e expectativas.',
    2,
    '#eab308',
    true
  ),
  (
    'semana_1',
    'Primeira semana de operação. Foco em onboarding e primeiros passos.',
    3,
    '#a855f7',
    true
  ),
  (
    'semana_2',
    'Segunda semana de operação. Ajuda com dúvidas intermediárias.',
    4,
    '#ec4899',
    true
  ),
  (
    'semana_3',
    'Terceira semana de operação. Suporte avançado e otimizações.',
    5,
    '#6366f1',
    true
  ),
  (
    'semana_4',
    'Quarta semana de operação. Preparação para autonomia.',
    6,
    '#10b981',
    true
  )
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor,
  ativa = EXCLUDED.ativa,
  updated_at = now();
