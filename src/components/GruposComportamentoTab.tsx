import React, { useState } from 'react';
import { Users, Edit, Settings, RefreshCw } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';
import MultiSelect from './MultiSelect';

const GruposComportamentoTab: React.FC = () => {
  const { behaviorGroups, phases, loading, updateBehaviorGroup } = useSupabaseData();
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    fase_id: '',
    permitido_responder: true,
    ativo: true,
    resposta_padrao: '',
    escopo: {
      restricoes: [] as string[],
    }
  });

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

  const getPhaseByGroupId = (groupId: string) => {
    const group = behaviorGroups.find(g => g.id === groupId);
    if (!group) return null;
    return phases.find(p => p.id === group.fase_id);
  };

  const extractPermissions = (escopo: any) => {
    if (!escopo) return [];
    return escopo.permissoes || [];
  };

  const openConfigModal = (group: any) => {
    setSelectedGroup(group);
    setFormData({
      descricao: group.descricao,
      fase_id: group.fase_id,
      permitido_responder: group.permitido_responder,
      ativo: group.ativo || true,
      escopo: {
        restricoes: group.escopo?.restricoes || [],
      }
    });
    setShowConfigModal(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateBehaviorGroup(selectedGroup.id, {
        descricao: formData.descricao,
        fase_id: formData.fase_id,
        permitido_responder: formData.permitido_responder,
        ativo: formData.ativo,
        escopo: formData.escopo
      });
      
      if (result.success) {
        setShowConfigModal(false);
        setSelectedGroup(null);
      } else {
        alert('Erro ao atualizar grupo: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating behavior group:', error);
      alert('Erro ao atualizar grupo.');
    } finally {
      setIsUpdating(false);
    }
  };

  const restrictionOptions = [
    { id: 'nao-revelar-precos', label: 'Não revelar preços', description: 'Não informar valores' },
    { id: 'nao-fazer-promessas', label: 'Não fazer promessas', description: 'Evitar garantias' },
    { id: 'nao-finalizar-vendas', label: 'Não finalizar vendas', description: 'Não processar pagamentos' },
    { id: 'nao-dar-suporte-tecnico', label: 'Não dar suporte técnico', description: 'Evitar questões técnicas' },
    { id: 'nao-aceitar-reclamacoes', label: 'Não aceitar reclamações', description: 'Direcionar para SAC' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Grupos de Comportamento</h2>
        <p className="text-gray-600 mt-1">Configure permissões e restrições da IA por fase operacional</p>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Matriz de Permissões</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restrições
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resposta Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {behaviorGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum grupo de comportamento encontrado
                  </td>
                </tr>
              ) : (
                behaviorGroups.map((group) => {
                  const phase = getPhaseByGroupId(group.id);
                  const restrictions = group.escopo?.restricoes || [];
                  
                  return (
                    <tr key={group.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {group.descricao}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {phase ? getPhaseDisplayName(phase.nome) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            group.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {group.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            group.permitido_responder ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {group.permitido_responder ? 'Pode Responder' : 'Não Responde'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {restrictions.map((restriction: string) => (
                            <span
                              key={restriction}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {restrictionOptions.find(r => r.id === restriction)?.label || restriction}
                            </span>
                          ))}
                          {restrictions.length === 0 && (
                            <span className="text-sm text-gray-500">Nenhuma restrição</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openConfigModal(group)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={`Configurar ${selectedGroup?.descricao || 'Grupo'}`}
        size="xl"
      >
        {selectedGroup && (
          <form onSubmit={handleUpdateGroup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Grupo
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fase do Grupo
              </label>
              <select
                value={formData.fase_id}
                onChange={(e) => setFormData(prev => ({ ...prev, fase_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Selecione uma fase...</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {getPhaseDisplayName(phase.nome)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="permitido-responder"
                checked={formData.permitido_responder}
                onChange={(e) => setFormData(prev => ({ ...prev, permitido_responder: e.target.checked }))}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="permitido-responder" className="ml-2 block text-sm text-gray-900">
                Permitido responder consultas
              </label>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                  Grupo ativo
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resposta Padrão
              </label>
              <textarea
                value={formData.resposta_padrao}
                onChange={(e) => setFormData(prev => ({ ...prev, resposta_padrao: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 resize-vertical"
                placeholder="Digite a resposta padrão que será usada pela IA para este grupo..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta resposta será usada como base pela IA quando não houver uma resposta específica disponível.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrições
              </label>
              <MultiSelect
                options={restrictionOptions}
                selectedValues={formData.escopo.restricoes}
                onChange={(values) => setFormData(prev => ({
                  ...prev,
                  escopo: { ...prev.escopo, restricoes: values }
                }))}
                placeholder="Selecione as restrições..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                Salvar Configurações
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default GruposComportamentoTab;
