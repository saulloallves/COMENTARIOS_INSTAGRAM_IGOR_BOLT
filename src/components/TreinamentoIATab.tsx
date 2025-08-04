import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Edit, 
  Save, 
  RefreshCw, 
  Clock, 
  User, 
  FileText, 
  Target, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  Info,
  History,
  Upload,
  Download,
  Play,
  Pause,
  BarChart3,
  Settings,
  Database,
  Zap,
  TrendingUp,
  Activity,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  X,
  HelpCircle,
  Monitor,
  Cpu,
  MemoryStick,
  Timer,
  Award,
  LineChart,
  BookOpen,
  Layers,
  Code,
  Sparkles
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';

interface PromptData {
  id: string;
  tipo: 'comportamento' | 'classificacao' | 'resposta' | 'intencao' | 'gerar_resposta' | 'gerar_resposta_comentario';
  titulo: string;
  descricao: string;
  prompt: string;
  autor: string;
  updated_at: string;
  versao: number;
  ativo: boolean;
}

interface TrainingSession {
  id: string;
  name: string;
  status: 'idle' | 'training' | 'completed' | 'error' | 'paused';
  progress: number;
  accuracy: number;
  loss: number;
  startTime: string;
  endTime?: string;
  datasetSize: number;
  modelType: string;
  epochs: number;
  currentEpoch: number;
  estimatedTimeRemaining?: string;
}

interface Dataset {
  id: string;
  name: string;
  size: string;
  samples: number;
  type: string;
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
  format: string;
}

const TreinamentoIATab: React.FC = () => {
  const { promptsIA, loading, updatePromptIA, createPromptIA } = useSupabaseData();
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  
  // Data states
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Training states
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'prompts' | 'training' | 'datasets' | 'analytics'>('prompts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [trainingName, setTrainingName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');

  // Default prompts with complete data
  const defaultPrompts: PromptData[] = [
    {
      id: 'default-1',
      tipo: 'comportamento',
      titulo: 'Comportamento do Comentário',
      descricao: 'Identifica grupos comportamentais como institucional, crítica, spam, elogio',
      prompt: `Analise o comentário e classifique-o em um dos seguintes grupos comportamentais:

**GRUPOS COMPORTAMENTAIS:**

1. **Institucional**: Comentários sobre a empresa, marca ou serviços de forma neutra
   - Perguntas sobre funcionamento
   - Informações sobre localização/horários
   - Comentários neutros sobre a marca

2. **Crítica Construtiva**: Feedback negativo mas respeitoso com sugestões
   - Sugestões de melhoria
   - Feedback sobre experiência
   - Críticas educadas e específicas

3. **Crítica Agressiva**: Comentários negativos com tom hostil ou ofensivo
   - Linguagem ofensiva
   - Ataques pessoais
   - Comentários destrutivos

4. **Elogio**: Comentários positivos, satisfação ou recomendação
   - Agradecimentos
   - Recomendações espontâneas
   - Expressões de satisfação

5. **Dúvida Frequente**: Perguntas comuns sobre produtos/serviços
   - Perguntas sobre preços
   - Dúvidas sobre processos
   - Questões técnicas

6. **Comercial**: Tentativas de venda, parcerias ou promoções
   - Ofertas de produtos/serviços
   - Propostas de parceria
   - Spam comercial

7. **Spam/Scam**: Links suspeitos, conteúdo irrelevante ou golpes
   - Links maliciosos
   - Conteúdo irrelevante
   - Tentativas de golpe

8. **Sugestão**: Ideias para melhorias ou novos recursos
   - Ideias criativas
   - Propostas de funcionalidades
   - Sugestões construtivas

**INSTRUÇÕES:**
- Considere o tom, contexto e intenção por trás das palavras
- Analise emojis e pontuação como indicadores de sentimento
- Priorize a classificação mais específica quando houver dúvida
- Use o contexto da conversa se disponível`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    },
    {
      id: 'default-2',
      tipo: 'classificacao',
      titulo: 'Classificação do Comentário',
      descricao: 'Decide se o comentário deve ser aprovado ou reprovado',
      prompt: `Avalie se o comentário deve ser APROVADO ou REPROVADO com base nos seguintes critérios:

**CRITÉRIOS PARA APROVAÇÃO:**

✅ **APROVAR quando:**
- Comentário respeitoso e construtivo
- Dúvidas legítimas sobre produtos/serviços
- Elogios e feedback positivo
- Críticas construtivas sem ofensas
- Sugestões relevantes para melhoria
- Perguntas educadas sobre funcionamento
- Expressões de interesse genuíno
- Agradecimentos e reconhecimentos

**CRITÉRIOS PARA REPROVAÇÃO:**

❌ **REPROVAR quando:**
- Linguagem ofensiva, discriminatória ou agressiva
- Spam, links suspeitos ou conteúdo irrelevante
- Tentativas de golpe ou fraude
- Informações falsas ou enganosas
- Violação das diretrizes da comunidade
- Conteúdo que pode prejudicar a reputação da marca
- Ataques pessoais ou bullying
- Conteúdo sexual, violento ou inadequado
- Tentativas de phishing ou malware

**CASOS ESPECIAIS:**
- **Críticas válidas**: Aprovar mesmo se negativas, desde que construtivas
- **Humor/Ironia**: Avaliar contexto e intenção
- **Discussões**: Aprovar debates respeitosos
- **Menções de concorrentes**: Avaliar se é comparação justa ou ataque

**DIRETRIZES:**
- Priorize sempre a segurança da comunidade
- Mantenha a reputação da marca
- Seja consistente nas decisões
- Considere o contexto cultural e regional
- Em caso de dúvida, prefira a moderação humana`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    },
    {
      id: 'default-3',
      tipo: 'resposta',
      titulo: 'Necessidade de Resposta',
      descricao: 'Define quando comentários precisam de resposta automática',
      prompt: `Determine se o comentário PRECISA DE RESPOSTA com base nos critérios:

**SITUAÇÕES QUE EXIGEM RESPOSTA:**

🔄 **RESPONDER quando:**
- Dúvidas sobre produtos, serviços ou funcionamento
- Reclamações que podem ser resolvidas publicamente
- Elogios que merecem agradecimento público
- Pedidos de informação ou esclarecimento
- Comentários que demonstram interesse genuíno
- Perguntas sobre preços, horários ou localização
- Solicitações de suporte técnico
- Feedback construtivo que merece reconhecimento
- Comentários que podem gerar engajamento positivo

**SITUAÇÕES QUE NÃO EXIGEM RESPOSTA:**

⏸️ **NÃO RESPONDER quando:**
- Spam ou conteúdo irrelevante
- Comentários puramente ofensivos
- Conversas entre outros usuários
- Comentários que já foram respondidos
- Situações que exigem atendimento privado/direto
- Comentários muito antigos (mais de 48h)
- Trolling ou provocações óbvias
- Comentários de bots ou contas falsas
- Discussões políticas ou polêmicas

**CRITÉRIOS DE PRIORIDADE:**
1. **Alta prioridade**: Reclamações urgentes, dúvidas sobre segurança
2. **Média prioridade**: Perguntas gerais, elogios, sugestões
3. **Baixa prioridade**: Comentários casuais, conversas sociais

**CONSIDERAÇÕES ESPECIAIS:**
- Horário de funcionamento (responder apenas em horário comercial)
- Volume de comentários (priorizar os mais importantes)
- Contexto da publicação (posts promocionais vs informativos)
- Histórico do usuário (clientes frequentes têm prioridade)

**LEMBRE-SE:**
Uma resposta pública pode gerar mais engajamento e demonstrar cuidado com a comunidade, mas nem todo comentário precisa de resposta imediata.`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    },
    {
      id: 'default-4',
      tipo: 'intencao',
      titulo: 'Intenção do Comentário',
      descricao: 'Identifica intenções como dúvida, ironia, elogio, venda, crítica',
      prompt: `Identifique a INTENÇÃO PRINCIPAL por trás do comentário:

**TIPOS DE INTENÇÃO:**

🎯 **1. Elogio/Gratidão**
- Expressar satisfação com produto/serviço
- Agradecer atendimento recebido
- Recomendar para outros usuários
- Reconhecer qualidade ou profissionalismo
- *Indicadores*: "obrigado", "excelente", "recomendo", emojis positivos

🔧 **2. Reclamação/Problema**
- Manifestar insatisfação específica
- Reportar problema técnico
- Solicitar solução para questão
- Expressar frustração com experiência
- *Indicadores*: "problema", "não funciona", "decepcionado", tom negativo

❓ **3. Pedido de Ajuda/Suporte**
- Solicitar orientação técnica
- Pedir instruções de uso
- Buscar solução para dificuldade
- Necessitar assistência personalizada
- *Indicadores*: "como", "ajuda", "não consigo", "preciso"

💡 **4. Pergunta/Informação**
- Buscar dados específicos sobre produtos
- Questionar preços ou condições
- Solicitar detalhes técnicos
- Obter informações gerais
- *Indicadores*: "quanto", "onde", "quando", "qual", "?"

💰 **5. Interesse Comercial**
- Demonstrar intenção de compra
- Negociar preços ou condições
- Solicitar orçamento
- Expressar interesse em produto específico
- *Indicadores*: "comprar", "preço", "orçamento", "disponível"

😏 **6. Ironia/Sarcasmo**
- Usar tom irônico ou sarcástico
- Fazer crítica indireta
- Expressar ceticismo
- Usar humor ácido
- *Indicadores*: contexto contraditório, pontuação excessiva, emojis irônicos

⚔️ **7. Ataque/Ofensa**
- Intenção de prejudicar ou humilhar
- Expressar raiva ou hostilidade
- Fazer ataques pessoais
- Desqualificar marca ou pessoas
- *Indicadores*: linguagem agressiva, palavrões, ameaças

**DICAS PARA ANÁLISE:**
- Observe o contexto completo da conversa
- Considere emojis e pontuação como indicadores
- Analise o histórico do usuário se disponível
- Identifique palavras-chave e expressões típicas
- Considere aspectos culturais e regionais
- Em caso de múltiplas intenções, priorize a principal

**IMPORTÂNCIA:**
A identificação correta da intenção é fundamental para gerar respostas adequadas e eficazes, melhorando a experiência do usuário e a eficiência do atendimento.`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    },
    {
      id: 'default-5',
      tipo: 'gerar_resposta_comentario',
      titulo: 'Gerar Resposta para Comentário',
      descricao: 'Cria respostas personalizadas e contextualizadas para comentários específicos',
      prompt: `Gere uma resposta adequada e personalizada para o comentário do Instagram baseando-se nos seguintes critérios:

**CONTEXTO A CONSIDERAR:**

🏢 **Informações da Empresa:**
- Fase operacional atual da unidade (interação, pré-compras, compras, etc.)
- Políticas e diretrizes da marca Cresci e Perdi
- Tom de voz da marca: acolhedor, profissional, humano
- Valores: sustentabilidade, economia circular, moda consciente

📝 **Análise do Comentário:**
- Tipo de comentário (elogio, dúvida, reclamação, sugestão, etc.)
- Tom e sentimento do comentário original
- Urgência da situação
- Histórico de interações se disponível
- Perfil do usuário que comentou

**DIRETRIZES PARA RESPOSTA:**

💬 **1. Tom Profissional e Acolhedor:**
- Use linguagem respeitosa e empática
- Mantenha tom consistente com a marca
- Seja genuíno e humano, evite respostas robóticas
- Adapte o nível de formalidade ao contexto
- Use "você" em vez de "senhor/senhora" para proximidade

🎯 **2. Personalização:**
- Mencione o nome do usuário quando apropriado (@usuario)
- Referencie aspectos específicos do comentário
- Adapte a resposta ao contexto da situação
- Considere o histórico de interações anteriores
- Use informações do perfil quando relevante

⚡ **3. Ação Apropriada por Tipo:**

**Para ELOGIOS:**
- Agradeça sinceramente e de forma específica
- Reforce pontos positivos mencionados
- Convide para compartilhar experiência
- Mencione valores da marca quando apropriado

**Para DÚVIDAS:**
- Forneça informações claras e objetivas
- Direcione para canais apropriados se necessário
- Ofereça ajuda adicional
- Use linguagem simples e acessível

**Para RECLAMAÇÕES:**
- Demonstre empatia genuína
- Reconheça o problema sem fazer desculpas vazias
- Ofereça solução concreta e praticável
- Direcione para atendimento privado se necessário

**Para SUGESTÕES:**
- Valorize o feedback e agradeça
- Explique como sugestões são consideradas
- Mantenha expectativas realistas
- Demonstre que a opinião importa

**Para INTERESSE COMERCIAL:**
- Forneça informações solicitadas
- Direcione para canais de venda apropriados
- Mantenha tom consultivo, não agressivo
- Respeite limites da fase operacional atual

🎨 **4. Elementos Obrigatórios:**
- Agradecimento pela interação e engajamento
- Resposta específica ao ponto levantado pelo usuário
- Call-to-action quando apropriado (DM, WhatsApp, site, etc.)
- Emojis moderados para humanizar (máximo 2 por resposta)
- Assinatura da marca quando necessário

🚫 **5. Restrições Importantes:**
- Não prometa o que não pode cumprir
- Não revele informações confidenciais ou preços sem autorização
- Não entre em discussões polêmicas ou confrontos
- Mantenha respostas concisas (máximo 280 caracteres para Instagram)
- Evite linguagem muito técnica ou jargões internos
- Não faça diagnósticos ou recomendações médicas
- Não responda a trolls ou comentários ofensivos

🔄 **6. Adaptação por Fase Operacional:**

**INTERAÇÃO:** 
- Foque em construir relacionamento e gerar interesse
- Eduque sobre o conceito de brechó sustentável
- Não revele preços ou datas específicas

**PRÉ-COMPRAS:** 
- Eduque sobre processo e prepare expectativas
- Explique critérios de seleção de peças
- Mantenha expectativas realistas sobre cronograma

**COMPRAS:** 
- Oriente sobre critérios e procedimentos
- Acelere agendamentos quando apropriado
- Comunique urgência sem pressionar

**OPERAÇÃO:** 
- Suporte vendas e atendimento ao cliente
- Forneça informações sobre produtos disponíveis
- Facilite processo de compra

**FECHAMENTO:** 
- Comunique status e mantenha relacionamento
- Prepare para próximo ciclo
- Agradeça participação na jornada

**FORMATO DE SAÍDA:**
Forneça apenas o texto da resposta, pronto para ser postado como comentário no Instagram, sem aspas ou formatação adicional. A resposta deve ser natural, contextualizada e alinhada com a voz da marca Cresci e Perdi.`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    },
    {
      id: 'default-6',
      tipo: 'gerar_resposta',
      titulo: 'Gerar Resposta da IA',
      descricao: 'Cria respostas automáticas inteligentes baseadas no contexto e fase operacional',
      prompt: `Gere uma resposta automática inteligente baseada no contexto fornecido:

**ANÁLISE DO CONTEXTO:**

🔍 **Avaliação Inicial:**
- Analise o tipo de pergunta ou solicitação
- Identifique a fase operacional atual da unidade
- Considere o histórico de interações anteriores
- Avalie o nível de urgência da solicitação
- Determine o tom apropriado para a resposta
- Verifique se há informações suficientes para resposta completa

**DIRETRIZES DE RESPOSTA:**

🎯 **1. Personalização Inteligente:**
- Adapte a linguagem ao perfil do usuário identificado
- Use informações do contexto para personalizar
- Mantenha consistência com interações anteriores
- Considere preferências de comunicação identificadas
- Ajuste formalidade baseado no histórico

🔄 **2. Adequação por Fase Operacional:**

**INTERAÇÃO:**
- Respostas acolhedoras e informativas
- Foco em educação sobre conceito brechó
- Construção de relacionamento
- Geração de interesse e expectativa

**PRÉ-COMPRAS:**
- Orientações sobre processo e expectativas
- Preparação da comunidade para próxima fase
- Comunicação de cronograma geral
- Esclarecimento de dúvidas sobre funcionamento

**COMPRAS:**
- Instruções claras sobre critérios e procedimentos
- Orientação sobre agendamentos
- Comunicação sobre qualidade esperada
- Suporte ao processo de seleção

**OPERAÇÃO:**
- Suporte direto e soluções práticas
- Informações sobre produtos disponíveis
- Facilitação do processo de compra
- Atendimento ao cliente ativo

**PÓS-OPERAÇÃO:**
- Manutenção de relacionamento e feedback
- Preparação para próximo ciclo
- Agradecimentos e reconhecimentos
- Coleta de sugestões para melhorias

📋 **3. Estrutura da Resposta:**
- **Cumprimento personalizado** quando apropriado
- **Reconhecimento** da solicitação específica
- **Informação ou solução** clara e objetiva
- **Próximos passos** ou call-to-action quando necessário
- **Encerramento cordial** com disponibilidade para ajuda

✅ **4. Qualidade e Precisão:**
- Informações sempre atualizadas e corretas
- Linguagem clara e acessível
- Evite jargões técnicos desnecessários
- Seja conciso mas completo na informação
- Mantenha tom profissional mas humano
- Verifique consistência com políticas da marca

⚠️ **5. Limitações e Escalação:**
- Reconheça quando não pode resolver algo
- Direcione para canais apropriados quando necessário
- Não prometa o que não pode cumprir
- Seja transparente sobre limitações do sistema
- Ofereça alternativas quando possível
- Escale para atendimento humano quando apropriado

**CASOS ESPECIAIS:**

🚨 **Situações de Urgência:**
- Problemas de segurança ou saúde
- Reclamações graves sobre produtos
- Situações que podem afetar reputação da marca
- Questões legais ou regulatórias

🤝 **Oportunidades de Engajamento:**
- Elogios que merecem reconhecimento público
- Sugestões valiosas da comunidade
- Momentos para educar sobre sustentabilidade
- Chances de fortalecer relacionamento com cliente

**MÉTRICAS DE SUCESSO:**
- Resolução da dúvida/problema do usuário
- Manutenção do tom de marca
- Geração de engajamento positivo
- Direcionamento eficaz quando necessário
- Satisfação do usuário com a resposta

**FORMATO DE SAÍDA:**
Forneça uma resposta completa, natural e contextualizada, pronta para ser enviada ao usuário. A resposta deve demonstrar compreensão do contexto, oferecer valor real e manter o padrão de qualidade da marca Cresci e Perdi.`,
      autor: 'Sistema',
      updated_at: new Date().toISOString(),
      versao: 1,
      ativo: true
    }
  ];

  // Use database prompts or fallback to defaults
  const prompts = promptsIA.length > 0 ? promptsIA : defaultPrompts;

  // Initialize mock data
  useEffect(() => {
    // Mock training sessions
    setTrainingSessions([
      {
        id: '1',
        name: 'Modelo de Classificação v2.1',
        status: 'completed',
        progress: 100,
        accuracy: 94.2,
        loss: 0.12,
        startTime: '2025-01-25T10:00:00Z',
        endTime: '2025-01-25T12:30:00Z',
        datasetSize: 15000,
        modelType: 'Classificação',
        epochs: 10,
        currentEpoch: 10
      },
      {
        id: '2',
        name: 'Modelo de Resposta Automática v1.8',
        status: 'training',
        progress: 67,
        accuracy: 89.1,
        loss: 0.18,
        startTime: '2025-01-25T14:00:00Z',
        datasetSize: 8500,
        modelType: 'Geração',
        epochs: 15,
        currentEpoch: 10,
        estimatedTimeRemaining: '45 min'
      },
      {
        id: '3',
        name: 'Modelo de Intenção v1.3',
        status: 'idle',
        progress: 0,
        accuracy: 0,
        loss: 0,
        startTime: '2025-01-25T16:00:00Z',
        datasetSize: 12000,
        modelType: 'Classificação',
        epochs: 8,
        currentEpoch: 0
      }
    ]);

    // Mock datasets
    setDatasets([
      {
        id: '1',
        name: 'Comentários Instagram - Janeiro 2025',
        size: '15.2 MB',
        samples: 12500,
        type: 'Classificação',
        uploadDate: '2025-01-20T10:00:00Z',
        status: 'ready',
        format: 'CSV'
      },
      {
        id: '2',
        name: 'Respostas Automáticas - Dezembro 2024',
        size: '8.7 MB',
        samples: 8300,
        type: 'Geração',
        uploadDate: '2025-01-18T14:30:00Z',
        status: 'ready',
        format: 'JSON'
      },
      {
        id: '3',
        name: 'Análise de Sentimento - Novembro 2024',
        size: '22.1 MB',
        samples: 18700,
        type: 'Análise',
        uploadDate: '2025-01-15T09:15:00Z',
        status: 'processing',
        format: 'CSV'
      }
    ]);
  }, []);

  // Helper functions
  const getCardColor = (tipo: string) => {
    const colors = {
      'comportamento': 'from-blue-500 to-blue-600',
      'classificacao': 'from-green-500 to-green-600', 
      'resposta': 'from-purple-500 to-purple-600',
      'gerar_resposta_comentario': 'from-pink-500 to-pink-600',
      'intencao': 'from-orange-500 to-orange-600',
      'gerar_resposta': 'from-rose-500 to-rose-600'
    };
    return colors[tipo as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCardIcon = (tipo: string) => {
    const icons = {
      'comportamento': Brain,
      'classificacao': CheckCircle,
      'resposta': MessageSquare,
      'gerar_resposta_comentario': MessageSquare,
      'intencao': Target,
      'gerar_resposta': Sparkles
    };
    const IconComponent = icons[tipo as keyof typeof icons] || Brain;
    return IconComponent;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Event handlers
  const openEditModal = (prompt: PromptData) => {
    setSelectedPrompt(prompt);
    setEditedPrompt(prompt.prompt);
    setShowEditModal(true);
  };

  const handleSavePrompt = async () => {
    if (!selectedPrompt || !editedPrompt.trim()) {
      alert('O prompt não pode estar vazio');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let result;
      
      if (selectedPrompt.id.startsWith('default-')) {
        const newPromptData = {
          tipo: selectedPrompt.tipo,
          titulo: selectedPrompt.titulo,
          descricao: selectedPrompt.descricao,
          prompt: editedPrompt.trim(),
          autor: 'Usuário Atual',
          versao: 1,
          ativo: true,
          metadados: {}
        };
        
        result = await createPromptIA(newPromptData);
      } else {
        const updates = {
          prompt: editedPrompt.trim(),
          autor: 'Usuário Atual',
          versao: selectedPrompt.versao + 1
        };
        
        result = await updatePromptIA(selectedPrompt.id, updates);
      }
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedPrompt(null);
        setEditedPrompt('');
      } else {
        alert('Erro ao salvar prompt: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Erro ao salvar prompt. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate upload process
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            // Add new dataset
            const newDataset: Dataset = {
              id: Date.now().toString(),
              name: files[0].name,
              size: formatFileSize(files[0].size),
              samples: Math.floor(Math.random() * 10000) + 1000,
              type: 'Classificação',
              uploadDate: new Date().toISOString(),
              status: 'processing',
              format: files[0].name.split('.').pop()?.toUpperCase() || 'CSV'
            };
            setDatasets(prev => [newDataset, ...prev]);
            setShowDatasetModal(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const startTraining = () => {
    if (!trainingName.trim() || !selectedDataset) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsTraining(true);
    
    // Create new training session
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      name: trainingName,
      status: 'training',
      progress: 0,
      accuracy: 0,
      loss: 1.0,
      startTime: new Date().toISOString(),
      datasetSize: datasets.find(d => d.id === selectedDataset)?.samples || 1000,
      modelType: 'Classificação',
      epochs: 10,
      currentEpoch: 0
    };

    setTrainingSessions(prev => [newSession, ...prev]);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingSessions(prev => prev.map(s => 
        s.id === newSession.id 
          ? { 
              ...s, 
              progress: Math.min(s.progress + Math.random() * 8, 100),
              currentEpoch: Math.min(s.currentEpoch + 1, s.epochs),
              accuracy: Math.min(s.accuracy + Math.random() * 3, 96),
              loss: Math.max(s.loss - Math.random() * 0.05, 0.08)
            }
          : s
      ));
    }, 1500);

    setTimeout(() => {
      clearInterval(interval);
      setTrainingSessions(prev => prev.map(s => 
        s.id === newSession.id 
          ? { ...s, status: 'completed' as const, progress: 100, endTime: new Date().toISOString() }
          : s
      ));
      setIsTraining(false);
      setShowTrainingModal(false);
      setTrainingName('');
      setSelectedDataset('');
    }, 20000);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || prompt.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando sistema de treinamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-8 h-8" />
                </div>
                Centro de Treinamento de IA
              </h1>
              <p className="text-xl text-indigo-100 mb-6 max-w-2xl">
                Configure, treine e monitore modelos de inteligência artificial para moderação automatizada de comentários
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Code className="w-6 h-6 text-indigo-200" />
                    <div>
                      <div className="text-2xl font-bold">{prompts.length}</div>
                      <div className="text-sm text-indigo-200">Prompts Ativos</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-green-200" />
                    <div>
                      <div className="text-2xl font-bold">{trainingSessions.filter(s => s.status === 'training').length}</div>
                      <div className="text-sm text-green-200">Em Treinamento</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-200" />
                    <div>
                      <div className="text-2xl font-bold">{datasets.filter(d => d.status === 'ready').length}</div>
                      <div className="text-sm text-blue-200">Datasets Prontos</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-yellow-200" />
                    <div>
                      <div className="text-2xl font-bold">94.2%</div>
                      <div className="text-sm text-yellow-200">Precisão Média</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'prompts', label: 'Configuração de Prompts', icon: Settings, count: prompts.length },
              { id: 'training', label: 'Sessões de Treinamento', icon: Play, count: trainingSessions.length },
              { id: 'datasets', label: 'Gestão de Datasets', icon: Database, count: datasets.length },
              { id: 'analytics', label: 'Analytics & Métricas', icon: BarChart3, count: null }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-6 px-6 border-b-4 font-semibold text-sm flex items-center justify-center gap-3 transition-all ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Prompts Configuration Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-8">
              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar prompts por título ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="comportamento">Comportamento</option>
                  <option value="classificacao">Classificação</option>
                  <option value="resposta">Necessidade de Resposta</option>
                  <option value="intencao">Intenção</option>
                  <option value="gerar_resposta_comentario">Gerar Resposta (Comentário)</option>
                  <option value="gerar_resposta">Gerar Resposta (IA)</option>
                </select>
              </div>

              {/* Prompt Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredPrompts.map((prompt) => {
                  const IconComponent = getCardIcon(prompt.tipo);
                  
                  return (
                    <div key={prompt.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${getCardColor(prompt.tipo)} p-6 text-white relative`}>
                        <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-5 transition-all"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <IconComponent className="w-7 h-7" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{prompt.titulo}</h3>
                                <p className="text-white text-opacity-90 text-sm mt-1">
                                  {prompt.descricao}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => openEditModal(prompt)}
                              className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all backdrop-blur-sm group-hover:scale-105"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-20 backdrop-blur-sm">
                              v{prompt.versao}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              prompt.ativo ? 'bg-green-400 bg-opacity-20 text-green-100' : 'bg-red-400 bg-opacity-20 text-red-100'
                            }`}>
                              {prompt.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Prompt Preview */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Conteúdo do Prompt
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <p className="text-sm text-gray-800 line-clamp-4 leading-relaxed">
                                {prompt.prompt}
                              </p>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{prompt.autor}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(prompt.updated_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => openEditModal(prompt)}
                            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all flex items-center justify-center gap-2 font-medium group-hover:shadow-md"
                          >
                            <Edit className="w-4 h-4" />
                            Editar Prompt
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Training Sessions Tab */}
          {activeTab === 'training' && (
            <div className="space-y-8">
              {/* Training Control Panel */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Centro de Controle de Treinamento</h3>
                    <p className="text-indigo-100 text-lg">Gerencie e monitore sessões de treinamento de modelos de IA</p>
                  </div>
                  <button
                    onClick={() => setShowTrainingModal(true)}
                    className="px-8 py-4 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all flex items-center gap-3 backdrop-blur-sm font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Sessão de Treinamento
                  </button>
                </div>
              </div>

              {/* Training Sessions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {trainingSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-gray-900 text-lg">{session.name}</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'training' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'error' ? 'bg-red-100 text-red-800' :
                        session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status === 'completed' ? 'Concluído' :
                         session.status === 'training' ? 'Treinando' :
                         session.status === 'error' ? 'Erro' :
                         session.status === 'paused' ? 'Pausado' : 'Aguardando'}
                      </span>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progresso</span>
                        <span>{session.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            session.status === 'training' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                            session.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                            'bg-gray-400'
                          }`}
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                      {session.status === 'training' && session.estimatedTimeRemaining && (
                        <p className="text-xs text-gray-500 mt-1">Tempo restante: {session.estimatedTimeRemaining}</p>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-xs text-green-600 font-medium">Precisão</p>
                        <p className="text-xl font-bold text-green-700">{session.accuracy.toFixed(1)}%</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-xl">
                        <p className="text-xs text-orange-600 font-medium">Loss</p>
                        <p className="text-xl font-bold text-orange-700">{session.loss.toFixed(3)}</p>
                      </div>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span className="font-medium">{session.modelType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dataset:</span>
                        <span className="font-medium">{session.datasetSize.toLocaleString()} amostras</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Épocas:</span>
                        <span className="font-medium">{session.currentEpoch}/{session.epochs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Iniciado:</span>
                        <span className="font-medium">{formatDate(session.startTime)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {session.status === 'idle' && (
                        <button
                          onClick={() => setShowTrainingModal(true)}
                          disabled={isTraining}
                          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Iniciar
                        </button>
                      )}
                      {session.status === 'training' && (
                        <button
                          className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 font-medium"
                        >
                          <Pause className="w-4 h-4" />
                          Pausar
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <button
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Exportar
                        </button>
                      )}
                      <button
                        className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datasets Tab */}
          {activeTab === 'datasets' && (
            <div className="space-y-8">
              {/* Dataset Upload Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload de Dataset</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Faça upload de novos dados para treinamento da IA. Formatos suportados: CSV, JSON, TXT
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowDatasetModal(true)}
                      className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-3 font-semibold shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                      Fazer Upload
                    </button>
                    <button className="px-8 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-3 font-semibold">
                      <Download className="w-5 h-5" />
                      Baixar Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Datasets List */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Datasets Disponíveis</h3>
                  <p className="text-gray-600 mt-1">Gerencie seus conjuntos de dados para treinamento</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {datasets.map((dataset) => (
                    <div key={dataset.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            dataset.status === 'ready' ? 'bg-green-100' :
                            dataset.status === 'processing' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Database className={`w-6 h-6 ${
                              dataset.status === 'ready' ? 'text-green-600' :
                              dataset.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{dataset.samples.toLocaleString()} amostras</span>
                              <span>•</span>
                              <span>{dataset.size}</span>
                              <span>•</span>
                              <span>{dataset.format}</span>
                              <span>•</span>
                              <span>{dataset.type}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Enviado em {formatDate(dataset.uploadDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            dataset.status === 'ready' ? 'bg-green-100 text-green-800' :
                            dataset.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {dataset.status === 'ready' ? 'Pronto' :
                             dataset.status === 'processing' ? 'Processando' : 'Erro'}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Precisão Média</p>
                      <p className="text-3xl font-bold">94.2%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-green-200">↑ +2.1% vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Tempo de Resposta</p>
                      <p className="text-3xl font-bold">1.2s</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-blue-200">↓ -0.3s vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Taxa de Erro</p>
                      <p className="text-3xl font-bold">0.8%</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-orange-200">↓ -0.2% vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Modelos Ativos</p>
                      <p className="text-3xl font-bold">6</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-200" />
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-purple-200">2 em treinamento</span>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Métricas de Performance por Modelo</h3>
                  <p className="text-gray-600 mt-1">Análise detalhada do desempenho de cada modelo</p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Modelo</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Tipo</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Precisão</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Recall</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">F1-Score</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Classificação v2.1', type: 'Classificação', precision: 94.2, recall: 92.8, f1: 93.5, status: 'Ativo' },
                          { name: 'Comportamento v1.8', type: 'Comportamento', precision: 89.1, recall: 91.3, f1: 90.2, status: 'Ativo' },
                          { name: 'Intenção v1.3', type: 'Intenção', precision: 87.6, recall: 88.9, f1: 88.2, status: 'Treinando' },
                          { name: 'Resposta v2.0', type: 'Geração', precision: 92.4, recall: 90.1, f1: 91.2, status: 'Ativo' },
                          { name: 'Sentimento v1.5', type: 'Análise', precision: 85.3, recall: 87.7, f1: 86.5, status: 'Pausado' }
                        ].map((model, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{model.name}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {model.type}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-green-600 font-semibold">
                                {model.precision.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-blue-600 font-semibold">
                                {model.recall.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-purple-600 font-semibold">
                                {model.f1.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                model.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                                model.status === 'Treinando' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {model.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Prompt Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPrompt(null);
          setEditedPrompt('');
        }}
        title={`Editar: ${selectedPrompt?.titulo}`}
        size="xl"
      >
        {selectedPrompt && (
          <div className="space-y-6">
            {/* Info Header */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Sobre este prompt</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedPrompt.descricao}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Version Info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="font-semibold text-gray-600">Versão Atual:</span>
                <p className="text-gray-900 text-lg font-bold">v{selectedPrompt.versao}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="font-semibold text-gray-600">Último Editor:</span>
                <p className="text-gray-900 font-medium">{selectedPrompt.autor}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="font-semibold text-gray-600">Última Edição:</span>
                <p className="text-gray-900 font-medium">{formatDate(selectedPrompt.updated_at)}</p>
              </div>
            </div>

            {/* Prompt Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Conteúdo do Prompt
              </label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical font-mono text-sm leading-relaxed"
                placeholder="Digite o prompt que será usado pela IA para esta decisão..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Este prompt será enviado para modelos como GPT-4 para executar a função de moderação.
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Alterações neste prompt afetarão imediatamente o comportamento da IA para moderação. 
                    Teste cuidadosamente antes de salvar em produção.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPrompt(null);
                  setEditedPrompt('');
                }}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={isSaving || editedPrompt.trim() === ''}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Training Modal */}
      <Modal
        isOpen={showTrainingModal}
        onClose={() => {
          setShowTrainingModal(false);
          setTrainingName('');
          setSelectedDataset('');
        }}
        title="Nova Sessão de Treinamento"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-900">Configurar Treinamento</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  Configure os parâmetros para iniciar uma nova sessão de treinamento de modelo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Sessão
              </label>
              <input
                type="text"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                placeholder="Ex: Modelo de Classificação v3.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dataset
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um dataset...</option>
                {datasets.filter(d => d.status === 'ready').map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.samples.toLocaleString()} amostras)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowTrainingModal(false);
                setTrainingName('');
                setSelectedDataset('');
              }}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={startTraining}
              disabled={!trainingName.trim() || !selectedDataset || isTraining}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Treinamento
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Dataset Upload Modal */}
      <Modal
        isOpen={showDatasetModal}
        onClose={() => setShowDatasetModal(false)}
        title="Upload de Dataset"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Fazer Upload de Dados</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Envie arquivos CSV, JSON ou TXT com dados para treinamento da IA
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Arraste arquivos aqui</h4>
            <p className="text-gray-600 mb-4">ou clique para selecionar</p>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv,.json,.txt"
              multiple
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2 font-medium"
            >
              <Upload className="w-4 h-4" />
              Selecionar Arquivos
            </label>
          </div>

          {isUploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Enviando...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDatasetModal(false)}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TreinamentoIATab;
