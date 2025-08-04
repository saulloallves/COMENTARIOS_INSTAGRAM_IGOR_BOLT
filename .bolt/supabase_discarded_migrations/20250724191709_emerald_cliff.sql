/*
  # Add action fields to Instagram comments

  1. New Columns
    - `deve_responder` (boolean) - Indicates if the comment should be responded to
    - `deve_apagar` (boolean) - Indicates if the comment should be deleted
    - `resposta_sugerida` (text) - AI suggested response for the comment
    - `justificativa` (text) - AI justification for the classification
    - `confianca` (numeric) - AI confidence score (0-1)
    - `classificacao` (text) - Comment classification (aprovado/reprovado/pendente)
    - `processado_em` (timestamptz) - When the comment was processed by AI

  2. Updates
    - Add default values for new boolean fields
    - Add check constraints for classification values
    - Add index for better query performance
*/

-- Add new columns to comentarios_instagram table
DO $$
BEGIN
  -- Add deve_responder column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'deve_responder'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN deve_responder boolean DEFAULT false;
  END IF;

  -- Add deve_apagar column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'deve_apagar'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN deve_apagar boolean DEFAULT false;
  END IF;

  -- Add resposta_sugerida column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'resposta_sugerida'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN resposta_sugerida text;
  END IF;

  -- Add justificativa column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'justificativa'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN justificativa text;
  END IF;

  -- Add confianca column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'confianca'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN confianca numeric(3,2) CHECK (confianca >= 0 AND confianca <= 1);
  END IF;

  -- Add classificacao column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'classificacao'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN classificacao text CHECK (classificacao IN ('aprovado', 'reprovado', 'pendente'));
  END IF;

  -- Add processado_em column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comentarios_instagram' AND column_name = 'processado_em'
  ) THEN
    ALTER TABLE comentarios_instagram ADD COLUMN processado_em timestamptz;
  END IF;
END $$;

-- Add resposta_padrao column to grupos_comportamento table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grupos_comportamento' AND column_name = 'resposta_padrao'
  ) THEN
    ALTER TABLE grupos_comportamento ADD COLUMN resposta_padrao text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_classificacao 
ON comentarios_instagram(classificacao);

CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_processado_em 
ON comentarios_instagram(processado_em);

CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_deve_responder 
ON comentarios_instagram(deve_responder);

CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_deve_apagar 
ON comentarios_instagram(deve_apagar);

-- Add comments to document the new columns
COMMENT ON COLUMN comentarios_instagram.deve_responder IS 'Indica se o comentário deve receber uma resposta';
COMMENT ON COLUMN comentarios_instagram.deve_apagar IS 'Indica se o comentário deve ser apagado';
COMMENT ON COLUMN comentarios_instagram.resposta_sugerida IS 'Resposta sugerida pela IA para o comentário';
COMMENT ON COLUMN comentarios_instagram.justificativa IS 'Justificativa da IA para a classificação do comentário';
COMMENT ON COLUMN comentarios_instagram.confianca IS 'Nível de confiança da IA na classificação (0-1)';
COMMENT ON COLUMN comentarios_instagram.classificacao IS 'Classificação do comentário: aprovado, reprovado ou pendente';
COMMENT ON COLUMN comentarios_instagram.processado_em IS 'Data e hora em que o comentário foi processado pela IA';
COMMENT ON COLUMN grupos_comportamento.resposta_padrao IS 'Resposta padrão do grupo de comportamento para ser usada pela IA';
