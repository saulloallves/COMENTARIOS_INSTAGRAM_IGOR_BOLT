/*
  # AI and Instagram Integration Tables

  1. New Tables
    - `classificacoes_instagram`
      - `id` (uuid, primary key)
      - `comment_id` (text)
      - `unidade_id` (uuid, foreign key)
      - `classificacao` (enum: approved, rejected, pending)
      - `confianca` (numeric)
      - `justificativa` (text)
      - `resposta_sugerida` (text)
      - `created_at` (timestamp)

    - `recomendacoes_ia`
      - `id` (uuid, primary key)
      - `unidade_id` (uuid, foreign key)
      - `recomendacao` (text)
      - `prioridade` (integer)
      - `status` (enum: nova, em_andamento, concluida)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE classificacao_instagram AS ENUM ('approved', 'rejected', 'pending');
CREATE TYPE status_recomendacao AS ENUM ('nova', 'em_andamento', 'concluida');

-- Instagram Classifications Table
CREATE TABLE IF NOT EXISTS classificacoes_instagram (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id text NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  classificacao classificacao_instagram NOT NULL,
  confianca numeric(3,2) CHECK (confianca >= 0 AND confianca <= 1),
  justificativa text NOT NULL,
  resposta_sugerida text,
  created_at timestamptz DEFAULT now()
);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS recomendacoes_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  recomendacao text NOT NULL,
  prioridade integer DEFAULT 1 CHECK (prioridade >= 1 AND prioridade <= 5),
  status status_recomendacao DEFAULT 'nova',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE classificacoes_instagram ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendacoes_ia ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Instagram Classifications
CREATE POLICY "Users can view all instagram classifications"
  ON classificacoes_instagram
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert instagram classifications"
  ON classificacoes_instagram
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update instagram classifications"
  ON classificacoes_instagram
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for AI Recommendations
CREATE POLICY "Users can view all ai recommendations"
  ON recomendacoes_ia
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert ai recommendations"
  ON recomendacoes_ia
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update ai recommendations"
  ON recomendacoes_ia
  FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classificacoes_instagram_unidade_id ON classificacoes_instagram(unidade_id);
CREATE INDEX IF NOT EXISTS idx_classificacoes_instagram_created_at ON classificacoes_instagram(created_at);
CREATE INDEX IF NOT EXISTS idx_recomendacoes_ia_unidade_id ON recomendacoes_ia(unidade_id);
CREATE INDEX IF NOT EXISTS idx_recomendacoes_ia_status ON recomendacoes_ia(status);

-- Update trigger for recomendacoes_ia
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recomendacoes_ia_updated_at
    BEFORE UPDATE ON recomendacoes_ia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
