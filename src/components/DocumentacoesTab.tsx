import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';

const DocumentacoesTab: React.FC = () => {
  const { documentations, loading, createDocumentation, updateDocumentation } = useSupabaseData();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'padrao' as 'padrao' | 'por_fase',
    ativa: true
  });

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const result = await createDocumentation(formData);
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ titulo: '', conteudo: '', tipo: 'padrao', ativa: true });
      } else {
        alert('Erro ao criar documentação: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating documentation:', error);
      alert('Erro ao criar documentação.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDocumentation(selectedDoc.id, formData);
      if (result.success) {
        setShowEditModal(false);
        setSelectedDoc(null);
        setFormData({ titulo: '', conteudo: '', tipo: 'padrao', ativa: true });
      } else {
        alert('Erro ao atualizar documentação: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating documentation:', error);
      alert('Erro ao atualizar documentação.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (doc: any) => {
    setSelectedDoc(doc);
    setFormData({
      titulo: doc.titulo,
      conteudo: doc.conteudo,
      tipo: doc.tipo,
      ativa: doc.ativa
    });
    setShowEditModal(true);
  };

  const openViewModal = (doc: any) => {
    setSelectedDoc(doc);
    setShowViewModal(true);
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentações</h2>
          <p className="text-gray-600 mt-1">Gerencie a base de conhecimento do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Documentação
        </button>
      </div>

      {/* Documentations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentations.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{doc.titulo}</h3>
                  <p className="text-sm text-gray-500 capitalize">{doc.tipo.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openViewModal(doc)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(doc)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Conteúdo</p>
                <div 
                  className="text-sm text-gray-800 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: doc.conteudo.substring(0, 150) + (doc.conteudo.length > 150 ? '...' : '') 
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  doc.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {doc.ativa ? 'Ativa' : 'Inativa'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Documentation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Documentação"
        size="xl"
      >
        <form onSubmit={handleCreateDoc} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'padrao' | 'por_fase' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="padrao">Padrão</option>
              <option value="por_fase">Por Fase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo
            </label>
            <RichTextEditor
              value={formData.conteudo}
              onChange={(value) => setFormData(prev => ({ ...prev, conteudo: value }))}
              placeholder="Digite o conteúdo da documentação..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativa"
              checked={formData.ativa}
              onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="ativa" className="ml-2 block text-sm text-gray-900">
              Documentação ativa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating && <RefreshCw className="w-4 h-4 animate-spin" />}
              Criar Documentação
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Documentation Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Documentação"
        size="xl"
      >
        <form onSubmit={handleUpdateDoc} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'padrao' | 'por_fase' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="padrao">Padrão</option>
              <option value="por_fase">Por Fase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo
            </label>
            <RichTextEditor
              value={formData.conteudo}
              onChange={(value) => setFormData(prev => ({ ...prev, conteudo: value }))}
              placeholder="Digite o conteúdo da documentação..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativa-edit"
              checked={formData.ativa}
              onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="ativa-edit" className="ml-2 block text-sm text-gray-900">
              Documentação ativa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>

      {/* View Documentation Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedDoc?.titulo || 'Documentação'}
        size="xl"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedDoc.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedDoc.ativa ? 'Ativa' : 'Inativa'}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {selectedDoc.tipo.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Criado em {new Date(selectedDoc.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedDoc.conteudo }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentacoesTab;
