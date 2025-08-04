/*
  # Sample Data for Cresci e Perdi Platform

  ## Overview
  This migration inserts sample data to demonstrate the relationships and functionality
  of the Cresci e Perdi brand management platform database.

  ## Data Inserted
  1. Operational phases with proper ordering
  2. Sample business units in different phases
  3. Behavior groups with permissions
  4. Documentation library with phase associations
  5. Default AI behavior configurations
  6. Sample interaction history

  ## Notes
  - All data is designed to showcase real-world usage scenarios
  - Foreign key relationships are properly maintained
  - Sample data includes various operational states
*/

-- Insert Fases (Operational Phases)
INSERT INTO fases (nome, descricao, ordem, cor) VALUES
  ('interacao', 'Fase inicial de interação com potenciais clientes', 1, '#FEF3C7'),
  ('pre_compras', 'Preparação e qualificação antes da compra', 2, '#DBEAFE'),
  ('semana_1', 'Primeira semana pós-compra - onboarding', 3, '#D1FAE5'),
  ('semana_2', 'Segunda semana - acompanhamento inicial', 4, '#E0E7FF'),
  ('semana_3', 'Terceira semana - consolidação de hábitos', 5, '#FCE7F3'),
  ('semana_4', 'Quarta semana - avaliação e ajustes', 6, '#FEF3C7'),
  ('pos_compras', 'Acompanhamento pós-programa principal', 7, '#F3E8FF'),
  ('fidelizacao', 'Manutenção de relacionamento e fidelização', 8, '#ECFDF5');

-- Insert sample Unidades (Business Units)
INSERT INTO unidades (nome, codigo, descricao, fase_atual_id, status, localizacao, data_inicio) VALUES
  (
    'Unidade Centro SP',
    'UCSP001',
    'Unidade principal localizada no centro de São Paulo',
    (SELECT id FROM fases WHERE nome = 'pos_compras'),
    'ativa',
    'São Paulo, SP - Centro',
    '2024-01-15'
  ),
  (
    'Unidade Norte RJ',
    'UNRJ001',
    'Unidade de expansão na zona norte do Rio de Janeiro',
    (SELECT id FROM fases WHERE nome = 'semana_2'),
    'implementacao',
    'Rio de Janeiro, RJ - Zona Norte',
    '2024-02-01'
  ),
  (
    'Unidade Sul RS',
    'USRS001',
    'Unidade operacional em Porto Alegre',
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'ativa',
    'Porto Alegre, RS',
    '2023-11-20'
  ),
  (
    'Unidade Oeste DF',
    'UODF001',
    'Nova unidade em fase de planejamento em Brasília',
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'planejamento',
    'Brasília, DF',
    '2024-03-01'
  );

-- Insert Grupos_comportamento (Behavior Groups)
INSERT INTO grupos_comportamento (nome, fase_id, descricao, permitido_responder, escopo, permissoes, restricoes) VALUES
  (
    'Gestores Administrativos',
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Grupo com permissões completas para gestão administrativa',
    true,
    '{"areas": ["administrativa", "financeira", "operacional"], "nivel_acesso": "completo"}',
    '{"criar": true, "editar": true, "excluir": true, "visualizar": true}',
    ARRAY['Não pode alterar configurações de segurança sem aprovação']
  ),
  (
    'Operadores de Campo',
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Operadores responsáveis pelo atendimento direto aos clientes',
    true,
    '{"areas": ["atendimento", "suporte"], "nivel_acesso": "operacional"}',
    '{"criar": false, "editar": true, "excluir": false, "visualizar": true}',
    ARRAY['Não pode acessar dados financeiros', 'Limitado a horário comercial']
  ),
  (
    'Supervisores de Qualidade',
    (SELECT id FROM fases WHERE nome = 'semana_4'),
    'Supervisores responsáveis pela qualidade do atendimento',
    true,
    '{"areas": ["qualidade", "treinamento"], "nivel_acesso": "supervisao"}',
    '{"criar": true, "editar": true, "excluir": false, "visualizar": true}',
    ARRAY['Deve registrar todas as intervenções', 'Acesso limitado a dados de qualidade']
  ),
  (
    'Consultores Especializados',
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Consultores para casos complexos e fidelização',
    true,
    '{"areas": ["consultoria", "fidelizacao"], "nivel_acesso": "especializado"}',
    '{"criar": true, "editar": true, "excluir": false, "visualizar": true}',
    ARRAY['Foco em casos de alta complexidade', 'Deve documentar estratégias utilizadas']
  );

-- Insert Documentacoes (Documentation)
INSERT INTO documentacoes (titulo, conteudo, tipo, categoria, tags, autor_id) VALUES
  (
    'Manual de Procedimentos Gerais',
    '# Manual de Procedimentos Gerais\n\n## Introdução\nEste manual contém os procedimentos padrão para todas as operações da plataforma Cresci e Perdi.\n\n## Procedimentos Básicos\n1. Cadastro de clientes\n2. Acompanhamento de progresso\n3. Relatórios de performance',
    'manual',
    'Procedimentos',
    ARRAY['manual', 'procedimentos', 'geral'],
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Política de Qualidade no Atendimento',
    '# Política de Qualidade\n\n## Objetivos\n- Garantir excelência no atendimento\n- Manter padrões consistentes\n- Promover melhoria contínua\n\n## Diretrizes\n1. Tempo de resposta máximo: 2 horas\n2. Linguagem sempre profissional e empática\n3. Documentação obrigatória de todas as interações',
    'politica',
    'Qualidade',
    ARRAY['qualidade', 'atendimento', 'politica'],
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Guia de Implementação - Semana 1',
    '# Guia de Implementação - Primeira Semana\n\n## Checklist de Onboarding\n- [ ] Apresentação da plataforma\n- [ ] Configuração inicial do perfil\n- [ ] Primeiro contato com mentor\n- [ ] Definição de metas iniciais\n\n## Pontos de Atenção\n- Acompanhamento diário nos primeiros 3 dias\n- Feedback constante sobre adaptação',
    'guia',
    'Implementação',
    ARRAY['implementacao', 'onboarding', 'semana1'],
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Relatório de Análise de Performance',
    '# Relatório de Performance - Modelo\n\n## Métricas Principais\n1. Taxa de engajamento\n2. Tempo médio de resposta\n3. Satisfação do cliente\n4. Conversão por fase\n\n## Análise Qualitativa\n- Pontos fortes identificados\n- Áreas de melhoria\n- Recomendações estratégicas',
    'relatorio',
    'Analytics',
    ARRAY['relatorio', 'performance', 'analytics'],
    (SELECT id FROM auth.users LIMIT 1)
  );

-- Insert Documentacoes_por_fase (Link documentation to phases)
INSERT INTO documentacoes_por_fase (fase_id, documentacao_id, obrigatorio, ordem) VALUES
  -- Manual geral para todas as fases iniciais
  (
    (SELECT id FROM fases WHERE nome = 'interacao'),
    (SELECT id FROM documentacoes WHERE titulo = 'Manual de Procedimentos Gerais'),
    true,
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'pre_compras'),
    (SELECT id FROM documentacoes WHERE titulo = 'Manual de Procedimentos Gerais'),
    true,
    1
  ),
  -- Política de qualidade para fases operacionais
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    (SELECT id FROM documentacoes WHERE titulo = 'Política de Qualidade no Atendimento'),
    true,
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'semana_2'),
    (SELECT id FROM documentacoes WHERE titulo = 'Política de Qualidade no Atendimento'),
    true,
    1
  ),
  -- Guia específico para semana 1
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    (SELECT id FROM documentacoes WHERE titulo = 'Guia de Implementação - Semana 1'),
    true,
    2
  ),
  -- Relatório para fases avançadas
  (
    (SELECT id FROM fases WHERE nome = 'pos_compras'),
    (SELECT id FROM documentacoes WHERE titulo = 'Relatório de Análise de Performance'),
    false,
    1
  ),
  (
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    (SELECT id FROM documentacoes WHERE titulo = 'Relatório de Análise de Performance'),
    false,
    1
  );

-- Insert Comportamento_padrao (Default AI Behavior)
INSERT INTO comportamento_padrao (fase_id, instrucoes, proibicoes, tom_comunicacao, palavras_chave, exemplos_resposta) VALUES
  (
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Seja acolhedor e informativo. Foque em entender as necessidades do cliente e apresentar soluções de forma clara. Mantenha um tom profissional mas caloroso.',
    'Não faça promessas que não podem ser cumpridas. Não pressione para vendas. Evite linguagem técnica excessiva.',
    'acolhedor',
    ARRAY['bem-vindo', 'como posso ajudar', 'entender suas necessidades', 'solução personalizada'],
    '[
      {"pergunta": "Como funciona o programa?", "resposta": "Nosso programa é personalizado para suas necessidades específicas. Vamos começar entendendo seus objetivos principais..."},
      {"pergunta": "Qual o investimento?", "resposta": "O investimento varia conforme o plano escolhido. Posso apresentar as opções disponíveis após entendermos melhor seu perfil..."}
    ]'::jsonb
  ),
  (
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Seja encorajador e prestativo. Foque no acompanhamento próximo e na resolução de dúvidas. Celebre pequenas conquistas e ofereça suporte constante.',
    'Não minimize dificuldades relatadas. Não sobrecarregue com informações. Evite comparações com outros clientes.',
    'encorajador',
    ARRAY['parabéns', 'você está indo bem', 'é normal sentir', 'vamos juntos', 'pequenos passos'],
    '[
      {"pergunta": "Estou com dificuldades", "resposta": "É completamente normal sentir isso no início. Vamos identificar juntos onde podemos ajustar a estratégia para facilitar seu progresso..."},
      {"pergunta": "Não estou vendo resultados", "resposta": "Os primeiros resultados podem demorar um pouco para aparecer. Vamos revisar o que você já conquistou e ajustar o que for necessário..."}
    ]'::jsonb
  ),
  (
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Seja consultivo e estratégico. Foque em manutenção de resultados e evolução contínua. Demonstre valor agregado e construa relacionamento de longo prazo.',
    'Não seja complacente com a situação atual. Não negligencie o acompanhamento. Evite automatizar demais as interações.',
    'consultivo',
    ARRAY['evolução contínua', 'próximos desafios', 'manter conquistas', 'longo prazo', 'parceria'],
    '[
      {"pergunta": "Como manter os resultados?", "resposta": "Manter os resultados requer estratégias de longo prazo. Vamos criar um plano de manutenção personalizado que se adapte à sua nova rotina..."},
      {"pergunta": "Quais os próximos passos?", "resposta": "Agora que você domina os fundamentos, podemos explorar estratégias mais avançadas. Que área você gostaria de desenvolver mais?"}
    ]'::jsonb
  );

-- Insert sample Historico_interacoes (Interaction History)
INSERT INTO historico_interacoes (usuario_id, unidade_id, fase_id, pergunta, resposta, tempo_resposta_ms, sucesso, feedback_usuario, metadados) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM unidades WHERE codigo = 'UCSP001'),
    (SELECT id FROM fases WHERE nome = 'interacao'),
    'Como posso começar o programa?',
    'Que ótimo que você quer começar! Vamos primeiro entender seus objetivos principais. Pode me contar o que te motivou a buscar nosso programa?',
    1250,
    true,
    5,
    '{"canal": "chat", "dispositivo": "desktop", "sessao_id": "sess_001"}'::jsonb
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM unidades WHERE codigo = 'UNRJ001'),
    (SELECT id FROM fases WHERE nome = 'semana_1'),
    'Estou com dificuldades para seguir a dieta',
    'É completamente normal sentir isso no início. Vamos identificar juntos onde podemos ajustar a estratégia para facilitar seu progresso. Que parte específica está sendo mais desafiadora?',
    980,
    true,
    4,
    '{"canal": "whatsapp", "dispositivo": "mobile", "sessao_id": "sess_002"}'::jsonb
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM unidades WHERE codigo = 'USRS001'),
    (SELECT id FROM fases WHERE nome = 'fidelizacao'),
    'Como manter os resultados a longo prazo?',
    'Manter os resultados requer estratégias de longo prazo. Vamos criar um plano de manutenção personalizado que se adapte à sua nova rotina. Primeiro, me conte como está sua rotina atual...',
    1450,
    true,
    5,
    '{"canal": "app", "dispositivo": "mobile", "sessao_id": "sess_003"}'::jsonb
  );

-- Insert sample user data (this would typically be handled by auth triggers)
-- Note: In a real scenario, this would be populated automatically when users sign up
INSERT INTO usuarios (id, nome_completo, role, unidades_acesso, fases_acesso) 
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email) as nome_completo,
  'admin'::usuario_role,
  ARRAY(SELECT id FROM unidades)::uuid[],
  ARRAY(SELECT id FROM fases)::uuid[]
FROM auth.users 
WHERE email IS NOT NULL
LIMIT 1
ON CONFLICT (id) DO NOTHING;
