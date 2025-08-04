/*
  # Adicionar campos necessários para Direct Instagram

  1. Campos Adicionados
    - `id_ig_usuario` (text) - ID do IG do usuário que enviou
    - `id_conta_instagram_unidade` (text) - ID da conta IG da unidade
    - `bearer_token` (text, opcional) - Token de autenticação
    - `mensagens` (jsonb) - Todas as mensagens em formato JSON
    - `id_recipient` (text, opcional) - ID do destinatário
    - `nome` (text, opcional) - Nome do usuário
    - `whatsapp` (text, opcional) - Número do WhatsApp

  2. Índices para Performance
    - Índices para busca rápida em todos os campos
    - Índice GIN para busca no JSONB mensagens

  3. Triggers
    - Trigger para contar mensagens automaticamente
    - Atualização automática de contadores
*/

-- Adicionar novos campos à tabela direct_instagram_conversas
ALTER TABLE direct_instagram_conversas 
ADD COLUMN IF NOT EXISTS id_ig_usuario text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS id_conta_instagram_unidade text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bearer_token text,
ADD COLUMN IF NOT EXISTS mensagens jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS id_recipient text,
ADD COLUMN IF NOT EXISTS nome text,
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_ig_usuario 
ON direct_instagram_conversas (id_ig_usuario);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_conta_instagram 
ON direct_instagram_conversas (id_conta_instagram_unidade);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_bearer_token 
ON direct_instagram_conversas (bearer_token) WHERE bearer_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_direct_conversas_mensagens_gin 
ON direct_instagram_conversas USING gin (mensagens);

CREATE INDEX IF NOT EXISTS idx_direct_conversas_id_recipient 
ON direct_instagram_conversas (id_recipient) WHERE id_recipient IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_direct_conversas_nome 
ON direct_instagram_conversas (nome) WHERE nome IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_direct_conversas_whatsapp 
ON direct_instagram_conversas (whatsapp) WHERE whatsapp IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_direct_conversas_unidade_usuario 
ON direct_instagram_conversas (unidade_id, id_ig_usuario);

-- Criar constraint única para evitar conversas duplicadas
ALTER TABLE direct_instagram_conversas 
DROP CONSTRAINT IF EXISTS unique_conversa_per_unit_user;

ALTER TABLE direct_instagram_conversas 
ADD CONSTRAINT unique_conversa_per_unit_user 
UNIQUE (unidade_id, id_ig_usuario);

-- Função para contar mensagens no JSONB
CREATE OR REPLACE FUNCTION update_conversa_counters_from_jsonb()
RETURNS TRIGGER AS $$
BEGIN
  -- Contar total de mensagens
  NEW.total_mensagens = jsonb_array_length(COALESCE(NEW.mensagens, '[]'::jsonb));
  
  -- Contar mensagens não lidas (tipo='recebida' e read=false)
  NEW.mensagens_nao_lidas = (
    SELECT COUNT(*)::integer
    FROM jsonb_array_elements(COALESCE(NEW.mensagens, '[]'::jsonb)) AS msg
    WHERE (msg->>'tipo') = 'recebida' 
    AND COALESCE((msg->>'read')::boolean, false) = false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS update_conversa_counters_jsonb ON direct_instagram_conversas;
CREATE TRIGGER update_conversa_counters_jsonb
  BEFORE INSERT OR UPDATE OF mensagens ON direct_instagram_conversas
  FOR EACH ROW
  EXECUTE FUNCTION update_conversa_counters_from_jsonb();

-- Atualizar contadores para registros existentes
UPDATE direct_instagram_conversas 
SET mensagens = COALESCE(mensagens, '[]'::jsonb)
WHERE mensagens IS NULL;
