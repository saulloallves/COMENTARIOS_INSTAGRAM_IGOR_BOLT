import React, { useState } from 'react';
import UnitSelectorPage from './components/UnitSelectorPage';
import ComentariosTab from './components/ComentariosTab';

const App: React.FC = () => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {!selectedUnitId ? (
        <UnitSelectorPage onSelectUnit={setSelectedUnitId} />
      ) : (
        <ComentariosTab
          selectedUnitId={selectedUnitId}
          onBack={() => setSelectedUnitId(null)}
        />
      )}
    </div>
  );
};

export default App;
