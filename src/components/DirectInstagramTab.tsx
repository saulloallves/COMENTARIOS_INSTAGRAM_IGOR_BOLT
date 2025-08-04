import React, { useState, useEffect, useMemo } from 'react';
import { 
  Instagram, 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  Reply,
  MoreVertical,
  Brain,
  Bug,
  Plus,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';

// Função utilitária fora do componente para evitar hooks dentro de funções
const getUnitName = (units: any[], unitId: string) => {
  const unit = (units || []).find(u => u.id === unitId);
  return unit ? unit.nome : 'Unidade não encontrada';
};

const DirectInstagramTab: React.FC = () => {
  const { 
    units = [], 
    directConversas = [], 
    loading = false,
    error
  } = useSupabaseData();
  
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'nao_lida' | 'ativa' | 'arquivada'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Memoize conversas filtradas para evitar cálculos desnecessários
  const filteredConversas = useMemo(() => {
    return (directConversas || []).filter(conversa => {
      if (selectedUnit !== 'all' && conversa.unidade_id !== selectedUnit) return false;
      if (filter === 'nao_lida' && conversa.mensagens_nao_lidas === 0) return false;
      if (filter === 'ativa' && conversa.status !== 'ativa') return false;
      if (filter === 'arquivada' && conversa.status !== 'arquivada') return false;
      return true;
    });
  }, [directConversas, selectedUnit, filter]);

  // Memoize conversas filtradas por busca e ordenação
  const searchFilteredConversas = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const conversas = (filteredConversas || []).filter(conv => {
      if (!searchTerm) return true;
      const unitName = getUnitName(units, conv.unidade_id).toLowerCase();
      return (
        (conv.id_ig_usuario && conv.id_ig_usuario.toLowerCase().includes(searchLower)) ||
        (conv.nome && conv.nome.toLowerCase().includes(searchLower)) ||
        (conv.whatsapp && conv.whatsapp.includes(searchTerm)) ||
        (conv.id_conta_instagram_unidade && conv.id_conta_instagram_unidade.toLowerCase().includes(searchLower)) ||
        unitName.includes(searchLower)
      );
    }).sort((a, b) => {
      // Sort by updated_at (most recent first)
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });
    return conversas;
  }, [filteredConversas, searchTerm, units]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!searchFilteredConversas || searchFilteredConversas.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhuma conversa encontrada.
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-full max-h-screen overflow-hidden flex flex-col bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 px-6 pt-6 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            Direct Instagram
          </h2>
          <p className="text-gray-600 mt-2">Gerenciamento de mensagens diretas do Instagram</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white"
          >
            <option value="all">Todas as unidades</option>
            {(units || []).map(unit => (
              <option key={unit.id} value={unit.id}>{unit.nome}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto p-6">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Usuário IG</th>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Unidade</th>
              <th className="px-4 py-2 text-left">Mensagens não lidas</th>
              <th className="px-4 py-2 text-left">Total mensagens</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            {searchFilteredConversas.map((conversa: any) => (
              <tr key={conversa.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{conversa.id_ig_usuario || '-'}</td>
                <td className="px-4 py-2">{conversa.nome || '-'}</td>
                <td className="px-4 py-2">{getUnitName(units, conversa.unidade_id)}</td>
                <td className="px-4 py-2">{conversa.mensagens_nao_lidas}</td>
                <td className="px-4 py-2">{conversa.total_mensagens}</td>
                <td className="px-4 py-2">{conversa.status}</td>
                <td className="px-4 py-2">
                  {conversa.updated_at
                    ? new Date(conversa.updated_at).toLocaleString('pt-BR')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DirectInstagramTab;
