import React, { useRef, useLayoutEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const maxSide = Math.max(rect.width, rect.height);
      setSide(maxSide);
    }
  }, [children, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.13)',
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      {/* Overlay para fechar */}
      <div
        className="fixed inset-0"
        style={{ background: 'transparent' }}
        onClick={onClose}
      />
      {/* Modal centralizado, quadrado, sem sombra, sem rolagem */}
      <div
        className={`relative flex flex-col mx-auto my-auto transition-all transform ${className}`}
        style={{
          zIndex: 10,
          borderRadius: 50,
                   boxShadow: 'none',
          padding: 0, // Removido padding do container
          width: side || 'auto',
          height: side || 'auto',
          overflow: 'visible',
          alignItems: 'stretch',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-12 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar modal"
          style={{ zIndex: 200 }}
        >
          <X className="w-5 h-5" />
        </button>
        {/* Wrapper para medir o conteúdo */}
        <div
          ref={contentRef}
          style={{
            display: 'inline-block',
            width: 'fit-content',
            height: 'fit-content',
            minWidth: 120,
            minHeight: 120,
            overflow: 'visible',
            // Remover qualquer fundo/borda/padding extra do conteúdo
            background: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            padding: 1, // O padding agora é só no conteúdo
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
