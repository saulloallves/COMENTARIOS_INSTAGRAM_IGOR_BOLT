import React, { useState } from 'react';
import { Brain, MessageSquare, Send, RefreshCw, Zap } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { usePhaseManager } from '../hooks/usePhaseManager';

const IAAssistenteTab: React.FC = () => {
  const { units, phases, loading } = useSupabaseData();
  const { getBehaviorGroupForPhase, getUnitBehaviorConfig } = usePhaseManager();
  
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const clearTestResults = () => {
    setTestResults([]);
  };

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

  const sendTestToWebhook = async (unitId: string, query: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) throw new Error('Unidade não encontrada');

    const currentPhase = phases.find(p => p.id === unit.fase_atual_id);
    
    const payload = {
      unidade_id: unitId,
      unidade_nome: unit.nome,
      unidade_codigo: unit.codigo,
      fase_atual: currentPhase?.nome || 'unknown',
      pergunta: query,
      timestamp: new Date().toISOString()
    };

    const response = await fetch('https://autowebhook.contatocrescieperdi.com.br/webhook/teste_ia_assistente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  };

  const handleTestAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUnitId || !testQuery.trim()) {
      alert('Selecione uma unidade e digite uma pergunta');
      return;
    }

    setIsTesting(true);
    const startTime = Date.now();
    
    try {
      const webhookResponse = await sendTestToWebhook(selectedUnitId, testQuery);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const unit = units.find(u => u.id === selectedUnitId);
      const currentPhase = phases.find(p => p.id === unit?.fase_atual_id);

      // Extract response from webhook format: [{"output": "response"}]
      let responseText = 'Resposta não encontrada';
      if (Array.isArray(webhookResponse) && webhookResponse.length > 0 && webhookResponse[0].output) {
        responseText = webhookResponse[0].output;
      } else if (webhookResponse.output) {
        responseText = webhookResponse.output;
      } else if (webhookResponse.resposta) {
        responseText = webhookResponse.resposta;
      } else if (webhookResponse.response) {
        responseText = webhookResponse.response;
      }
      const testResult = {
        unitId: selectedUnitId,
        phaseId: unit?.fase_atual_id || '',
        query: testQuery,
        response: responseText,
        responseTime,
        confidence: webhookResponse.confianca || webhookResponse.confidence || 0,
        sources: webhookResponse.fontes || webhookResponse.sources || [],
        behaviorGroupUsed: webhookResponse.grupo_comportamento || 'Webhook',
        timestamp: new Date().toISOString(),
        success: true,
        webhookData: webhookResponse
      };

      setTestResults(prev => [testResult, ...prev]);
      setTestQuery('');
      
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const errorResult = {
        unitId: selectedUnitId,
        phaseId: units.find(u => u.id === selectedUnitId)?.fase_atual_id || '',
        query: testQuery,
        response: '',
        responseTime,
        confidence: 0,
        sources: [],
        behaviorGroupUsed: 'Webhook',
        timestamp: new Date().toISOString(),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      setTestResults(prev => [errorResult, ...prev]);
      console.error('Error testing AI:', error);
      alert('Erro ao testar IA');
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const currentPhase = selectedUnit ? phases.find(p => p.id === selectedUnit.fase_atual_id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-8 h-8 text-pink-600" />
          IA Assistente
        </h2>
        <p className="text-gray-600 mt-1">Teste e monitore o comportamento da IA por unidade e fase</p>
      </div>

      {/* Test Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teste de Funcionalidade</h3>
        
        <form onSubmit={handleTestAI} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Unidade
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Escolha uma unidade...</option>
                {units.sort((a, b) => a.nome.localeCompare(b.nome)).map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nome} ({unit.codigo})
                  </option>
                ))}
              </select>
            </div>

            {selectedUnit && currentPhase && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fase Atual
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    {getPhaseDisplayName(currentPhase.nome)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pergunta de Teste
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Digite uma pergunta para testar a IA..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
              <button
                type="submit"
                disabled={isTesting || !selectedUnitId}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Testar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Resultados dos Testes</h3>
          {testResults.length > 0 && (
            <button
              onClick={clearTestResults}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Limpar Resultados
            </button>
          )}
        </div>

        <div className="p-6">
          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum teste realizado ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Selecione uma unidade e faça uma pergunta para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => {
                const unit = units.find(u => u.id === result.unitId);
                const phase = unit ? phases.find(p => p.id === unit.fase_atual_id) : null;
                
                return (
                  <div
                    key={`${result.unitId}-${result.timestamp}`}
                    className={`p-4 rounded-lg border-2 ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          result.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium text-gray-900">
                          {unit?.nome} - {phase ? getPhaseDisplayName(phase.nome) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Confiança: {
                            typeof result.confidence === 'number' 
                              ? (result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(0)
                              : '0'
                          }%
                        </span>
                        <span>{result.responseTime}ms</span>
                        <span>{new Date(result.timestamp).toLocaleTimeString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Pergunta:</p>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                          {result.query || 'Pergunta não disponível'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Resposta:</p>
                        <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                          {result.response}
                        </p>
                      </div>

                      {result.errorMessage && (
                        <div>
                          <p className="text-sm font-medium text-red-700">Erro:</p>
                          <p className="text-sm text-red-600 bg-red-100 p-2 rounded border">
                            {result.errorMessage}
                          </p>
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
    </div>
  );
};

export default IAAssistenteTab;
