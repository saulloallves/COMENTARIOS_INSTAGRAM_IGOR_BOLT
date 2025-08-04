import React, { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Building2, Search, MessageCircle, Bot, Trash2 } from 'lucide-react';

interface UnitSelectorPageProps {
  onSelectUnit: (unitId: string) => void;
}

const tutorialText = (
  <div>
    <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
      <MessageCircle className="w-5 h-5 text-blue-500" />
      Como funciona a gestão de comentários?
    </h2>
    <ol className="list-decimal pl-5 mb-2 text-gray-700">
      <li>
        <b>Visualização:</b> Após escolher a unidade, você verá todos os comentários recebidos do Instagram organizados em colunas (Kanban): <span className="font-semibold text-yellow-600">Esperando Aprovação</span>, <span className="font-semibold text-green-600">Aprovados</span> e <span className="font-semibold text-red-600">Reprovados</span>.
      </li>
      <li>
        <b>Responder:</b> Clique em um comentário para abrir os detalhes. Clique em <span className="inline-flex items-center gap-1 font-semibold text-blue-600"><Bot className="w-4 h-4" />Responder</span> para ver sugestões da IA e enviar uma resposta.
      </li>
      <li>
        <b>Excluir:</b> Se necessário, utilize o botão <span className="inline-flex items-center gap-1 font-semibold text-red-600"><Trash2 className="w-4 h-4" />Excluir</span> para remover comentários inapropriados.
      </li>
      <li>
        <b>Aprovação:</b> Comentários podem ser aprovados ou reprovados conforme análise. A IA pode sugerir respostas, mas a decisão final é sua.
      </li>
      <li>
        <b>Boas práticas:</b> Seja cordial, breve e profissional nas respostas. Utilize as sugestões da IA para agilizar, mas personalize quando necessário.
      </li>
    </ol>
    <div className="text-sm text-gray-500 mt-2">
      <b>Dica:</b> Utilize o campo de busca acima para encontrar rapidamente a unidade desejada.
    </div>
  </div>
);

const UnitSelectorPage: React.FC<UnitSelectorPageProps> = ({ onSelectUnit }) => {
  const { units, loading } = useSupabaseData();
  const [search, setSearch] = useState('');

  const filteredUnits = useMemo(() => {
    if (!units || !search.trim()) return [];
    const term = search.toLowerCase();
    return units
      .filter(u => {
        const nome = (u.nome ?? '').toString().toLowerCase();
        const codigo = (u.codigo ?? '').toString().toLowerCase();
        const localizacao = (u.localizacao ?? '').toString().toLowerCase();
        const unidadeId = (u.id ?? '').toString().toLowerCase();
        return (
          nome.includes(term) ||
          codigo.includes(term) ||
          localizacao.includes(term) ||
          unidadeId.includes(term)
        );
      })
      .slice(0, 4);
  }, [units, search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-xl flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center tracking-tight drop-shadow-sm">
          ESCOLHA A UNIDADE
        </h1>
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg transition"
              placeholder="Pesquise por nome, código, localização ou unidade_id..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="w-full mt-3 max-h-64 overflow-y-auto">
            {loading && (
              <div className="text-center text-gray-400 py-6">Carregando unidades...</div>
            )}
            {!loading && search.trim() && filteredUnits.length === 0 && (
              <div className="text-center text-gray-400 py-6">Nenhuma unidade encontrada.</div>
            )}
            {!loading && search.trim() && filteredUnits.length > 0 && (
              <ul className="flex flex-col gap-2">
                {filteredUnits.map(unit => (
                  <li key={unit.id}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-200 shadow hover:bg-blue-50 transition text-left"
                      onClick={() => onSelectUnit(unit.id)}
                    >
                      <Building2 className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-semibold text-gray-800">{unit.nome}</div>
                        <div className="text-xs text-gray-500">
                          {unit.codigo} &middot; {unit.localizacao} &middot; <span className="text-blue-700">{unit.id}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Tutorial Card */}
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow p-6 mt-2 mb-4">
          {tutorialText}
        </div>
      </div>
    </div>
  );
};

export default UnitSelectorPage;
