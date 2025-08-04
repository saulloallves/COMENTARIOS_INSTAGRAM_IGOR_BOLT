/*
  # Update Instagram Direct Examples with Real Format

  1. Updates
    - Update existing conversations with real message format
    - Format: [{"conversas": [{"usuario": "id_usuario", "mensagem": "text", "timestamp": "DD-MM-YYYY HH:mm:ss"}]}]
    - "id_usuario" = user sending message (left side)
    - "resposta" = unit responding (right side)

  2. Message Structure
    - Real timestamps in Brazilian format
    - Realistic conversation flow
    - Mixed user messages and unit responses
*/

-- Update existing conversations with real format
UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "maria_silva_123",
      "mensagem": "Olá! Vocês têm roupas tamanho M disponíveis?",
      "timestamp": "28-01-2025 09:15:30"
    },
    {
      "usuario": "resposta",
      "mensagem": "Olá Maria! Sim, temos várias peças tamanho M. Que tipo de roupa você procura?",
      "timestamp": "28-01-2025 09:16:15"
    },
    {
      "usuario": "maria_silva_123",
      "mensagem": "Estou procurando blusas e vestidos para trabalho",
      "timestamp": "28-01-2025 09:17:20"
    },
    {
      "usuario": "resposta",
      "mensagem": "Perfeito! Temos várias opções. Pode vir dar uma olhada hoje das 9h às 18h?",
      "timestamp": "28-01-2025 09:18:05"
    },
    {
      "usuario": "maria_silva_123",
      "mensagem": "Vou passar aí na hora do almoço. Obrigada!",
      "timestamp": "28-01-2025 09:19:10"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 0,
total_mensagens = 5
WHERE id_ig_usuario = 'maria_silva_123';

UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "joao_santos_456",
      "mensagem": "Boa tarde! Vocês têm bolsas femininas?",
      "timestamp": "28-01-2025 14:30:15"
    },
    {
      "usuario": "resposta",
      "mensagem": "Boa tarde João! Sim, temos várias bolsas. Que estilo você procura?",
      "timestamp": "28-01-2025 14:31:20"
    },
    {
      "usuario": "joao_santos_456",
      "mensagem": "É para presente para minha esposa. Algo elegante",
      "timestamp": "28-01-2025 14:32:45"
    },
    {
      "usuario": "resposta",
      "mensagem": "Que lindo! Temos bolsas de couro e outras mais sofisticadas. Qual a faixa de preço?",
      "timestamp": "28-01-2025 14:33:30"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 1,
total_mensagens = 4
WHERE id_ig_usuario = 'joao_santos_456';

UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "ana_costa_789",
      "mensagem": "Olá, gostaria de saber sobre entrega",
      "timestamp": "28-01-2025 16:45:20"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 1,
total_mensagens = 1
WHERE id_ig_usuario = 'ana_costa_789';

UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "carlos_oliveira_321",
      "mensagem": "Bom dia! Posso agendar uma visita para hoje?",
      "timestamp": "28-01-2025 08:30:10"
    },
    {
      "usuario": "resposta",
      "mensagem": "Bom dia Carlos! Claro, que horário seria melhor para você?",
      "timestamp": "28-01-2025 08:31:05"
    },
    {
      "usuario": "carlos_oliveira_321",
      "mensagem": "Por volta das 15h estaria bom?",
      "timestamp": "28-01-2025 08:32:15"
    },
    {
      "usuario": "resposta",
      "mensagem": "Perfeito! Te esperamos às 15h. Endereço: Rua das Flores, 123",
      "timestamp": "28-01-2025 08:33:20"
    },
    {
      "usuario": "carlos_oliveira_321",
      "mensagem": "Ótimo! Até mais tarde então",
      "timestamp": "28-01-2025 08:34:10"
    },
    {
      "usuario": "resposta",
      "mensagem": "Até logo! Qualquer coisa, me chama aqui",
      "timestamp": "28-01-2025 08:34:45"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 0,
total_mensagens = 6
WHERE id_ig_usuario = 'carlos_oliveira_321';

UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "fernanda_lima_654",
      "mensagem": "Oi! Vocês ainda estão comprando roupas?",
      "timestamp": "28-01-2025 11:20:30"
    },
    {
      "usuario": "resposta",
      "mensagem": "Oi Fernanda! Sim, estamos na fase de compras. Que tipo de peças você tem?",
      "timestamp": "28-01-2025 11:21:15"
    },
    {
      "usuario": "fernanda_lima_654",
      "mensagem": "Tenho várias blusas e calças em ótimo estado",
      "timestamp": "28-01-2025 11:22:40"
    },
    {
      "usuario": "resposta",
      "mensagem": "Que ótimo! Pode trazer para avaliarmos. Funcionamos das 9h às 18h",
      "timestamp": "28-01-2025 11:23:25"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 0,
total_mensagens = 4
WHERE id_ig_usuario = 'fernanda_lima_654';

UPDATE direct_instagram_conversas 
SET mensagens = '[{
  "conversas": [
    {
      "usuario": "pedro_alves_987",
      "mensagem": "Muito obrigado pelo atendimento de ontem!",
      "timestamp": "27-01-2025 19:30:15"
    },
    {
      "usuario": "resposta",
      "mensagem": "Oi Pedro! Foi um prazer te atender. Gostou das peças?",
      "timestamp": "27-01-2025 19:31:20"
    },
    {
      "usuario": "pedro_alves_987",
      "mensagem": "Adorei tudo! Minha esposa ficou muito feliz com as roupas",
      "timestamp": "27-01-2025 19:32:45"
    },
    {
      "usuario": "resposta",
      "mensagem": "Que alegria saber disso! Voltem sempre que precisarem 😊",
      "timestamp": "27-01-2025 19:33:30"
    },
    {
      "usuario": "pedro_alves_987",
      "mensagem": "Com certeza! Já vou indicar para as amigas dela",
      "timestamp": "27-01-2025 19:34:15"
    }
  ]
}]'::jsonb,
mensagens_nao_lidas = 0,
total_mensagens = 5
WHERE id_ig_usuario = 'pedro_alves_987';
