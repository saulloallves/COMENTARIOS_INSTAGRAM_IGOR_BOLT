/*
  # Update fase_tipo enum with correct phase values

  1. Database Changes
    - Add missing enum values to fase_tipo enum
    - Ensure all phase names from the application are supported

  2. Enum Values Added
    - 'interacao'
    - 'pre_compras' 
    - 'compras'
    - 'pre_inauguracao_semana_1'
    - 'pre_inauguracao_semana_2'
    - 'inauguracao'
    - 'operacao'
    - 'loja_fechada_temporariamente'
    - 'loja_fechada_definitivamente'

  This fixes the "invalid input value for enum fase_tipo" error by ensuring
  the database enum matches the values used in the application.
*/

-- Add the missing enum values to the fase_tipo enum
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'interacao';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_compras';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'compras';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_1';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_2';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'inauguracao';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'operacao';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_temporariamente';
ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_definitivamente';
