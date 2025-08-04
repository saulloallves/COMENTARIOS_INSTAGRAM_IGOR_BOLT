/*
  # Cresci e Perdi Database Schema Implementation

  This migration creates the complete database structure for the multi-phase brand management system.

  ## Core Tables
  1. **fases** - Operational phases with ordering
  2. **unidades** - Business units with current phase tracking
  3. **grupos_comportamento** - AI behavior groups with permissions
  4. **documentacoes** - Documentation library
  5. **documentacoes_por_fase** - Phase-specific documentation mapping
  6. **comportamento_padrao** - Default AI behavior per phase
  7. **historico_interacoes** - User interaction logging
  8. **usuarios** - Extended user management

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users
  - Proper foreign key constraints and cascading
*/

-- Create custom ENUM types for data consistency
CREATE TYPE fase_nome AS ENUM (
  'interacao',
  'pre_compras', 
  'semana_1',
  'semana_2',
  'semana_3',
  'semana_4',
  'pos_compra',
  'fidelizacao'
);

CREATE TYPE documentacao_tipo AS ENUM (
  'padrao',
  'por_fase'
);

CREATE TYPE unidade_status AS ENUM (
  'ativa',
  'inativa',
  'manutencao',
  'planejamento'
);

-- 1. FASES TABLE
-- Defines operational phases with proper ordering
CREATE TABLE IF NOT EXISTS fases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome fase_nome NOT NULL UNIQUE,
  ordem integer NOT NULL UNIQUE CHECK (ordem > 0),
  descricao text,
  cor varchar(7) DEFAULT '#6B7280', -- Hex color for UI
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. UNIDADES TABLE  
-- Business units with current operational phase
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text NOT NULL UNIQUE,
  fase_atual_id uuid NOT NULL REFERENCES fases(id) ON DELETE RESTRICT,
  status unidade_status DEFAULT 'ativa',
  localizacao text,
  responsavel_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unidades_nome_check CHECK (length(nome) >= 2),
  CONSTRAINT unidades_codigo_check CHECK (length(codigo) >= 2)
);

-- 3. GRUPOS_COMPORTAMENTO TABLE
-- AI behavior groups with permissions per phase
CREATE TABLE IF NOT EXISTS grupos_comportamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  permitido_responder boolean DEFAULT true,
  escopo jsonb DEFAULT '{}', -- Flexible permissions and restrictions
  prioridade integer DEFAULT 1 CHECK (prioridade > 0),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT grupos_comportamento_descricao_check CHECK (length(descricao) >= 5)
);

-- 4. DOCUMENTACOES TABLE
-- Rich documentation library with versioning
CREATE TABLE IF NOT EXISTS documentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL, -- Rich text/markdown content
  tipo documentacao_tipo DEFAULT 'padrao',
  versao integer DEFAULT 1 CHECK (versao > 0),
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  aprovado boolean DEFAULT false,
  aprovado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  aprovado_em timestamptz,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT documentacoes_titulo_check CHECK (length(titulo) >= 3),
  CONSTRAINT documentacoes_conteudo_check CHECK (length(conteudo) >= 10)
);

-- 5. DOCUMENTACOES_POR_FASE TABLE
-- Junction table linking documentation to specific phases
CREATE TABLE IF NOT EXISTS documentacoes_por_fase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  documentacao_id uuid NOT NULL REFERENCES documentacoes(id) ON DELETE CASCADE,
  obrigatorio boolean DEFAULT false,
  ordem_exibicao integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(fase_id, documentacao_id)
);

-- 6. COMPORTAMENTO_PADRAO TABLE
-- Default AI behavior instructions per phase
CREATE TABLE IF NOT EXISTS comportamento_padrao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  instrucoes text NOT NULL,
  proibicoes text,
  exemplos_resposta jsonb DEFAULT '[]', -- Array of example responses
  temperatura real DEFAULT 0.7 CHECK (temperatura >= 0 AND temperatura <= 2),
  max_tokens integer DEFAULT 500 CHECK (max_tokens > 0),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT comportamento_instrucoes_check CHECK (length(instrucoes) >= 10),
  UNIQUE(fase_id) -- One default behavior per phase
);

-- 7. HISTORICO_INTERACOES TABLE
-- Comprehensive interaction logging
CREATE TABLE IF NOT EXISTS historico_interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE SET NULL,
  fase_id uuid REFERENCES fases(id) ON DELETE SET NULL,
  pergunta text NOT NULL,
  resposta text,
  tempo_resposta_ms integer CHECK (tempo_resposta_ms >= 0),
  sucesso boolean DEFAULT true,
  erro_detalhes text,
  metadata jsonb DEFAULT '{}', -- Additional context data
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT historico_pergunta_check CHECK (length(pergunta) >= 1)
);

-- 8. USUARIOS TABLE (Extension of auth.users)
-- Extended user management with role-based access
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo text,
  cargo text,
  departamento text,
  telefone text,
  unidade_id uuid REFERENCES unidades(id) ON DELETE SET NULL,
  permissoes jsonb DEFAULT '{}', -- Role-based permissions
  preferencias jsonb DEFAULT '{}', -- User preferences
  ultimo_acesso timestamptz,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- Critical indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_unidades_fase_atual ON unidades(fase_atual_id);
CREATE INDEX IF NOT EXISTS idx_unidades_status ON unidades(status);
CREATE INDEX IF NOT EXISTS idx_unidades_codigo ON unidades(codigo);

CREATE INDEX IF NOT EXISTS idx_grupos_comportamento_fase ON grupos_comportamento(fase_id);
CREATE INDEX IF NOT EXISTS idx_grupos_comportamento_ativo ON grupos_comportamento(ativo);

CREATE INDEX IF NOT EXISTS idx_documentacoes_tipo ON documentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_documentacoes_aprovado ON documentacoes(aprovado);
CREATE INDEX IF NOT EXISTS idx_documentacoes_tags ON documentacoes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_documentacoes_por_fase_fase ON documentacoes_por_fase(fase_id);
CREATE INDEX IF NOT EXISTS idx_documentacoes_por_fase_doc ON documentacoes_por_fase(documentacao_id);

CREATE INDEX IF NOT EXISTS idx_comportamento_padrao_fase ON comportamento_padrao(fase_id);
CREATE INDEX IF NOT EXISTS idx_comportamento_padrao_ativo ON comportamento_padrao(ativo);

CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_interacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_unidade ON historico_interacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_historico_fase ON historico_interacoes(fase_id);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_interacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_historico_sucesso ON historico_interacoes(sucesso);

CREATE INDEX IF NOT EXISTS idx_usuarios_unidade ON usuarios(unidade_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_fases_updated_at BEFORE UPDATE ON fases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON unidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grupos_comportamento_updated_at BEFORE UPDATE ON grupos_comportamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentacoes_updated_at BEFORE UPDATE ON documentacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comportamento_padrao_updated_at BEFORE UPDATE ON comportamento_padrao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) SETUP
-- Enable RLS on all tables for security
ALTER TABLE fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_comportamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentacoes_por_fase ENABLE ROW LEVEL SECURITY;
ALTER TABLE comportamento_padrao ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- BASIC RLS POLICIES
-- Allow authenticated users to read most data
CREATE POLICY "Authenticated users can read fases"
  ON fases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read unidades"
  ON unidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read grupos_comportamento"
  ON grupos_comportamento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read documentacoes"
  ON documentacoes FOR SELECT
  TO authenticated
  USING (aprovado = true OR autor_id = auth.uid());

CREATE POLICY "Authenticated users can read documentacoes_por_fase"
  ON documentacoes_por_fase FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read comportamento_padrao"
  ON comportamento_padrao FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their own interactions"
  ON historico_interacoes FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can read their own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- INSERT/UPDATE/DELETE policies (more restrictive)
CREATE POLICY "Authenticated users can insert interactions"
  ON historico_interacoes FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
