import React from 'react';

const InstagramManager: React.FC = () => {
  // ... toda a lógica e renderização dos comentários permanece igual

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* HEADER DESIGNER substituindo o dropdown */}
      <div className="w-full flex justify-center mb-6">
        <div className="bg-white rounded-xl shadow-lg px-8 py-4 border-b-4 border-blue-500">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-wide text-center drop-shadow">
            MODERAÇÃO DE COMENTARIOS
          </h1>
        </div>
      </div>
      {/* O restante da tela permanece inalterado */}
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {/* Coluna: Esperando Aprovação */}
        <div className="flex-1 bg-yellow-100 border border-yellow-200 rounded-xl p-4 min-h-[200px]">
          <h2 className="font-bold text-yellow-800 text-center mb-2">
            Esperando Aprovação <span className="font-normal text-sm text-gray-600">(0)</span>
          </h2>
          <div className="text-center text-gray-400 mt-8">Nenhum comentário</div>
        </div>
        {/* Coluna: Aprovados */}
        <div className="flex-1 bg-green-100 border border-green-200 rounded-xl p-4 min-h-[200px]">
          <h2 className="font-bold text-green-800 text-center mb-2">
            Aprovados <span className="font-normal text-sm text-gray-600">(0)</span>
          </h2>
          <div className="text-center text-gray-400 mt-8">Nenhum comentário</div>
        </div>
        {/* Coluna: Reprovados */}
        <div className="flex-1 bg-red-100 border border-red-200 rounded-xl p-4 min-h-[200px]">
          <h2 className="font-bold text-red-800 text-center mb-2">
            Reprovados <span className="font-normal text-sm text-gray-600">(0)</span>
          </h2>
          <div className="text-center text-gray-400 mt-8">Nenhum comentário</div>
        </div>
      </div>
    </div>
  );
};

export default InstagramManager;
