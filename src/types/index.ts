export interface Unidade {
  id: number | string;
  nome: string;
  codigo: string;
  localizacao?: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InstagramComment {
  id: number | string;
  conteudo: string;
  autor: string;
  unidade_id: string;
  classificacao: string;
  created_at: string;
  // Adicione outros campos conforme necessário
}
