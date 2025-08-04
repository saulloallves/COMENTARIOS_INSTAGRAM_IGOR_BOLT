/*
  # Create Instagram Comments Management System

  1. New Tables
    - `comentarios_instagram`
      - `id` (uuid, primary key)
      - `unidade_id` (uuid, foreign key to unidades)
      - `conteudo` (text, comment content)
      - `autor` (text, Instagram username)
      - `timestamp_comentario` (timestamptz, when comment was posted)
      - `classificacao` ('aprovado' | 'reprovado' | 'pendente')
      - `confianca` (numeric, AI confidence score)
      - `justificativa` (text, classification reasoning)
      - `resposta_sugerida` (text, optional suggested response)
      - `processado_em` (timestamptz, when AI processed it)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `comentarios_instagram` table
    - Add policy for authenticated users to read and manage comments

  3. Sample Data
    - Insert 10 example Instagram comments with classifications
*/

-- Create the Instagram comments table
CREATE TABLE IF NOT EXISTS comentarios_instagram (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  conteudo text NOT NULL,
  autor text NOT NULL,
  timestamp_comentario timestamptz NOT NULL,
  classificacao text CHECK (classificacao IN ('aprovado', 'reprovado', 'pendente')) DEFAULT 'pendente',
  confianca numeric(3,2) DEFAULT 0.0 CHECK (confianca >= 0.0 AND confianca <= 1.0),
  justificativa text,
  resposta_sugerida text,
  processado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comentarios_instagram ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage Instagram comments"
  ON comentarios_instagram
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_unidade_id ON comentarios_instagram(unidade_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_classificacao ON comentarios_instagram(classificacao);
CREATE INDEX IF NOT EXISTS idx_comentarios_instagram_timestamp ON comentarios_instagram(timestamp_comentario DESC);

-- Insert sample data (using the first unit if it exists)
DO $$
DECLARE
  first_unit_id uuid;
BEGIN
  -- Get the first unit ID
  SELECT id INTO first_unit_id FROM unidades LIMIT 1;
  
  -- Only insert if we have a unit
  IF first_unit_id IS NOT NULL THEN
    INSERT INTO comentarios_instagram (unidade_id, conteudo, autor, timestamp_comentario, classificacao, confianca, justificativa, resposta_sugerida, processado_em) VALUES
    (first_unit_id, 'Adorei o produto! Recomendo muito, qualidade excelente e entrega rápida. Parabéns pela empresa!', '@maria_silva', now() - interval '1 hour', 'aprovado', 0.95, 'Comentário extremamente positivo com elogios específicos ao produto, qualidade e serviço. Contribui positivamente para a imagem da marca.', 'Muito obrigado pelo feedback positivo, Maria! Ficamos felizes que tenha gostado do produto. 😊', now() - interval '50 minutes'),
    
    (first_unit_id, 'Produto chegou com defeito, muito decepcionada com a compra. Não recomendo!', '@joao_santos', now() - interval '2 hours', 'reprovado', 0.88, 'Comentário negativo relatando problema com o produto. Pode impactar negativamente a percepção da marca e precisa de resposta cuidadosa.', 'Lamentamos muito pelo inconveniente, João. Por favor, entre em contato conosco pelo DM para resolvermos essa situação.', now() - interval '1 hour 45 minutes'),
    
    (first_unit_id, 'Quando vocês vão ter promoção novamente? Estou esperando há meses!', '@ana_costa', now() - interval '3 hours', 'aprovado', 0.82, 'Comentário demonstra interesse genuíno nos produtos e promoções. Cliente engajado aguardando oportunidade de compra.', 'Olá Ana! Fique de olho em nossas redes sociais, sempre anunciamos nossas promoções por aqui primeiro! 🎉', now() - interval '2 hours 30 minutes'),
    
    (first_unit_id, 'SPAM: Clique aqui para ganhar dinheiro fácil!!! Link suspeito aqui', '@spam_account', now() - interval '4 hours', 'reprovado', 0.98, 'Comentário claramente identificado como spam com características típicas: uso excessivo de pontuação, promessas irreais e links suspeitos.', NULL, now() - interval '3 hours 45 minutes'),
    
    (first_unit_id, 'Gostaria de saber mais sobre os ingredientes do produto, podem me ajudar?', '@health_conscious', now() - interval '5 hours', 'aprovado', 0.91, 'Pergunta legítima sobre informações do produto. Cliente interessado em detalhes técnicos, demonstra interesse genuíno.', 'Claro! Enviamos todas as informações sobre ingredientes no seu DM. Obrigado pelo interesse! 📋', now() - interval '4 hours 30 minutes'),
    
    (first_unit_id, 'Vocês são uma empresa horrível, nunca mais compro nada aqui. Atendimento péssimo!', '@cliente_irritado', now() - interval '6 hours', 'pendente', 0.75, 'Comentário muito negativo sobre a empresa e atendimento. Requer análise humana para determinar se é crítica construtiva ou apenas desabafo emocional.', 'Lamentamos que sua experiência não tenha sido positiva. Gostaríamos de entender melhor o ocorrido. Pode nos contactar por DM?', now() - interval '5 hours 15 minutes'),
    
    (first_unit_id, 'Produto bom, mas a embalagem poderia ser mais sustentável. Que tal repensar isso?', '@eco_friendly', now() - interval '7 hours', 'aprovado', 0.86, 'Feedback construtivo com sugestão de melhoria. Cliente satisfeito com o produto mas preocupado com sustentabilidade.', 'Obrigado pela sugestão! Estamos sempre buscando formas de tornar nossos processos mais sustentáveis. Sua opinião é muito valiosa! 🌱', now() - interval '6 hours 45 minutes'),
    
    (first_unit_id, 'Alguém sabe se eles fazem entrega internacional? Preciso muito desse produto!', '@internacional_buyer', now() - interval '8 hours', 'aprovado', 0.89, 'Pergunta sobre serviços da empresa demonstrando interesse em compra. Cliente potencial de mercado internacional.', 'Olá! Atualmente fazemos entregas apenas no Brasil, mas estamos estudando expandir. Acompanhe nossas novidades! 🌍', now() - interval '7 hours 30 minutes'),
    
    (first_unit_id, 'Comprei ontem e já chegou hoje! Impressionante a velocidade da entrega. Produto perfeito!', '@cliente_satisfeito', now() - interval '9 hours', 'aprovado', 0.94, 'Comentário muito positivo destacando rapidez na entrega e qualidade do produto. Excelente para a imagem da marca.', 'Que alegria saber que ficou satisfeito! Trabalhamos sempre para oferecer a melhor experiência. Obrigado! ⚡', now() - interval '8 hours 20 minutes'),
    
    (first_unit_id, 'Esse produto realmente funciona ou é só marketing? Alguém que já usou pode falar?', '@cetico_curioso', now() - interval '10 hours', 'pendente', 0.72, 'Comentário questionando eficácia do produto. Pode ser interpretado como ceticismo saudável ou desconfiança. Requer análise para resposta adequada.', 'Entendemos sua curiosidade! Temos muitos depoimentos de clientes satisfeitos. Que tal conferir nossas avaliações? Estamos à disposição para esclarecer dúvidas! 💬', now() - interval '9 hours 10 minutes');
  END IF;
END $$;
