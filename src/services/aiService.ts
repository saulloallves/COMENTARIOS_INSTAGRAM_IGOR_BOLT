// AI Service for GPT-4.1 Integration with RAG
import { supabase } from '../lib/supabase';

export interface AIContext {
  unitId: string;
  currentPhase: string;
  activeDocumentations: string[];
  recentInteractions: any[];
  behaviorGroup: any;
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  suggestedActions: string[];
  classification?: 'approved' | 'rejected' | 'pending';
  justification?: string;
}

export interface InstagramComment {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  unitId: string;
}

export interface CommentClassification {
  classification: 'approved' | 'rejected' | 'pending';
  confidence: number;
  justification: string;
  suggestedResponse?: string;
  shouldRespond: boolean;
  shouldDelete: boolean;
}

class AIService {
  private baseUrl = 'https://api.openai.com/v1'; // Replace with Dify/Ollama endpoint
  private apiKey = import.meta.env.VITE_AI_API_KEY;

  // RAG-based context retrieval
  async getRAGContext(unitId: string, query: string): Promise<AIContext> {
    try {
      // First, get the unit independently
      const { data: unit } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', unitId)
        .maybeSingle();

      if (!unit) throw new Error('Unit not found');

      // Then get the phase information if fase_atual_id exists
      let currentPhase = 'unknown';
      let behaviorGroup = null;
      
      if (unit.fase_atual_id) {
        const { data: phase } = await supabase
          .from('fases')
          .select('nome, id')
          .eq('id', unit.fase_atual_id)
          .maybeSingle();
        
        if (phase) {
          currentPhase = phase.nome;
          
          // Get behavior group for this phase
          const { data: behaviorGroups } = await supabase
            .from('grupos_comportamento')
            .select('*')
            .eq('fase_id', phase.id)
            .limit(1);
          
          if (behaviorGroups && behaviorGroups.length > 0) {
            behaviorGroup = behaviorGroups[0];
          }
        }
      }

      // Get active documentations for current phase (if phase exists)
      let activeDocumentations = null;
      if (unit.fase_atual_id && unit.fase_atual_id.trim() !== '') {
        const { data } = await supabase
          .from('documentacoes_por_fase')
          .select(`
            documentacoes!inner(titulo, conteudo, tipo)
          `)
          .eq('fase_id', unit.fase_atual_id);
        activeDocumentations = data;
      }

      // Get recent interactions (last 10)
      const { data: recentInteractions } = await supabase
        .from('historico_interacoes')
        .select('*')
        .eq('unidade_id', unitId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        unitId,
        currentPhase,
        activeDocumentations: activeDocumentations?.map(doc => doc.documentacoes.conteudo) || [],
        recentInteractions: recentInteractions || [],
        behaviorGroup
      };
    } catch (error) {
      console.error('Error getting RAG context:', error);
      throw error;
    }
  }

  // Generate structured prompt based on operational phase
  private generateStructuredPrompt(context: AIContext, query: string): string {
    const phaseInstructions = {
      'interacao': 'Você está na fase de interação inicial. Seja acolhedor, colete informações básicas e não revele preços.',
      'pre_compras': 'Você está na fase pré-compras. Pode mostrar produtos e preços, mas não finalize vendas.',
      'semana_1': 'Cliente está na primeira semana. Foque em onboarding e primeiros passos.',
      'semana_2': 'Cliente está na segunda semana. Ajude com dúvidas intermediárias.',
      'semana_3': 'Cliente está na terceira semana. Suporte avançado e otimizações.',
      'semana_4': 'Cliente está na quarta semana. Preparação para autonomia.',
      'pos_30_dias': 'Cliente pós 30 dias. Foque em recursos avançados e expansão.',
      'fidelizacao': 'Cliente fidelizado. Ofereça benefícios exclusivos e upsells.'
    };

    const behaviorRestrictions = context.behaviorGroup?.escopo?.restricoes || [];
    const allowedQuestions = context.behaviorGroup?.escopo?.perguntas_permitidas || [];

    return `
CONTEXTO OPERACIONAL:
- Unidade: ${context.unitId}
- Fase Atual: ${context.currentPhase}
- Instruções da Fase: ${phaseInstructions[context.currentPhase as keyof typeof phaseInstructions] || 'Fase não reconhecida'}

DOCUMENTAÇÕES ATIVAS:
${context.activeDocumentations.slice(0, 3).map((doc, i) => `${i + 1}. ${doc.substring(0, 200)}...`).join('\n')}

RESTRIÇÕES:
${behaviorRestrictions.map((r: string) => `- ${r}`).join('\n')}

PERGUNTAS PERMITIDAS:
${allowedQuestions.map((q: string) => `- ${q}`).join('\n')}

INTERAÇÕES RECENTES:
${context.recentInteractions.slice(0, 3).map(i => `- ${i.pergunta}: ${i.resposta.substring(0, 100)}...`).join('\n')}

PERGUNTA DO USUÁRIO: ${query}

INSTRUÇÕES:
1. Responda APENAS dentro do escopo permitido para esta fase
2. Use as documentações ativas como fonte principal
3. Considere o histórico de interações para personalizar a resposta
4. Sugira ações específicas quando apropriado
5. Se a pergunta estiver fora do escopo, explique educadamente as limitações da fase atual

FORMATO DE RESPOSTA:
{
  "content": "sua resposta aqui",
  "confidence": 0.85,
  "sources": ["fonte1", "fonte2"],
  "suggestedActions": ["ação1", "ação2"]
}
`;
  }

  // Main AI response generation
  async generateResponse(unitId: string, query: string): Promise<AIResponse> {
    try {
      const context = await this.getRAGContext(unitId, query);
      const prompt = this.generateStructuredPrompt(context, query);

      // Simulate AI API call (replace with actual Dify/Ollama integration)
      const response = await this.callAIAPI(prompt);
      
      // Log interaction to database
      await supabase.from('historico_interacoes').insert({
        unidade_id: unitId,
        usuario_id: 'system',
        pergunta: query,
        resposta: response.content,
        fase_id: context.behaviorGroup.fase_id,
        sucesso: true,
        tempo_resposta: 1200,
        confianca: response.confidence,
        fontes: response.sources
      });

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  // Instagram comment classification
  async classifyInstagramComment(comment: InstagramComment): Promise<CommentClassification> {
    try {
      const context = await this.getRAGContext(comment.unitId, comment.content);
      
      const classificationPrompt = `
CONTEXTO DA UNIDADE:
- Fase: ${context.currentPhase}
- Comportamento: ${context.behaviorGroup?.descricao}

COMENTÁRIO DO INSTAGRAM:
Autor: ${comment.author}
Conteúdo: "${comment.content}"

INSTRUÇÕES DE CLASSIFICAÇÃO:
1. APROVADO: Comentários positivos, neutros ou que agregam valor
2. REPROVADO: Comentários negativos, spam, ofensivos ou inadequados
3. PENDENTE: Comentários que precisam de análise humana

Analise o comentário e classifique considerando:
- Tom e sentimento
- Relevância para o negócio
- Potencial impacto na marca
- Contexto da fase operacional atual

FORMATO DE RESPOSTA:
{
  "classification": "approved|rejected|pending",
  "confidence": 0.85,
  "justification": "explicação detalhada da classificação",
  "suggestedResponse": "resposta sugerida se aplicável",
  "shouldRespond": true|false,
  "shouldDelete": false|true
}
`;

      const result = await this.callAIAPI(classificationPrompt);
      
      // Log classification to database
      // Note: Classification is handled in the component, not here

      return {
        classification: result.classification,
        confidence: result.confidence,
        justification: result.justification,
        suggestedResponse: result.suggestedResponse
      };
    } catch (error) {
      console.error('Error classifying Instagram comment:', error);
      throw error;
    }
  }

  // Generate unit recommendations
  async generateUnitRecommendations(unitId: string): Promise<string[]> {
    try {
      const context = await this.getRAGContext(unitId, 'recommendations');
      
      const recommendationPrompt = `
ANÁLISE DA UNIDADE:
- ID: ${unitId}
- Fase: ${context.currentPhase}
- Interações Recentes: ${context.recentInteractions.length}

DADOS PARA ANÁLISE:
${JSON.stringify(context.recentInteractions.slice(0, 5), null, 2)}

INSTRUÇÕES:
Com base na fase atual, interações recentes e comportamento da unidade, gere 3-5 recomendações específicas para otimizar a operação.

Considere:
1. Oportunidades de melhoria na fase atual
2. Padrões nas interações que indicam necessidades
3. Próximos passos recomendados
4. Alertas de risco se aplicável

FORMATO: Array de strings com recomendações práticas e acionáveis.
`;

      const result = await this.callAIAPI(recommendationPrompt);
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Simulate AI API call (replace with actual implementation)
  public async callAIAPI(prompt: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sugestões de resposta para comentários do Instagram
    if (prompt.includes('Sugira 3 respostas possíveis para o seguinte comentário')) {
      return {
        suggestions: [
          'Obrigado pelo seu comentário! Estamos à disposição para ajudar.',
          'Agradecemos seu contato! Se precisar de algo, conte conosco.',
          'Sua mensagem é muito importante para nós. Em breve retornaremos!'
        ]
      };
    }

    if (prompt.includes('COMENTÁRIO DO INSTAGRAM')) {
      return {
        classification: Math.random() > 0.7 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected',
        confidence: 0.85 + Math.random() * 0.1,
        justification: 'Comentário analisado com base no tom, relevância e impacto potencial na marca.',
        suggestedResponse: 'Obrigado pelo seu comentário! Ficamos felizes em ajudar.',
        shouldRespond: Math.random() > 0.3,
        shouldDelete: Math.random() > 0.8
      };
    }
    
    if (prompt.includes('recommendations')) {
      return {
        recommendations: [
          'Implementar automação de respostas para perguntas frequentes',
          'Revisar documentação da fase atual para melhor clareza',
          'Configurar alertas para interações de alto risco',
          'Otimizar tempo de resposta das consultas'
        ]
      };
    }
    
    return {
      content: 'Esta é uma resposta simulada da IA baseada no contexto fornecido e nas regras da fase operacional atual.',
      confidence: 0.88,
      sources: ['Documentação Ativa', 'Histórico de Interações', 'Regras da Fase'],
      suggestedActions: ['Acompanhar evolução', 'Documentar interação', 'Verificar próximos passos']
    };
  }
}

export const aiService = new AIService();
