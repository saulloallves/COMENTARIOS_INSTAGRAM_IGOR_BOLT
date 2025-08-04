import React, { useState, useMemo, useEffect } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { User, MessageCircle, MapPin, Clock, UserCircle, Home, BadgeCheck } from 'lucide-react';

interface ComentariosTabProps {
  selectedUnitId: string;
  onBack: () => void;
}

const COLUMN_CONFIG = [
  {
    key: 'pendente',
    title: 'Esperando Aprovação',
    bg: 'rgb(191 219 254)',
    text: '#222',
  },
  {
    key: 'aprovado',
    title: 'Aprovados',
    bg: 'rgb(187 247 208)',
    text: '#222',
  },
  {
    key: 'reprovado',
    title: 'Reprovados',
    bg: 'rgb(254 215 170)',
    text: '#222',
  },
];

const CLASSIFICACAO_LABEL: Record<string, { text: string; color: string }> = {
  pendente: { text: 'Em Análise', color: 'bg-yellow-200 text-yellow-900' },
  aprovado: { text: 'Aprovado', color: 'bg-green-200 text-green-900' },
  reprovado: { text: 'Reprovado', color: 'bg-red-200 text-red-900' },
};

const IA_SUGESTOES_FALLBACK = [
  'Obrigado pelo seu comentário! Estamos à disposição.',
  'Agradecemos seu contato! Se precisar de algo, conte conosco.',
  'Sua mensagem é importante para nós. Em breve retornaremos!'
];

const WEBHOOK_URL = 'https://autowebhook.contatocrescieperdi.com.br/webhook/responder_chat_direct';

const ComentariosTab: React.FC<ComentariosTabProps> = ({ selectedUnitId, onBack }) => {
  const { instagramComments, units } = useSupabaseData();
  const [unitId] = useState(selectedUnitId);

  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showIASuggestions, setShowIASuggestions] = useState(true);

  const [iaSuggestions, setIaSuggestions] = useState<string[]>(IA_SUGESTOES_FALLBACK);
  const [loadingIASuggestions, setLoadingIASuggestions] = useState(false);

  const [sendingReply, setSendingReply] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Status da fase (fases_unidade)
  const [faseStatus, setFaseStatus] = useState<string | null>(null);
  const [loadingFaseStatus, setLoadingFaseStatus] = useState(false);

  useEffect(() => {
    const fetchIASuggestions = async () => {
      if (!selectedComment) return;
      setLoadingIASuggestions(true);
      try {
        const { data, error } = await supabase
          .from('COMENTARIOS_INSTAGRAM')
          .select('sugestoes_de_resposta_IA')
          .eq('id', selectedComment.id)
          .maybeSingle();

        if (error) throw error;

        let sugestoesJson = data?.sugestoes_de_resposta_IA;

        if (typeof sugestoesJson === 'string') {
          try {
            sugestoesJson = JSON.parse(sugestoesJson);
          } catch {
            sugestoesJson = {};
          }
        }

        const sugestoesArr = sugestoesJson && typeof sugestoesJson === 'object'
          ? Object.values(sugestoesJson).filter(Boolean)
          : [];

        setIaSuggestions(sugestoesArr.length > 0 ? sugestoesArr : IA_SUGESTOES_FALLBACK);
      } catch (e) {
        setIaSuggestions(IA_SUGESTOES_FALLBACK);
      } finally {
        setLoadingIASuggestions(false);
      }
    };

    if (selectedComment) {
      fetchIASuggestions();
    }
  }, [selectedComment]);

  // Buscar status da fase (fases_unidade) ao abrir o modal
  useEffect(() => {
    const fetchFaseStatus = async () => {
      setFaseStatus(null);
      setLoadingFaseStatus(true);
      if (!selectedComment) {
        setLoadingFaseStatus(false);
        return;
      }
      // Buscar unidade
      const unidade = Array.isArray(units)
        ? units.find(u => u.id === selectedComment.unidade_id)
        : null;
      const faseAtualId = unidade && typeof unidade.fase_atual === 'string' ? unidade.fase_atual : null;
      if (!faseAtualId || !supabase) {
        setFaseStatus(null);
        setLoadingFaseStatus(false);
        return;
      }
      try {
        // ATENÇÃO: nome correto da tabela é fases_unidade
        const { data, error } = await supabase
          .from('fases_unidade')
          .select('status')
          .eq('id', faseAtualId)
          .maybeSingle();
        if (error || !data) {
          setFaseStatus(null);
        } else {
          setFaseStatus(data.status ?? null);
        }
      } catch {
        setFaseStatus(null);
      } finally {
        setLoadingFaseStatus(false);
      }
    };
    if (selectedComment) {
      fetchFaseStatus();
    } else {
      setFaseStatus(null);
      setLoadingFaseStatus(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComment, units]);

  const filteredComments = useMemo(() => {
    if (!unitId) return [];
    return (instagramComments || []).filter(c => c.unidade_id === unitId);
  }, [instagramComments, unitId]);

  const commentsByStatus = useMemo(() => {
    const map: Record<string, typeof filteredComments> = {
      pendente: [],
      aprovado: [],
      reprovado: [],
    };
    filteredComments.forEach(comment => {
      const key = comment.classificacao || 'pendente';
      if (map[key]) map[key].push(comment);
    });
    return map;
  }, [filteredComments]);

  const getUnitName = (unidade_id: string) => {
    if (!Array.isArray(units)) return '';
    const unit = units.find(u => u.id === unidade_id);
    return unit ? unit.nome : '';
  };

  const handleCloseModal = () => {
    setSelectedComment(null);
    setShowReplyBox(false);
    setReplyText('');
    setShowIASuggestions(true);
    setSendError(null);
    setSendSuccess(false);
    setSendingReply(false);
    setFaseStatus(null);
    setLoadingFaseStatus(false);
  };

  const handleDelete = () => {
    handleCloseModal();
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedComment) return;
    setSendingReply(true);
    setSendError(null);
    setSendSuccess(false);

    const payload = {
      resposta: replyText,
      comentario_id: selectedComment.id,
      autor_comentario: selectedComment.autor,
      conteudo_comentario: selectedComment.conteudo,
      unidade_id: selectedComment.unidade_id,
      unidade_nome: getUnitName(selectedComment.unidade_id),
      data_comentario: selectedComment.created_at,
    };

    try {
      const resp = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Erro ao enviar resposta: ${resp.status}`);
      }

      setSendSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err: any) {
      setSendError('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleIASuggestion = (suggestion: string) => {
    setReplyText(suggestion);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR') + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const unitName = getUnitName(unitId);

  return (
    <div className="p-6">
      <div className="w-full flex justify-center">
        <span className="text-sm text-gray-500 font-normal mb-1 text-center truncate max-w-full" title={unitName}>
          {unitName}
        </span>
      </div>
      <div className="w-full flex justify-center mb-8">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded hover:bg-blue-100 transition"
            onClick={onBack}
            title="Escolher unidade"
            style={{ lineHeight: 0 }}
          >
            <Home className="w-7 h-7 text-blue-700" />
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#011C40] text-center tracking-wide drop-shadow">
            MODERAÇÃO DE COMENTARIOS
          </h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {COLUMN_CONFIG.map(col => (
          <div
            key={col.key}
            className="flex-1 min-w-[260px] border rounded-xl shadow-sm flex flex-col"
            style={{ background: col.bg, borderColor: col.bg }}
          >
            <div
              className="p-3 rounded-t-xl font-bold text-center text-base border-b"
              style={{
                background: col.bg,
                color: col.text,
                borderColor: col.bg,
              }}
            >
              {col.title} <span className="ml-1 text-xs font-normal" style={{ color: col.text }}>({commentsByStatus[col.key].length})</span>
            </div>
            <div className="flex-1 p-2 space-y-2 min-h-[120px]">
              {commentsByStatus[col.key].length === 0 ? (
                <div className="text-gray-400 text-center py-6">Nenhum comentário</div>
              ) : (
                commentsByStatus[col.key].map(comment => (
                  <div
                    key={comment.id}
                    className="bg-white border border-gray-200 rounded-2xl p-3 shadow-md hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedComment(comment)}
                  >
                    <div className="text-sm text-gray-800">{comment.conteudo}</div>
                    <div className="text-xs text-gray-500 mt-1">@{comment.autor}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedComment}
        onClose={handleCloseModal}
        className="p-0"
      >
        {selectedComment && (
          <div className="bg-[#fff] rounded-2xl min-w-[442px] max-w-[572px] shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 pt-5 pb-3 border-b">
              <div className="bg-yellow-100 rounded-full p-2">
                <UserCircle className="w-7 h-7 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-lg leading-tight">{selectedComment.autor}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${CLASSIFICACAO_LABEL[selectedComment.classificacao || 'pendente'].color}`}>
                    Status: {CLASSIFICACAO_LABEL[selectedComment.classificacao || 'pendente'].text}
                  </span>
                  {selectedComment.created_at && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedComment.created_at)}
                    </span>
                  )}
                  {/* ETIQUETA DE STATUS DA FASE */}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 ml-1" title="Status da fase da unidade">
                    <BadgeCheck className="w-4 h-4" />
                    {loadingFaseStatus
                      ? 'Carregando...'
                      : (faseStatus || 'Status desconhecido')}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Unidade
                </div>
                <div className="bg-gray-50 border rounded px-3 py-2 text-gray-800 text-sm font-semibold">{getUnitName(selectedComment.unidade_id)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
                  <MessageCircle className="w-4 h-4" />
                  Comentário
                </div>
                <div className="bg-gray-50 border rounded px-3 py-2 text-gray-800 text-sm">{selectedComment.conteudo}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
                  <User className="w-4 h-4" />
                  Origem
                </div>
                <div className="bg-gray-100 border rounded px-3 py-2 text-gray-700 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  HUMANO
                </div>
              </div>
              <div>
                {!showReplyBox && (
                  <button
                    className="bg-blue-700 text-white px-3 py-1.5 rounded font-semibold text-sm hover:bg-blue-800 transition mt-2"
                    onClick={() => setShowReplyBox(true)}
                  >
                    Responder
                  </button>
                )}
                {showReplyBox && (
                  <div>
                    {showIASuggestions && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {loadingIASuggestions ? (
                          <span className="text-xs text-gray-400">Carregando sugestões...</span>
                        ) : (
                          iaSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200 transition"
                              onClick={() => handleIASuggestion(s)}
                            >
                              {s}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 mb-2 text-sm bg-gray-50 focus:bg-white focus:outline-blue-400"
                      rows={3}
                      placeholder="Digite sua resposta..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      autoFocus
                      disabled={sendingReply}
                    />
                    <div className="flex gap-2 items-center">
                      <button
                        className="bg-blue-700 text-white px-3 py-1.5 rounded font-semibold text-sm hover:bg-blue-800 transition"
                        onClick={handleReply}
                        disabled={sendingReply || !replyText.trim()}
                      >
                        {sendingReply ? 'Enviando...' : 'Responder'}
                      </button>
                      <button
                        className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded font-semibold text-sm hover:bg-gray-200 transition"
                        onClick={() => { setShowReplyBox(false); setReplyText(''); setSendError(null); }}
                        disabled={sendingReply}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="ml-auto flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition text-xs font-semibold"
                        title="Sugestões da IA"
                        onClick={() => setShowIASuggestions(v => !v)}
                        disabled={sendingReply}
                      >
                        Sugestões da IA
                      </button>
                    </div>
                    {sendError && (
                      <div className="text-red-600 text-xs mt-2">{sendError}</div>
                    )}
                    {sendSuccess && (
                      <div className="text-green-600 text-xs mt-2">Resposta enviada com sucesso!</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center border-t px-6 py-3 bg-gray-50 rounded-b-2xl">
              <button
                className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold text-base hover:bg-red-200 transition"
                onClick={handleDelete}
                disabled={sendingReply}
              >
                Excluir comentário
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-2 rounded font-semibold text-base hover:bg-gray-500 transition"
                onClick={handleCloseModal}
                disabled={sendingReply}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComentariosTab;
