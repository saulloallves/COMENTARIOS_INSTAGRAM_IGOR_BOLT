/*
  # Add 'gerar_resposta' to prompt_tipo enum

  1. Changes
    - Add 'gerar_resposta' value to prompt_tipo enum
    - This will allow creating prompts for generating responses to comments

  2. Security
    - No changes to existing RLS policies
    - Maintains current access controls
*/

-- Add new value to the prompt_tipo enum
ALTER TYPE prompt_tipo ADD VALUE 'gerar_resposta';
