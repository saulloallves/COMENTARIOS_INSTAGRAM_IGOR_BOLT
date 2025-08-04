import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  X, 
  RefreshCw, 
  Users,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Store,
  Play,
  Pause,
  Lock,
  Target,
  Clock,
  CheckCircle,
  Edit
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';

interface PhaseConfig {
  id: string;
  name: string;
  displayName: string;
  order: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  objectives: string[];
  allowedActions: string[];
  restrictions: string[];
  duration: string;
  additionalNotes?: string;
  nextPhase?: string;
}

const OPERATIONAL_PHASES: PhaseConfig[] = [
  {
    id: 'interacao',
    name: 'interacao',
    displayName: 'Interação',
    order: 1,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Fase inicial de atração e engajamento. Foco em construir audiência e gerar expectativa.',
    objectives: [
      'Atrair seguidores qualificados',
      'Gerar expectativa para abertura',
      'Construir awareness da marca',
      'Educar sobre o conceito brechó'
    ],
    allowedActions: [
      'Publicar conteúdo educativo',
      'Responder dúvidas gerais',
      'Compartilhar conceito da marca',
      'Engajar com comunidade'
    ],
    restrictions: [
      'Não revelar preços',
      'Não aceitar desapegos',
      'Não marcar inauguração',
      'Não fazer promessas de data'
    ],
    duration: 'Indefinido - até decisão de avançar',
    additionalNotes: 'Fase fundamental para construir base sólida de seguidores interessados no conceito brechó.',
    nextPhase: 'pre_compras'
  },
  {
    id: 'pre_compras',
    name: 'pre_compras',
    displayName: 'Pré-Compras',
    order: 2,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    description: 'Preparação para início das compras. Comunicação sobre cronograma e expectativas.',
    objectives: [
      'Comunicar cronograma de abertura',
      'Preparar comunidade para compras',
      'Definir logística de recebimento',
      'Criar expectativa controlada'
    ],
    allowedActions: [
      'Anunciar cronograma geral',
      'Explicar processo de compras',
      'Divulgar critérios de seleção',
      'Orientar sobre preparação'
    ],
    restrictions: [
      'Não aceitar desapegos ainda',
      'Não confirmar data exata',
      'Não revelar preços finais',
      'Não garantir aceitação'
    ],
    duration: '1-2 semanas antes das compras',
    additionalNotes: 'Comunicação clara sobre cronograma é essencial para preparar a comunidade adequadamente.',
    nextPhase: 'compras'
  },
  {
    id: 'compras',
    name: 'compras',
    displayName: 'Compras',
    order: 3,
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Período ativo de recebimento de desapegos. Foco em aquisição de estoque.',
    objectives: [
      'Receber desapegos de qualidade',
      'Avaliar e precificar itens',
      'Construir estoque diversificado',
      'Manter qualidade do acervo'
    ],
    allowedActions: [
      'Aceitar agendamentos',
      'Avaliar peças recebidas',
      'Comunicar critérios',
      'Orientar sobre qualidade'
    ],
    restrictions: [
      'Não revelar preços de venda',
      'Não garantir aceitação',
      'Não confirmar data inauguração',
      'Não vender antecipadamente'
    ],
    duration: '2-4 semanas de compras ativas',
    additionalNotes: 'Manter critérios de qualidade rigorosos para garantir estoque atrativo para os clientes.',
    nextPhase: 'pre_inauguracao_semana_1'
  },
  {
    id: 'pre_inauguracao_semana_1',
    name: 'pre_inauguracao_semana_1',
    displayName: 'Pré-Inauguração - Semana 1',
    order: 4,
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    description: 'Última semana de compras com urgência. Finalização do estoque.',
    objectives: [
      'Finalizar compras com urgência',
      'Completar estoque necessário',
      'Criar senso de urgência',
      'Preparar encerramento'
    ],
    allowedActions: [
      'Comunicar urgência',
      'Acelerar agendamentos',
      'Priorizar peças estratégicas',
      'Confirmar últimas compras'
    ],
    restrictions: [
      'Não aceitar após prazo',
      'Não revelar data exata ainda',
      'Não vender antecipadamente',
      'Não garantir nova oportunidade'
    ],
    duration: '1 semana - última de compras',
    additionalNotes: 'Criar senso real de urgência sem gerar ansiedade excessiva na comunidade.',
    nextPhase: 'pre_inauguracao_semana_2'
  },
  {
    id: 'pre_inauguracao_semana_2',
    name: 'pre_inauguracao_semana_2',
    displayName: 'Pré-Inauguração - Semana 2',
    order: 5,
    icon: Calendar,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
    description: 'Compras encerradas. Preparação final e comunicação da data de inauguração.',
    objectives: [
      'Organizar e precificar estoque',
      'Preparar espaço físico',
      'Comunicar data de inauguração',
      'Gerar expectativa final'
    ],
    allowedActions: [
      'Anunciar data inauguração',
      'Mostrar preparação da loja',
      'Criar expectativa final',
      'Divulgar evento de abertura'
    ],
    restrictions: [
      'Não aceitar mais desapegos',
      'Não vender antes da inauguração',
      'Não alterar data anunciada',
      'Não revelar estoque completo'
    ],
    duration: '1 semana - preparação final',
    additionalNotes: 'Momento crucial para gerar expectativa máxima e garantir presença na inauguração.',
    nextPhase: 'inauguracao'
  },
  {
    id: 'inauguracao',
    name: 'inauguracao',
    displayName: 'Inauguração',
    order: 6,
    icon: Store,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500',
    description: 'Dia da inauguração oficial. Evento de abertura e primeiras vendas.',
    objectives: [
      'Realizar evento de inauguração',
      'Gerar primeiras vendas',
      'Criar buzz e visibilidade',
      'Estabelecer presença local'
    ],
    allowedActions: [
      'Vender produtos',
      'Realizar evento',
      'Atender clientes',
      'Documentar inauguração'
    ],
    restrictions: [
      'Não aceitar desapegos no dia',
      'Não alterar preços drasticamente',
      'Não prometer novos ciclos',
      'Não sobrecarregar equipe'
    ],
    duration: '1-3 dias - evento de abertura',
    additionalNotes: 'Foco total na experiência do cliente e criação de buzz positivo para a marca.',
    nextPhase: 'operacao'
  },
  {
    id: 'operacao',
    name: 'operacao',
    displayName: 'Operação',
    order: 7,
    icon: Play,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    description: 'Operação normal da loja. Vendas regulares e atendimento ao cliente.',
    objectives: [
      'Manter vendas consistentes',
      'Atender clientes regularmente',
      'Gerenciar estoque',
      'Planejar próximo ciclo'
    ],
    allowedActions: [
      'Vender produtos',
      'Atender clientes',
      'Gerenciar estoque',
      'Planejar futuro'
    ],
    restrictions: [
      'Não aceitar desapegos (ciclo fechado)',
      'Não prometer datas futuras',
      'Não alterar conceito',
      'Não sobrecarregar operação'
    ],
    duration: 'Até esgotamento do estoque',
    additionalNotes: 'Manter qualidade do atendimento e começar planejamento do próximo ciclo.',
    nextPhase: 'loja_fechada_temporariamente'
  },
  {
    id: 'loja_fechada_temporariamente',
    name: 'loja_fechada_temporariamente',
    displayName: 'Loja Fechada Temporariamente',
    order: 8,
    icon: Pause,
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    description: 'Fechamento temporário para manutenção, reforma ou preparação de novo ciclo.',
    objectives: [
      'Comunicar fechamento temporário',
      'Manter engajamento da audiência',
      'Preparar próximo ciclo',
      'Realizar manutenções necessárias'
    ],
    allowedActions: [
      'Comunicar status',
      'Manter presença digital',
      'Planejar reabertura',
      'Realizar manutenções'
    ],
    restrictions: [
      'Não vender produtos',
      'Não aceitar desapegos',
      'Não prometer datas sem certeza',
      'Não abandonar comunicação'
    ],
    duration: 'Variável - conforme necessidade',
    additionalNotes: 'Manter comunicação ativa para não perder conexão com a comunidade.',
    nextPhase: 'interacao'
  },
  {
    id: 'loja_fechada_definitivamente',
    name: 'loja_fechada_definitivamente',
    displayName: 'Loja Fechada Definitivamente',
    order: 9,
    icon: Lock,
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'Encerramento definitivo das operações da unidade.',
    objectives: [
      'Comunicar encerramento',
      'Finalizar pendências',
      'Agradecer comunidade',
      'Encerrar operações'
    ],
    allowedActions: [
      'Comunicar encerramento',
      'Liquidar estoque restante',
      'Finalizar relacionamentos',
      'Documentar encerramento'
    ],
    restrictions: [
      'Não aceitar novos desapegos',
      'Não criar falsas expectativas',
      'Não abandonar responsabilidades',
      'Não deixar pendências'
    ],
    duration: 'Definitivo',
    additionalNotes: 'Encerramento respeitoso e transparente, mantendo boa reputação da marca.',
    nextPhase: undefined
  }
];

const FasesTab: React.FC = () => {
  const { phases: dbPhases, loading, updatePhase, refetch } = useSupabaseData();
  const [selectedPhase, setSelectedPhase] = useState<PhaseConfig | null>(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhase, setEditedPhase] = useState<PhaseConfig | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [phases, setPhases] = useState<PhaseConfig[]>([]);

  // Convert database phases to PhaseConfig format
  useEffect(() => {
    if (dbPhases.length > 0) {
      const convertedPhases = dbPhases.map(dbPhase => {
        const staticConfig = OPERATIONAL_PHASES.find(p => p.name === dbPhase.nome);
        return {
          id: dbPhase.id,
          name: dbPhase.nome,
          displayName: staticConfig?.displayName || getPhaseDisplayName(dbPhase.nome),
          order: dbPhase.ordem,
          icon: staticConfig?.icon || Users,
          color: staticConfig?.color || 'text-gray-600',
          bgColor: staticConfig?.bgColor || 'bg-gray-500',
          description: dbPhase.descricao_completa || staticConfig?.description || 'Descrição não disponível',
          objectives: staticConfig?.objectives || [],
          allowedActions: staticConfig?.allowedActions || [],
          restrictions: staticConfig?.restrictions || [],
          duration: `${dbPhase.duracao_minima_dias || 0}-${dbPhase.duracao_maxima_dias || 0} dias`,
          additionalNotes: dbPhase.observacoes || staticConfig?.additionalNotes,
          nextPhase: dbPhase.proxima_fase_id || undefined
        };
      }).sort((a, b) => a.order - b.order);
      setPhases(convertedPhases);
      
      // Update selected phase if it's currently open and data changed
      if (selectedPhase) {
        const updatedSelectedPhase = convertedPhases.find(p => p.id === selectedPhase.id);
        if (updatedSelectedPhase) {
          setSelectedPhase(updatedSelectedPhase);
          if (!isEditing) {
            setEditedPhase(updatedSelectedPhase);
          }
        }
      }
    } else {
      // Fallback to static data if no database data
      setPhases(OPERATIONAL_PHASES);
    }
  }, [dbPhases, selectedPhase?.id, isEditing]);

  const getPhaseDisplayName = (phaseName: string) => {
    const names: Record<string, string> = {
      'interacao': 'Interação',
      'pre_compras': 'Pré-Compras',
      'compras': 'Compras',
      'pre_inauguracao_semana_1': 'Pré-Inauguração - Semana 1',
      'pre_inauguracao_semana_2': 'Pré-Inauguração - Semana 2',
      'inauguracao': 'Inauguração',
      'operacao': 'Operação',
      'loja_fechada_temporariamente': 'Loja Fechada Temporariamente',
      'loja_fechada_definitivamente': 'Loja Fechada Definitivamente'
    };
    return names[phaseName] || phaseName;
  };

  const openPhaseDetails = (phaseName: string) => {
    const config = phases.find(p => p.name === phaseName);
    if (config) {
      setSelectedPhase(config);
      setEditedPhase({ ...config });
      setIsEditing(false);
      setShowPhaseModal(true);
    }
  };

  const handleSavePhase = async () => {
    if (!editedPhase) return;
    
    setIsUpdating(true);
    try {
      // Update in database
      const durationParts = editedPhase.duration.match(/(\d+)-(\d+)/);
      const minDays = durationParts ? parseInt(durationParts[1]) : null;
      const maxDays = durationParts ? parseInt(durationParts[2]) : null;
      
      const result = await updatePhase(editedPhase.id, {
        descricao_completa: editedPhase.description,
        duracao_minima_dias: minDays,
        duracao_maxima_dias: maxDays,
        observacoes: editedPhase.additionalNotes || null
      });
      
      if (result.success) {
        setIsEditing(false);
        // Data will be automatically updated via real-time subscription
      } else {
        alert('Erro ao salvar fase: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving phase:', error);
      alert('Erro ao salvar fase');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPhase(selectedPhase ? { ...selectedPhase } : null);
    setIsEditing(false);
  };

  // Force refresh data
  const handleRefreshData = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  const addObjective = () => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        objectives: [...editedPhase.objectives, '']
      });
    }
  };

  const removeObjective = (index: number) => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        objectives: editedPhase.objectives.filter((_, i) => i !== index)
      });
    }
  };

  const updateObjective = (index: number, value: string) => {
    if (editedPhase) {
      const newObjectives = [...editedPhase.objectives];
      newObjectives[index] = value;
      setEditedPhase({
        ...editedPhase,
        objectives: newObjectives
      });
    }
  };

  const addAllowedAction = () => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        allowedActions: [...editedPhase.allowedActions, '']
      });
    }
  };

  const removeAllowedAction = (index: number) => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        allowedActions: editedPhase.allowedActions.filter((_, i) => i !== index)
      });
    }
  };

  const updateAllowedAction = (index: number, value: string) => {
    if (editedPhase) {
      const newActions = [...editedPhase.allowedActions];
      newActions[index] = value;
      setEditedPhase({
        ...editedPhase,
        allowedActions: newActions
      });
    }
  };

  const addRestriction = () => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        restrictions: [...editedPhase.restrictions, '']
      });
    }
  };

  const removeRestriction = (index: number) => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        restrictions: editedPhase.restrictions.filter((_, i) => i !== index)
      });
    }
  };

  const updateRestriction = (index: number, value: string) => {
    if (editedPhase) {
      const newRestrictions = [...editedPhase.restrictions];
      newRestrictions[index] = value;
      setEditedPhase({
        ...editedPhase,
        restrictions: newRestrictions
      });
    }
  };

  const addKeyMetric = () => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        keyMetrics: [...editedPhase.keyMetrics, '']
      });
    }
  };

  const removeKeyMetric = (index: number) => {
    if (editedPhase) {
      setEditedPhase({
        ...editedPhase,
        keyMetrics: editedPhase.keyMetrics.filter((_, i) => i !== index)
      });
    }
  };

  const updateKeyMetric = (index: number, value: string) => {
    if (editedPhase) {
      const newMetrics = [...editedPhase.keyMetrics];
      newMetrics[index] = value;
      setEditedPhase({
        ...editedPhase,
        keyMetrics: newMetrics
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando fases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fases Operacionais - Cresci e Perdi</h2>
          <p className="text-gray-600 mt-2">
            Ciclo completo de operação das unidades: da interação inicial ao fechamento
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {phases.length > 0 
              ? `${phases.length} fases carregadas do banco de dados • Sincronização em tempo real ativa` 
              : 'Nenhuma fase encontrada'
            }
          </p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Operational Phases Flow */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Fluxo das Fases Operacionais</h3>
          <p className="text-gray-600">
            Sequência definida para o ciclo de vida completo de cada unidade
          </p>
        </div>

        <div className="p-6">
          {phases.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma fase encontrada</h3>
              <p className="text-gray-500 mb-4">
                Execute as migrações do banco de dados para criar as fases operacionais
              </p>
              <button
                onClick={handleRefreshData}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {phases.map((phaseConfig, index) => {
              const Icon = phaseConfig.icon;
              const isLast = index === phases.length - 1;
              
              return (
                <div key={phaseConfig.id} className="relative">
                  <div 
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-pink-300 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => openPhaseDetails(phaseConfig.name)}
                  >
                    {/* Phase Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 ${phaseConfig.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-500">FASE {phaseConfig.order}</span>
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{phaseConfig.displayName}</h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {phaseConfig.description}
                    </p>

                    {/* Key Info */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-bold text-gray-700 mb-2">DURAÇÃO</h5>
                        <p className="text-xs text-gray-600">{phaseConfig.duration}</p>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-700 mb-2">OBJETIVOS PRINCIPAIS</h5>
                        <ul className="space-y-1">
                          {phaseConfig.objectives.slice(0, 2).map((objective, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">•</span>
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {phaseConfig.additionalNotes && (
                        <div>
                          <h5 className="text-xs font-bold text-gray-700 mb-2">OBSERVAÇÕES</h5>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {phaseConfig.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Next Phase Arrow */}
                    {!isLast && (
                      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">→</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Phase Details Modal */}
      <Modal
        isOpen={showPhaseModal}
        onClose={() => {
          setShowPhaseModal(false);
          setIsEditing(false);
          setEditedPhase(null);
        }}
        title={
          isEditing 
            ? `Editando: ${editedPhase?.displayName || 'Fase'}` 
            : `Fase ${selectedPhase?.order}: ${selectedPhase?.displayName || 'Detalhes da Fase'}`
        }
        size="xl"
      >
        {(selectedPhase || editedPhase) && (
          <div className="space-y-6">
            {/* Edit Toggle */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {isEditing ? 'Modo de edição ativo' : 'Visualizando fase'}
                </span>
                {isUpdating && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Salvando...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePhase}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {isUpdating ? 'Salvando...' : 'Salvar'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Phase Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className={`w-16 h-16 ${(isEditing ? editedPhase : selectedPhase)?.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                {(isEditing ? editedPhase : selectedPhase)?.icon && (() => {
                  const IconComponent = (isEditing ? editedPhase : selectedPhase)?.icon;
                  return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null;
                })()}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Fase
                    </label>
                    <input
                      type="text"
                      value={editedPhase?.displayName || ''}
                      onChange={(e) => setEditedPhase(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={editedPhase?.description || ''}
                      onChange={(e) => setEditedPhase(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração
                    </label>
                    <input
                      type="text"
                      value={editedPhase?.duration || ''}
                      onChange={(e) => setEditedPhase(prev => prev ? { ...prev, duration: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-2">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPhase?.displayName}</h3>
                </div>
              )}
              
              {!isEditing && (
                <>
                  <p className="text-gray-600 mt-1">{selectedPhase?.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Duração: {selectedPhase?.duration}
                  </span>
                  {selectedPhase?.nextPhase && (
                    <span className="text-sm font-medium text-pink-600">
                      → Próxima: {phases.find(p => p.name === selectedPhase.nextPhase)?.displayName}
                    </span>
                  )}
                  </div>
                </>
              )}
            </div>

            {/* Phase Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Objectives */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Objetivos Principais
                  {isEditing && (
                    <button
                      onClick={addObjective}
                      className="ml-auto px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      + Adicionar
                    </button>
                  )}
                </h4>
                {isEditing ? (
                  <div className="space-y-2">
                    {editedPhase?.objectives.map((objective, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => updateObjective(i, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="Digite o objetivo..."
                        />
                        <button
                          onClick={() => removeObjective(i)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedPhase?.objectives.map((objective, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Allowed Actions */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Ações Permitidas
                  {isEditing && (
                    <button
                      onClick={addAllowedAction}
                      className="ml-auto px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      + Adicionar
                    </button>
                  )}
                </h4>
                {isEditing ? (
                  <div className="space-y-2">
                    {editedPhase?.allowedActions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateAllowedAction(i, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Digite a ação permitida..."
                        />
                        <button
                          onClick={() => removeAllowedAction(i)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedPhase?.allowedActions.map((action, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Restrictions */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Restrições
                  {isEditing && (
                    <button
                      onClick={addRestriction}
                      className="ml-auto px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      + Adicionar
                    </button>
                  )}
                </h4>
                {isEditing ? (
                  <div className="space-y-2">
                    {editedPhase?.restrictions.map((restriction, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={restriction}
                          onChange={(e) => updateRestriction(i, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-red-300 rounded focus:ring-1 focus:ring-red-500"
                          placeholder="Digite a restrição..."
                        />
                        <button
                          onClick={() => removeRestriction(i)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedPhase?.restrictions.map((restriction, i) => (
                      <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        {restriction}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Observações Adicionais
              </h4>
              {isEditing ? (
                <textarea
                  value={editedPhase?.additionalNotes || ''}
                  onChange={(e) => setEditedPhase(prev => prev ? { ...prev, additionalNotes: e.target.value } : null)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 resize-vertical"
                  placeholder="Digite observações, instruções especiais ou detalhes importantes sobre esta fase..."
                />
              ) : (
                <div className="text-sm text-gray-700">
                  {selectedPhase?.additionalNotes ? (
                    <p className="whitespace-pre-wrap">{selectedPhase.additionalNotes}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma observação adicional</p>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            {!isEditing && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowPhaseModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FasesTab;
