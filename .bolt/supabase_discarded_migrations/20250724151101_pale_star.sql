/*
  # Phase 2: Database Structure Implementation

  1. New Tables
    - `fases` - Operational phases with enum values and ordering
    - `unidades` - Business units with current phase tracking
    - `grupos_comportamento` - Behavior groups with permissions and JSON scope
    - `documentacoes` - Documentation with rich text content and type classification
    - `documentacoes_por_fase` - Junction table linking documentation to phases
    - `comportamento_padrao` - Default behavior instructions and prohibitions per phase
    - `historico_interacoes` - Interaction history tracking
    - `usuarios` - User management system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Proper foreign key relationships and constraints

  3. Data Types
    - Custom ENUM types for phases and documentation types
    - UUID primary keys for all tables
    - JSON fields for flexible scope configuration
    - Rich text support for documentation content
*/

-- Create custom ENUM types
CREATE TYPE fase_nome AS ENUM (
  'interacao',
  'pre_compras',
  'semana_1',
  'semana_2',
  'semana_3',
  'semana_4',
  'pos_30_dias',
  'fidelizacao'
);

CREATE TYPE documentacao_tipo AS ENUM (
  'padrao',
  'por_fase'
);

-- Create fases table
CREATE TABLE IF NOT EXISTS fases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome fase_nome NOT NULL UNIQUE,
  ordem integer NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unidades table
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text NOT NULL UNIQUE,
  fase_atual_id uuid REFERENCES fases(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create grupos_comportamento table
CREATE TABLE IF NOT EXISTS grupos_comportamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  permitido_responder boolean DEFAULT true,
  escopo jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documentacoes table
CREATE TABLE IF NOT EXISTS documentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  tipo documentacao_tipo NOT NULL DEFAULT 'padrao',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documentacoes_por_fase table
CREATE TABLE IF NOT EXISTS documentacoes_por_fase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  documentacao_id uuid NOT NULL REFERENCES documentacoes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(fase_id, documentacao_id)
);

-- Create comportamento_padrao table
CREATE TABLE IF NOT EXISTS comportamento_padrao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  instrucoes text NOT NULL,
  proibicoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(fase_id)
);

-- Create historico_interacoes table
CREATE TABLE IF NOT EXISTS historico_interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE SET NULL,
  fase_id uuid REFERENCES fases(id) ON DELETE SET NULL,
  pergunta text NOT NULL,
  resposta text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  sucesso boolean DEFAULT true,
  tempo_resposta_ms integer DEFAULT 0
);

-- Create usuarios table (extending auth.users with additional fields)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'user',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unidades_fase_atual ON unidades(fase_atual_id);
CREATE INDEX IF NOT EXISTS idx_grupos_comportamento_fase ON grupos_comportamento(fase_id);
CREATE INDEX IF NOT EXISTS idx_documentacoes_por_fase_fase ON documentacoes_por_fase(fase_id);
CREATE INDEX IF NOT EXISTS idx_documentacoes_por_fase_doc ON documentacoes_por_fase(documentacao_id);
CREATE INDEX IF NOT EXISTS idx_comportamento_padrao_fase ON comportamento_padrao(fase_id);
CREATE INDEX IF NOT EXISTS idx_historico_interacoes_usuario ON historico_interacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_interacoes_unidade ON historico_interacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_historico_interacoes_timestamp ON historico_interacoes(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_comportamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentacoes_por_fase ENABLE ROW LEVEL SECURITY;
ALTER TABLE comportamento_padrao ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can read all fases"
  ON fases
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage unidades"
  ON unidades
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage grupos_comportamento"
  ON grupos_comportamento
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage documentacoes"
  ON documentacoes
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage documentacoes_por_fase"
  ON documentacoes_por_fase
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage comportamento_padrao"
  ON comportamento_padrao
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Users can read all historico_interacoes"
  ON historico_interacoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own interactions"
  ON historico_interacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Insert initial phase data
INSERT INTO fases (nome, ordem) VALUES
  ('interacao', 1),
  ('pre_compras', 2),
  ('semana_1', 3),
  ('semana_2', 4),
  ('semana_3', 5),
  ('semana_4', 6),
  ('pos_30_dias', 7),
  ('fidelizacao', 8)
ON CONFLICT (nome) DO NOTHING;
