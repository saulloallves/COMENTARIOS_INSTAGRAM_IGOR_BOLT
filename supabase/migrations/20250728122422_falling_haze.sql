/*
  # Insert valid fases into database

  1. New Records
    - Insert only the 6 valid fase_tipo enum values
    - Each fase has nome, descricao, ordem, cor, and ativa status
  
  2. Valid Enum Values
    - interacao: Initial engagement phase
    - pre_compras: Pre-purchase preparation
    - semana_1: First week of operation
    - semana_2: Second week of operation  
    - semana_3: Third week of operation
    - semana_4: Fourth week of operation
*/

INSERT INTO fases (nome, descricao, ordem, cor, ativa) VALUES
  ('interacao', 'Fase inicial de atração e engajamento. Foco em construir audiência e gerar expectativa.', 1, '#3b82f6', true),
  ('pre_compras', 'Preparação para início das compras. Comunicação sobre cronograma e expectativas.', 2, '#eab308', true),
  ('semana_1', 'Primeira semana de operação. Foco em estabelecer rotinas e processos.', 3, '#a855f7', true),
  ('semana_2', 'Segunda semana de operação. Ajustes e otimizações baseados na primeira semana.', 4, '#ec4899', true),
  ('semana_3', 'Terceira semana de operação. Consolidação de processos e expansão.', 5, '#6366f1', true),
  ('semana_4', 'Quarta semana de operação. Preparação para próxima fase ou ciclo.', 6, '#10b981', true)
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor,
  ativa = EXCLUDED.ativa,
  updated_at = now();
