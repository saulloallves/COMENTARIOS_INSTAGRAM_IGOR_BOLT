/*
  # Criar tabela prompts_ia para treinamento da IA

  1. Tipos de Dados
    - Enum `prompt_tipo` para tipos de decisão da IA
  
  2. Nova Tabela
    - `prompts_ia`
      - `id` (uuid, primary key)
      - `tipo` (prompt_tipo enum)
      - `titulo` (text)
      - `descricao` (text)
      - `prompt` (text)
      - `autor` (text)
      - `versao` (integer)
      - `ativo` (boolean)
      - `metadados` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Segurança
    - Enable RLS na tabela `prompts_ia`
    - Políticas para leitura (usuários autenticados)
    - Políticas para gestão (admins/gestors)

  4. Performance
    - Índices em campos importantes
    - Trigger para updated_at automático

  5. Dados Iniciais
    - 4 prompts padrão para cada tipo de decisão
*/

-- Criar enum apenas se não existir
DO $$ BEGIN
    CREATE TYPE prompt_tipo AS ENUM ('comportamento', 'classificacao', 'resposta', 'intencao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela prompts_ia se não existir
CREATE TABLE IF NOT EXISTS prompts_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo prompt_tipo NOT NULL,
  titulo text NOT NULL,
  descricao text,
  prompt text NOT NULL,
  autor text DEFAULT 'Sistema',
  versao integer DEFAULT 1,
  ativo boolean DEFAULT true,
  metadados jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE prompts_ia ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ler prompts ativos" ON prompts_ia;
CREATE POLICY "Usuários podem ler prompts ativos"
  ON prompts_ia
  FOR SELECT
  TO authenticated
  USING (ativo = true);

DROP POLICY IF EXISTS "Admins podem gerenciar todos os prompts" ON prompts_ia;
CREATE POLICY "Admins podem gerenciar todos os prompts"
  ON prompts_ia
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY(ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_prompts_ia_tipo ON prompts_ia(tipo);
CREATE INDEX IF NOT EXISTS idx_prompts_ia_ativo ON prompts_ia(ativo);
CREATE INDEX IF NOT EXISTS idx_prompts_ia_versao ON prompts_ia(versao);
CREATE INDEX IF NOT EXISTS idx_prompts_ia_created_at ON prompts_ia(created_at DESC);

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prompts_ia_updated_at ON prompts_ia;
CREATE TRIGGER update_prompts_ia_updated_at
    BEFORE UPDATE ON prompts_ia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais apenas se a tabela estiver vazia
INSERT INTO prompts_ia (tipo, titulo, descricao, prompt, autor, versao, ativo, metadados)
SELECT * FROM (VALUES
  (
    'comportamento'::prompt_tipo,
    'Comportamento do Comentário',
    'Identifica grupos comportamentais como institucional, crítica, spam, elogio',
    'Analise o comentário e classifique-o em um dos seguintes grupos comportamentais:

1. **Institucional**: Comentários sobre a empresa, marca ou serviços de forma neutra
2. **Crítica Construtiva**: Feedback negativo mas respeitoso com sugestões
3. **Crítica Agressiva**: Comentários negativos com tom hostil ou ofensivo
4. **Elogio**: Comentários positivos, satisfação ou recomendação
5. **Dúvida Frequente**: Perguntas comuns sobre produtos/serviços
6. **Comercial**: Tentativas de venda, parcerias ou promoções
7. **Spam/Scam**: Links suspeitos, conteúdo irrelevante ou golpes
8. **Sugestão**: Ideias para melhorias ou novos recursos

Considere o tom, contexto e intenção por trás das palavras para fazer a classificação mais precisa.

Responda apenas com o nome do grupo comportamental identificado.',
    'Sistema',
    1,
    true,
    '{"modelo": "gpt-4", "temperatura": 0.3, "max_tokens": 50}'::jsonb
  ),
  (
    'classificacao'::prompt_tipo,
    'Classificação do Comentário',
    'Decide se o comentário deve ser aprovado ou reprovado',
    'Avalie se o comentário deve ser APROVADO ou REPROVADO com base nos seguintes critérios:

**APROVAR quando:**
- Comentário respeitoso e construtivo
- Dúvidas legítimas sobre produtos/serviços
- Elogios e feedback positivo
- Críticas construtivas sem ofensas
- Sugestões relevantes para melhoria

**REPROVAR quando:**
- Linguagem ofensiva, discriminatória ou agressiva
- Spam, links suspeitos ou conteúdo irrelevante
- Tentativas de golpe ou fraude
- Informações falsas ou enganosas
- Violação das diretrizes da comunidade
- Conteúdo que pode prejudicar a reputação da marca

Priorize sempre a segurança da comunidade e a reputação da marca.

Responda apenas com "APROVADO" ou "REPROVADO".',
    'Sistema',
    1,
    true,
    '{"modelo": "gpt-4", "temperatura": 0.1, "max_tokens": 10}'::jsonb
  ),
  (
    'resposta'::prompt_tipo,
    'Necessidade de Resposta',
    'Define quando comentários precisam de resposta automática',
    'Determine se o comentário PRECISA DE RESPOSTA com base nos critérios:

**RESPONDER quando:**
- Dúvidas sobre produtos, serviços ou funcionamento
- Reclamações que podem ser resolvidas publicamente
- Elogios que merecem agradecimento público
- Pedidos de informação ou esclarecimento
- Comentários que demonstram interesse genuíno

**NÃO RESPONDER quando:**
- Spam ou conteúdo irrelevante
- Comentários puramente ofensivos
- Conversas entre outros usuários
- Comentários que já foram respondidos
- Situações que exigem atendimento privado/direto

Lembre-se: uma resposta pública pode gerar mais engajamento e demonstrar cuidado com a comunidade.

Responda apenas com "SIM" ou "NÃO".',
    'Sistema',
    1,
    true,
    '{"modelo": "gpt-4", "temperatura": 0.2, "max_tokens": 10}'::jsonb
  ),
  (
    'intencao'::prompt_tipo,
    'Intenção do Comentário',
    'Identifica intenções como dúvida, ironia, elogio, venda, crítica',
    'Identifique a INTENÇÃO PRINCIPAL por trás do comentário:

**Tipos de Intenção:**

1. **Elogio**: Expressar satisfação, gratidão ou recomendação
2. **Reclamação**: Manifestar insatisfação ou problema específico
3. **Pedido de Ajuda**: Solicitar suporte, orientação ou assistência
4. **Pergunta**: Buscar informações específicas sobre produtos/serviços
5. **Venda/Compra**: Interesse comercial, negociação ou transação
6. **Ironia/Sarcasmo**: Comentários com tom irônico ou sarcástico
7. **Ofensa**: Intenção de atacar, humilhar ou desqualificar

**Dicas para Análise:**
- Observe o contexto e subtexto
- Considere emojis e pontuação
- Analise o histórico se disponível
- Identifique palavras-chave indicativas

A intenção correta ajuda a gerar respostas mais adequadas e eficazes.

Responda apenas com o nome da intenção identificada.',
    'Sistema',
    1,
    true,
    '{"modelo": "gpt-4", "temperatura": 0.3, "max_tokens": 20}'::jsonb
  )
) AS dados(tipo, titulo, descricao, prompt, autor, versao, ativo, metadados)
WHERE NOT EXISTS (SELECT 1 FROM prompts_ia LIMIT 1);
