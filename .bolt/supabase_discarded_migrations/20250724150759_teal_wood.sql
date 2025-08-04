/*
  # Sample Data for Cresci e Perdi Database

  This migration inserts comprehensive sample data to demonstrate the database relationships
  and provide realistic examples for testing and development.

  ## Data Includes
  - 8 operational phases with proper ordering
  - 4 sample business units in different states
  - Behavior groups with realistic permissions
  - Documentation library with phase associations
  - Default AI behavior configurations
  - Sample interaction history
*/

-- INSERT SAMPLE PHASES
-- Core operational phases with proper ordering and visual styling
INSERT INTO fases (nome, ordem, descricao, cor) VALUES
  ('interacao', 1, 'Fase inicial de interação com potenciais clientes', '#3B82F6'),
  ('pre_compras', 2, 'Período de avaliação e consideração de compra', '#F59E0B'),
  ('semana_1', 3, 'Primeira semana após a compra - onboarding', '#10B981'),
  ('semana_2', 4, 'Segunda semana - acompanhamento inicial', '#10B981'),
  ('semana_3', 5, 'Terceira semana - consolidação do uso', '#10B981'),
  ('semana_4', 6, 'Quarta semana - avaliação de satisfação', '#10B981'),
  ('pos_compra', 7, 'Período pós-compra - suporte contínuo', '#8B5CF6'),
  ('fidelizacao', 8, 'Fase de fidelização e retenção', '#EC4899')
ON CONFLICT (nome) DO NOTHING;

-- INSERT SAMPLE BUSINESS UNITS
-- Different units in various operational phases and statuses
INSERT INTO unidades (nome, codigo, fase_atual_id, status, localizacao) VALUES
  (
    'Unidade Centro São Paulo',
    'SP-CENTRO-001',
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'ativa',
    'São Paulo, SP - Centro'
  ),
  (
    'Unidade Norte Rio de Janeiro', 
    'RJ-NORTE-001',
    (SELECT id FROM fases WHERE nome = 'semana_2'),
    'ativa',
    'Rio de Janeiro, RJ - Zona Norte'
  ),
  (
    'Unidade Sul Porto Alegre',
    'RS-SUL-001', 
    (SELECT id FROM fases WHERE nome = 'pos_compra'),
    'ativa',
    'Porto Alegre, RS'
  ),
  (
    'Unidade Oeste Brasília',
    'DF-OESTE-001',
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'planejamento',
    'Brasília, DF'
  )
ON CONFLICT (codigo) DO NOTHING;

-- INSERT BEHAVIOR GROUPS
-- AI behavior configurations with realistic permissions per phase
INSERT INTO grupos_comportamento (fase_id, descricao, permitido_responder, escopo, prioridade) VALUES
  (
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Grupo de Atração - Foco em despertar interesse',
    true,
    '{"permissoes": ["responder_duvidas", "fornecer_informacoes"], "restricoes": ["nao_fazer_vendas_diretas", "nao_solicitar_dados_pessoais"], "tom": "amigavel_e_informativo"}',
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'pre_compras'),
    'Grupo de Conversão - Auxiliar na decisão de compra',
    true,
    '{"permissoes": ["apresentar_beneficios", "esclarecer_duvidas", "oferecer_demonstracoes"], "restricoes": ["nao_pressionar_vendas", "ser_transparente_sobre_limitacoes"], "tom": "consultivo_e_confiavel"}',
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Grupo de Onboarding - Guiar primeiros passos',
    true,
    '{"permissoes": ["fornecer_tutoriais", "resolver_problemas_tecnicos", "agendar_suporte"], "restricoes": ["focar_apenas_no_basico", "nao_sobrecarregar_informacoes"], "tom": "paciente_e_didatico"}',
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Grupo de Retenção - Manter engajamento',
    true,
    '{"permissoes": ["oferecer_upgrades", "sugerir_novos_produtos", "coletar_feedback"], "restricoes": ["respeitar_preferencias", "nao_ser_invasivo"], "tom": "personalizado_e_valorativo"}',
    1
  )
ON CONFLICT DO NOTHING;

-- INSERT SAMPLE DOCUMENTATION
-- Comprehensive documentation library with different types
INSERT INTO documentacoes (titulo, conteudo, tipo, aprovado, tags) VALUES
  (
    'Manual de Atendimento Geral',
    '# Manual de Atendimento Geral\n\n## Princípios Fundamentais\n\n1. **Cordialidade**: Sempre manter tom amigável e respeitoso\n2. **Clareza**: Comunicar de forma simples e direta\n3. **Eficiência**: Resolver questões de forma ágil\n\n## Procedimentos Padrão\n\n### Saudação Inicial\n- Cumprimentar o cliente de forma calorosa\n- Identificar-se como assistente da Cresci e Perdi\n- Perguntar como pode ajudar\n\n### Resolução de Problemas\n- Escutar atentamente a questão\n- Fazer perguntas esclarecedoras se necessário\n- Oferecer soluções práticas e viáveis',
    'padrao',
    true,
    ARRAY['atendimento', 'manual', 'procedimentos']
  ),
  (
    'Guia de Onboarding - Semana 1',
    '# Guia de Onboarding - Primeira Semana\n\n## Objetivos da Primeira Semana\n\n- Familiarizar o cliente com a plataforma\n- Configurar perfil e preferências básicas\n- Realizar primeira interação bem-sucedida\n\n## Checklist de Atividades\n\n### Dia 1-2: Configuração Inicial\n- [ ] Completar perfil do usuário\n- [ ] Configurar preferências de comunicação\n- [ ] Realizar tour pela plataforma\n\n### Dia 3-5: Primeiras Interações\n- [ ] Testar funcionalidades principais\n- [ ] Agendar sessão de suporte se necessário\n- [ ] Coletar feedback inicial\n\n### Dia 6-7: Consolidação\n- [ ] Revisar progresso\n- [ ] Identificar dúvidas pendentes\n- [ ] Preparar para semana 2',
    'por_fase',
    true,
    ARRAY['onboarding', 'semana1', 'checklist']
  ),
  (
    'Política de Privacidade e Dados',
    '# Política de Privacidade e Proteção de Dados\n\n## Compromisso com a Privacidade\n\nA Cresci e Perdi está comprometida com a proteção da privacidade e segurança dos dados de nossos clientes.\n\n## Coleta de Dados\n\n### Dados Coletados\n- Informações de perfil fornecidas voluntariamente\n- Dados de interação com a plataforma\n- Preferências e configurações do usuário\n\n### Finalidade da Coleta\n- Personalizar a experiência do usuário\n- Melhorar nossos serviços\n- Fornecer suporte técnico eficiente\n\n## Proteção e Segurança\n\n- Criptografia de dados sensíveis\n- Acesso restrito por níveis de autorização\n- Auditorias regulares de segurança\n- Conformidade com LGPD',
    'padrao',
    true,
    ARRAY['privacidade', 'lgpd', 'seguranca', 'dados']
  ),
  (
    'Estratégias de Fidelização',
    '# Estratégias de Fidelização de Clientes\n\n## Princípios da Fidelização\n\n### 1. Valor Contínuo\n- Demonstrar valor constante do produto/serviço\n- Apresentar novos recursos e melhorias\n- Compartilhar casos de sucesso relevantes\n\n### 2. Relacionamento Personalizado\n- Conhecer histórico e preferências do cliente\n- Adaptar comunicação ao perfil individual\n- Antecipar necessidades e oferecer soluções\n\n### 3. Programa de Benefícios\n- Oferecer vantagens exclusivas para clientes fiéis\n- Criar sistema de pontuação ou recompensas\n- Proporcionar acesso antecipado a novidades\n\n## Táticas Específicas\n\n### Comunicação Proativa\n- Check-ins regulares de satisfação\n- Compartilhamento de conteúdo relevante\n- Convites para eventos exclusivos\n\n### Suporte Diferenciado\n- Atendimento prioritário\n- Canal direto de comunicação\n- Resolução ágil de questões',
    'por_fase',
    true,
    ARRAY['fidelizacao', 'retencao', 'relacionamento']
  )
ON CONFLICT DO NOTHING;

-- LINK DOCUMENTATION TO PHASES
-- Associate phase-specific documentation
INSERT INTO documentacoes_por_fase (fase_id, documentacao_id, obrigatorio, ordem_exibicao) VALUES
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    (SELECT id FROM documentacoes WHERE titulo = 'Guia de Onboarding - Semana 1'),
    true,
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    (SELECT id FROM documentacoes WHERE titulo = 'Estratégias de Fidelização'),
    true,
    1
  )
ON CONFLICT (fase_id, documentacao_id) DO NOTHING;

-- INSERT DEFAULT AI BEHAVIOR
-- Configure AI behavior patterns for each phase
INSERT INTO comportamento_padrao (fase_id, instrucoes, proibicoes, exemplos_resposta, temperatura, max_tokens) VALUES
  (
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Seja acolhedor e informativo. Foque em despertar interesse genuíno sobre os benefícios da Cresci e Perdi. Use linguagem amigável e acessível. Faça perguntas para entender melhor as necessidades do potencial cliente.',
    'Não faça vendas diretas ou pressione por decisões imediatas. Não solicite dados pessoais sensíveis. Evite linguagem técnica complexa ou jargões empresariais.',
    '[
      {
        "pergunta": "O que é a Cresci e Perdi?",
        "resposta": "A Cresci e Perdi é uma plataforma inovadora de gestão de marca que ajuda empresas a crescer de forma sustentável e organizada. Nosso foco é acompanhar cada fase do seu negócio com ferramentas inteligentes e suporte personalizado. Que tipo de desafio sua empresa está enfrentando atualmente?"
      },
      {
        "pergunta": "Como vocês podem me ajudar?",
        "resposta": "Excelente pergunta! Ajudamos empresas a estruturar seus processos, otimizar operações e tomar decisões mais inteligentes através de nossa plataforma. Cada negócio é único, então gostaria de entender melhor: qual é o principal obstáculo que você gostaria de superar?"
      }
    ]',
    0.8,
    400
  ),
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Seja paciente e didático. Priorize o ensino dos conceitos básicos e funcionalidades essenciais. Use linguagem simples e ofereça exemplos práticos. Incentive o cliente a fazer perguntas e pratique junto.',
    'Não sobrecarregue com informações avançadas. Evite assumir conhecimento prévio. Não pule etapas importantes do processo de aprendizado.',
    '[
      {
        "pergunta": "Como começar a usar a plataforma?",
        "resposta": "Vamos começar pelo básico! Primeiro, vou te ajudar a completar seu perfil - isso leva apenas 2 minutos e permite que a plataforma se adapte às suas necessidades. Depois, faremos um tour rápido pelas funcionalidades principais. Você já teve chance de explorar alguma área da plataforma?"
      },
      {
        "pergunta": "Estou perdido, por onde começar?",
        "resposta": "Sem problemas, é completamente normal! Vamos por partes. Que tal começarmos configurando uma coisa de cada vez? Primeiro, vou te mostrar como acessar o painel principal - é daí que você vai gerenciar tudo. Posso te guiar passo a passo agora?"
      }
    ]',
    0.6,
    500
  ),
  (
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Seja personalizado e valorativo. Demonstre conhecimento do histórico do cliente e suas conquistas. Ofereça insights valiosos e oportunidades de crescimento. Mantenha tom consultivo e estratégico.',
    'Não seja genérico ou impessoal. Evite ofertas que não se alinhem com o perfil do cliente. Não ignore o histórico de interações anteriores.',
    '[
      {
        "pergunta": "Como posso aproveitar melhor a plataforma?",
        "resposta": "Baseado no seu histórico, vejo que você tem usado principalmente as funcionalidades de gestão de unidades - e com ótimos resultados! Que tal explorarmos as ferramentas de analytics avançado? Elas podem te dar insights ainda mais profundos sobre o desempenho das suas operações. Posso te mostrar alguns relatórios personalizados?"
      },
      {
        "pergunta": "Vocês têm novidades interessantes?",
        "resposta": "Sim! Considerando seu perfil e como você tem usado a plataforma, acredito que você vai adorar nossa nova funcionalidade de IA preditiva - ela pode antecipar tendências baseadas nos seus dados históricos. Também temos um programa beta para clientes como você. Gostaria de saber mais detalhes?"
      }
    ]',
    0.7,
    600
  )
ON CONFLICT (fase_id) DO NOTHING;

-- INSERT SAMPLE INTERACTION HISTORY
-- Realistic interaction logs for testing and demonstration
INSERT INTO historico_interacoes (usuario_id, unidade_id, fase_id, pergunta, resposta, tempo_resposta_ms, sucesso, metadata) VALUES
  (
    NULL, -- Anonymous user
    (SELECT id FROM unidades WHERE codigo = 'SP-CENTRO-001'),
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Gostaria de saber mais sobre os serviços da Cresci e Perdi',
    'Olá! Fico feliz em ajudar você a conhecer melhor a Cresci e Perdi. Somos uma plataforma completa de gestão de marca que acompanha empresas em todas as fases do crescimento. Nosso diferencial está no suporte personalizado e ferramentas inteligentes que se adaptam às necessidades específicas de cada negócio. Que tipo de desafio sua empresa está enfrentando atualmente?',
    1250,
    true,
    '{"ip": "192.168.1.100", "canal": "website", "dispositivo": "desktop"}'
  ),
  (
    NULL,
    (SELECT id FROM unidades WHERE codigo = 'RJ-NORTE-001'),
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Como configurar meu perfil na plataforma?',
    'Vou te ajudar a configurar seu perfil passo a passo! Primeiro, clique no ícone do seu usuário no canto superior direito da tela. Depois, selecione "Configurações de Perfil". Lá você pode adicionar suas informações básicas, preferências de comunicação e definir suas metas. Precisa de ajuda com algum campo específico?',
    890,
    true,
    '{"ip": "10.0.0.50", "canal": "app", "dispositivo": "mobile"}'
  ),
  (
    NULL,
    (SELECT id FROM unidades WHERE codigo = 'RS-SUL-001'),
    (SELECT id FROM fases WHERE nome = 'pos_compra'),
    'Estou tendo dificuldades com a integração',
    'Entendo sua preocupação com a integração. Vamos resolver isso juntos! Primeiro, me conta qual sistema você está tentando integrar? Enquanto isso, vou verificar se há alguma configuração específica que precisa ser ajustada. Também posso agendar uma sessão de suporte técnico personalizada para você - seria útil?',
    1100,
    true,
    '{"ip": "172.16.0.25", "canal": "chat", "dispositivo": "desktop", "prioridade": "alta"}'
  ),
  (
    NULL,
    (SELECT id FROM unidades WHERE codigo = 'SP-CENTRO-001'),
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Quais são as novidades da plataforma?',
    'Que bom que você está sempre atento às novidades! Baseado no seu perfil e histórico de uso, tenho algumas atualizações que vão te interessar muito. Lançamos recentemente a funcionalidade de IA preditiva que pode antecipar tendências baseadas nos seus dados. Também temos novos templates de relatórios personalizados. Gostaria que eu te mostrasse essas funcionalidades em detalhes?',
    950,
    true,
    '{"ip": "192.168.1.100", "canal": "email", "dispositivo": "desktop", "cliente_vip": true}'
  )
ON CONFLICT DO NOTHING;
