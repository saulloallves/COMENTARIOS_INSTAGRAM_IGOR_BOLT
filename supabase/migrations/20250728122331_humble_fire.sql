/*
  # Insert valid fases based on existing enum

  1. New Records
    - Insert only the 6 valid enum values from fase_tipo
    - Each fase with proper ordem, cor, and ativa status
  
  2. Data Structure
    - Uses exact enum values: interacao, pre_compras, semana_1, semana_2, semana_3, semana_4
    - Sequential ordem from 1-6
    - Appropriate colors for each phase
    - All phases active by default
*/

-- Insert the 6 valid fases based on the enum values
INSERT INTO fases (nome, descricao, ordem, cor, ativa) VALUES
  ('interacao', 'Fase inicial de atração e engajamento. Foco em construir audiência e gerar expectativa.', 1, '#3b82f6', true),
  ('pre_compras', 'Preparação para início das compras. Comunicação sobre cronograma e expectativas.', 2, '#eab308', true),
  ('semana_1', 'Primeira semana de operação. Foco em onboarding e primeiros passos.', 3, '#a855f7', true),
  ('semana_2', 'Segunda semana de operação. Ajuda com dúvidas intermediárias.', 4, '#ec4899', true),
  ('semana_3', 'Terceira semana de operação. Suporte avançado e otimizações.', 5, '#6366f1', true),
  ('semana_4', 'Quarta semana de operação. Preparação para autonomia.', 6, '#10b981', true)
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor,
  ativa = EXCLUDED.ativa,
  updated_at = now();
