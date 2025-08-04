/*
  # Add gerar_resposta_comentario to prompt_tipo enum

  1. Changes
    - Add 'gerar_resposta_comentario' to the prompt_tipo enum
    - This allows the prompts_ia table to store this new type of prompt

  2. Security
    - No RLS changes needed as the table already has appropriate policies
*/

-- Add the new value to the prompt_tipo enum
ALTER TYPE prompt_tipo ADD VALUE 'gerar_resposta_comentario';
