import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const UnidadesTab: React.FC = () => {
  const { units, loading } = useSupabaseData();

  if (loading) return <div>Carregando unidades...</div>;

  if (!units || units.length === 0) {
    return <div className="text-gray-500">Nenhuma unidade encontrada.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">UNIDADES</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Código</th>
            <th className="border px-2 py-1">Localização</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unidade) => (
            <tr key={unidade.id}>
              <td className="border px-2 py-1">{unidade.id}</td>
              <td className="border px-2 py-1">{unidade.nome}</td>
              <td className="border px-2 py-1">{unidade.codigo}</td>
              <td className="border px-2 py-1">{unidade.localizacao}</td>
              <td className="border px-2 py-1">{unidade.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnidadesTab;
