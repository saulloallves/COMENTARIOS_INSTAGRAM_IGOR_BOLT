/*
  # Create Direct Instagram Tables

  1. New Tables
    - `direct_instagram_conversas`
      - `id` (uuid, primary key)
      - `unidade_id` (uuid, foreign key to unidades)
      - `remetente` (text, Instagram username)
      - `nome_exibicao` (text, display name)
      - `avatar_url` (text, profile picture URL)
      - `ultima_mensagem_id` (uuid, foreign key to messages)
      - `mensagens_nao_lidas` (integer, count of unread messages)
      - `total_mensagens` (integer, total message count)
      - `status` (enum: ativa, arquivada, bloqueada)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `direct_instagram_mensagens`
      - `id` (uuid, primary key)
      - `conversa_id` (uuid, foreign key to conversas)
      - `unidade_id` (uuid, foreign key to unidades)
      - `remetente` (text, sender username)
      - `conteudo` (text, message content)
      - `tipo` (enum: recebida, enviada)
      - `status` (enum: nao_lida, lida, respondida)
      - `timestamp_mensagem` (timestamp, original message time)
      - `resposta_sugerida` (text, AI suggested response)
      - `confianca_ia` (numeric, AI confidence level)
      - `processado_em` (timestamp, when AI processed)
      - `metadados` (jsonb, additional data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    - Add indexes for performance

  3. Enums
    - Create enums for status and tipo fields
</*/

-- Create enums for Direct Instagram
DO $$ BEGIN
    CREATE TYPE direct_conversa_status AS ENUM ('ativa', 'arquivada', 'bloqueada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE direct_mensagem_tipo AS ENUM ('recebida', 'enviada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE direct_mensagem_status AS ENUM ('nao_lida', 'lida', 'respondida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create direct_instagram_conversas table
CREATE TABLE IF NOT EXISTS direct_instagram_conversas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id uuid NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    remetente text NOT NULL,
    nome_exibicao text,
    avatar_url text,
    ultima_mensagem_id uuid,
    mensagens_nao_lidas integer DEFAULT 0,
    total_mensagens integer DEFAULT 0,
    status direct_conversa_status DEFAULT 'ativa',
    metadados jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_conversa_per_unit UNIQUE (unidade_id, remetente),
    CONSTRAINT valid_message_counts CHECK (mensagens_nao_lidas >= 0 AND total_mensagens >= 0)
);

-- Create direct_instagram_mensagens table
CREATE TABLE IF NOT EXISTS direct_instagram_mensagens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id uuid NOT NULL REFERENCES direct_instagram_conversas(id) ON DELETE CASCADE,
    unidade_id uuid NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    remetente text NOT NULL,
    conteudo text NOT NULL,
    tipo direct_mensagem_tipo NOT NULL,
    status direct_mensagem_status DEFAULT 'nao_lida',
    timestamp_mensagem timestamptz NOT NULL,
    resposta_sugerida text,
    confianca_ia numeric(3,2) CHECK (confianca_ia >= 0.0 AND confianca_ia <= 1.0),
    processado_em timestamptz,
    metadados jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for ultima_mensagem_id after mensagens table is created
ALTER TABLE direct_instagram_conversas 
ADD CONSTRAINT fk_ultima_mensagem 
FOREIGN KEY (ultima_mensagem_id) REFERENCES direct_instagram_mensagens(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_conversas_unidade ON direct_instagram_conversas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_direct_conversas_status ON direct_instagram_conversas(status);
CREATE INDEX IF NOT EXISTS idx_direct_conversas_updated ON direct_instagram_conversas(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_conversas_nao_lidas ON direct_instagram_conversas(mensagens_nao_lidas) WHERE mensagens_nao_lidas > 0;

CREATE INDEX IF NOT EXISTS idx_direct_mensagens_conversa ON direct_instagram_mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_direct_mensagens_unidade ON direct_instagram_mensagens(unidade_id);
CREATE INDEX IF NOT EXISTS idx_direct_mensagens_status ON direct_instagram_mensagens(status);
CREATE INDEX IF NOT EXISTS idx_direct_mensagens_tipo ON direct_instagram_mensagens(tipo);
CREATE INDEX IF NOT EXISTS idx_direct_mensagens_timestamp ON direct_instagram_mensagens(timestamp_mensagem DESC);
CREATE INDEX IF NOT EXISTS idx_direct_mensagens_processado ON direct_instagram_mensagens(processado_em) WHERE processado_em IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE direct_instagram_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_instagram_mensagens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversas
CREATE POLICY "Users can read direct conversas" ON direct_instagram_conversas
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert direct conversas" ON direct_instagram_conversas
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update direct conversas" ON direct_instagram_conversas
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can delete direct conversas" ON direct_instagram_conversas
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid() 
        AND usuarios.role IN ('admin', 'gestor')
    ));

-- Create RLS policies for mensagens
CREATE POLICY "Users can read direct mensagens" ON direct_instagram_mensagens
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert direct mensagens" ON direct_instagram_mensagens
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update direct mensagens" ON direct_instagram_mensagens
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can delete direct mensagens" ON direct_instagram_mensagens
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid() 
        AND usuarios.role IN ('admin', 'gestor')
    ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_direct_conversas_updated_at
    BEFORE UPDATE ON direct_instagram_conversas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_mensagens_updated_at
    BEFORE UPDATE ON direct_instagram_mensagens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update conversation counters
CREATE OR REPLACE FUNCTION update_conversa_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message counts and last message
    UPDATE direct_instagram_conversas 
    SET 
        total_mensagens = (
            SELECT COUNT(*) 
            FROM direct_instagram_mensagens 
            WHERE conversa_id = COALESCE(NEW.conversa_id, OLD.conversa_id)
        ),
        mensagens_nao_lidas = (
            SELECT COUNT(*) 
            FROM direct_instagram_mensagens 
            WHERE conversa_id = COALESCE(NEW.conversa_id, OLD.conversa_id) 
            AND status = 'nao_lida'
            AND tipo = 'recebida'
        ),
        ultima_mensagem_id = (
            SELECT id 
            FROM direct_instagram_mensagens 
            WHERE conversa_id = COALESCE(NEW.conversa_id, OLD.conversa_id)
            ORDER BY timestamp_mensagem DESC 
            LIMIT 1
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.conversa_id, OLD.conversa_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers to update conversation counters
CREATE TRIGGER update_conversa_on_message_change
    AFTER INSERT OR UPDATE OR DELETE ON direct_instagram_mensagens
    FOR EACH ROW
    EXECUTE FUNCTION update_conversa_counters();
