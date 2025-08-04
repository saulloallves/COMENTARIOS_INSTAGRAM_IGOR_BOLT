/*
  # Add gerar_resposta_comentario to prompt_tipo enum

  1. Changes
    - Add 'gerar_resposta_comentario' to the prompt_tipo enum
    - This allows creating prompts specifically for generating comment responses

  2. Security
    - No changes to existing RLS policies
    - Maintains current access controls
*/

-- Add the new enum value to prompt_tipo
ALTER TYPE prompt_tipo ADD VALUE IF NOT EXISTS 'gerar_resposta_comentario';
