import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Unidade } from '../types';

export interface InstagramComment {
  id: number | string;
  conteudo: string;
  autor: string;
  unidade_id: string;
  classificacao: string;
  created_at: string;
  // Adicione outros campos conforme necessário
}

// Mock data para fallback
const MOCK_UNITS: Unidade[] = [
  {
    id: '1',
    nome: 'Unidade Central',
    codigo: 'CENTRAL',
    localizacao: 'Centro',
    fase_atual_id: '',
    status: 'ativa',
    endereco: 'Rua Principal, 123',
    cidade: 'Cidade Exemplo',
    estado: 'SP',
    created_at: '',
    updated_at: ''
  }
];

const MOCK_COMMENTS: InstagramComment[] = [
  {
    id: 1,
    conteudo: 'Comentário de exemplo',
    autor: 'usuario1',
    unidade_id: '1',
    classificacao: 'pendente',
    created_at: new Date().toISOString(),
  }
];

export function useSupabaseData() {
  const [units, setUnits] = useState<Unidade[]>([]);
  const [instagramComments, setInstagramComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchUnits() {
      setLoading(true);
      if (!supabase) {
        // Ambiente sem Supabase configurado, usar mock
        if (isMounted) {
          setUnits(MOCK_UNITS);
          setInstagramComments(MOCK_COMMENTS);
          setLoading(false);
        }
        return;
      }
      // Busca unidades
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('UNIDADES')
        .select('*');
      if (isMounted) {
        if (!unidadesError && unidadesData) {
          setUnits(unidadesData);
        } else {
          setUnits([]);
        }
      }
      // Busca comentários do Instagram
      const { data: comentariosData, error: comentariosError } = await supabase
        .from('COMENTARIOS_INSTAGRAM')
        .select('*');
      if (isMounted) {
        if (!comentariosError && comentariosData) {
          setInstagramComments(comentariosData);
        } else {
          setInstagramComments([]);
        }
        setLoading(false);
      }
    }
    fetchUnits();
    return () => {
      isMounted = false;
    };
  }, []);

  return { units, instagramComments, loading };
}
