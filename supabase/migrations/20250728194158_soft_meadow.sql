/*
  # Modificar estrutura da tabela direct_instagram_conversas

  1. Modificações na tabela
    - Adicionar campos solicitados
    - Remover campos desnecessários
    - Manter relacionamento com mensagens

  2. Índices para performance
    - Índices para busca rápida
    - Índice GIN para JSONB
    - Índices compostos

  3. Segurança
    - Configurar RLS
    - Políticas de acesso
*/

-- Remover campos desnecessários e adicionar novos campos
ALTER TABLE direct_instagram_conversas 
DROP COLUMN IF EXISTS remetente,
DROP COLUMN IF EXISTS nome_exibicao,
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS ultima_mensagem_id;

-- Adicionar novos campos
ALTER TABLE direct_instagram_conversas 
ADD COLUMN IF NOT EXISTS id_ig_usuario text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS id_conta_instagram_unidade text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bearer_token text,
ADD COLUMN IF NOT EXISTS mensagens jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS id_recipient text,
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Remover constraint única antiga se existir
ALTER TABLE direct_instagram_conversas 
DROP CONSTRAINT IF EXISTS unique_conversa_per_unit;

-- Adicionar constraint única para evitar conversas duplicadas
ALTER TABLE direct_instagram_conversas 
ADD CONSTRAINT unique_conversa_per_unit_user 
UNIQUE (unidade_id, id_ig_usuario);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_ig_usuario 
ON direct_instagram_conversas (id_ig_usuario);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_conta_instagram 
ON direct_instagram_conversas (id_conta_instagram_unidade);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_mensagens_gin 
ON direct_instagram_conversas USING gin (mensagens);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_recipient 
ON direct_instagram_conversas (id_recipient);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_nome 
ON direct_instagram_conversas (nome);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_whatsapp 
ON direct_instagram_conversas (whatsapp) WHERE whatsapp IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_direct_conversas_unidade_usuario 
ON direct_instagram_conversas (unidade_id, id_ig_usuario);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_bearer_token 
ON direct_instagram_conversas (bearer_token) WHERE bearer_token IS NOT NULL;

-- Função para atualizar contadores baseado no JSONB mensagens
CREATE OR REPLACE FUNCTION update_conversa_counters_from_jsonb()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores baseado no array de mensagens
  NEW.total_mensagens = jsonb_array_length(COALESCE(NEW.mensagens, '[]'::jsonb));
  
  -- Contar mensagens não lidas (tipo = 'recebida' e read = false)
  NEW.mensagens_nao_lidas = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(NEW.mensagens, '[]'::jsonb)) AS msg
    WHERE (msg->>'tipo') = 'recebida' 
    AND COALESCE((msg->>'read')::boolean, false) = false
  );
  
  -- Atualizar updated_at
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS update_conversa_counters_jsonb ON direct_instagram_conversas;
CREATE TRIGGER update_conversa_counters_jsonb
  BEFORE INSERT OR UPDATE OF mensagens ON direct_instagram_conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_conversa_counters_from_jsonb();

-- Configurar RLS
ALTER TABLE direct_instagram_conversas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can read direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can insert direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can update direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Admins can delete direct conversas" ON direct_instagram_conversas;

-- Criar políticas RLS atualizadas
CREATE POLICY "Users can read direct conversas"
  ON direct_instagram_conversas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert direct conversas"
  ON direct_instagram_conversas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update direct conversas"
  ON direct_instagram_conversas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete direct conversas"
  ON direct_instagram_conversas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Atualizar trigger de updated_at
DROP TRIGGER IF EXISTS update_direct_conversas_updated_at ON direct_instagram_conversas;
CREATE TRIGGER update_direct_conversas_updated_at
  BEFORE UPDATE ON direct_instagram_conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
