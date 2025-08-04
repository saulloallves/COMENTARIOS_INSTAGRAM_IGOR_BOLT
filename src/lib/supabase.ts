import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl.includes('supabase.co')

if (!isSupabaseConfigured) {
  console.error('Missing Supabase environment variables. Please check your .env file:')
  console.error('- VITE_SUPABASE_URL should be your Supabase project URL')
  console.error('- VITE_SUPABASE_ANON_KEY should be your Supabase anonymous key')
  console.error('Current values:', { supabaseUrl, supabaseAnonKey })
  console.warn('Application will run with mock data only.')
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string
          nome: string
          codigo: string
          localizacao: string
          fase_atual_id: string
          status: 'ativa' | 'inativa' | 'planejamento' | 'implementacao' | 'transicao' | 'erro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          codigo: string
          localizacao: string
          fase_atual_id: string
          status?: 'ativa' | 'inativa' | 'planejamento' | 'implementacao' | 'transicao' | 'erro'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          codigo?: string
          localizacao?: string
          fase_atual_id?: string
          status?: 'ativa' | 'inativa' | 'planejamento' | 'implementacao' | 'transicao' | 'erro'
          updated_at?: string
        }
      }
      fases: {
        Row: {
          id: string
          nome: 'interacao' | 'pre_compras' | 'compras' | 'pre_inauguracao_semana_1' | 'pre_inauguracao_semana_2' | 'inauguracao' | 'operacao' | 'loja_fechada_temporariamente' | 'loja_fechada_definitivamente'
          ordem: number
          cor: string
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: 'interacao' | 'pre_compras' | 'compras' | 'pre_inauguracao_semana_1' | 'pre_inauguracao_semana_2' | 'inauguracao' | 'operacao' | 'loja_fechada_temporariamente' | 'loja_fechada_definitivamente'
          ordem: number
          cor?: string
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: 'interacao' | 'pre_compras' | 'compras' | 'pre_inauguracao_semana_1' | 'pre_inauguracao_semana_2' | 'inauguracao' | 'operacao' | 'loja_fechada_temporariamente' | 'loja_fechada_definitivamente'
          ordem?: number
          cor?: string
          ativa?: boolean
          updated_at?: string
        }
      }
      grupos_comportamento: {
        Row: {
          id: string
          fase_id: string
          descricao: string
          permitido_responder: boolean
          ativo: boolean
          escopo: any
          resposta_padrao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fase_id: string
          descricao: string
          permitido_responder?: boolean
          ativo?: boolean
          escopo?: any
          resposta_padrao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fase_id?: string
          descricao?: string
          permitido_responder?: boolean
          ativo?: boolean
          escopo?: any
          resposta_padrao?: string | null
          updated_at?: string
        }
      }
      documentacoes: {
        Row: {
          id: string
          titulo: string
          conteudo: string
          tipo: 'padrao' | 'por_fase'
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          tipo?: 'padrao' | 'por_fase'
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          tipo?: 'padrao' | 'por_fase'
          ativa?: boolean
          updated_at?: string
        }
      }
      documentacoes_por_fase: {
        Row: {
          id: string
          fase_id: string
          documentacao_id: string
          prioridade: number
          created_at: string
        }
        Insert: {
          id?: string
          fase_id: string
          documentacao_id: string
          prioridade?: number
          created_at?: string
        }
        Update: {
          id?: string
          fase_id?: string
          documentacao_id?: string
          prioridade?: number
        }
      }
      comportamento_padrao: {
        Row: {
          id: string
          fase_id: string
          instrucoes: string
          proibicoes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fase_id: string
          instrucoes: string
          proibicoes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fase_id?: string
          instrucoes?: string
          proibicoes?: string
          updated_at?: string
        }
      }
      historico_interacoes: {
        Row: {
          id: string
          unidade_id: string
          usuario_id: string
          pergunta: string
          resposta: string
          fase_id: string
          sucesso: boolean
          tempo_resposta: number
          confianca: number
          fontes: string[]
          created_at: string
        }
        Insert: {
          id?: string
          unidade_id: string
          usuario_id: string
          pergunta: string
          resposta: string
          fase_id: string
          sucesso?: boolean
          tempo_resposta?: number
          confianca?: number
          fontes?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          unidade_id?: string
          usuario_id?: string
          pergunta?: string
          resposta?: string
          fase_id?: string
          sucesso?: boolean
          tempo_resposta?: number
          confianca?: number
          fontes?: string[]
        }
      }
      comentarios_instagram: {
        Row: {
          id: string
          unidade_id: string
          conteudo: string
          autor: string
          timestamp_comentario: string
          classificacao: string | null
          confianca: number | null
          justificativa: string | null
          resposta_sugerida: string | null
          deve_responder: boolean | null
          deve_apagar: boolean | null
          processado_em: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          unidade_id: string
          conteudo: string
          autor: string
          timestamp_comentario: string
          classificacao?: string | null
          confianca?: number | null
          justificativa?: string | null
          resposta_sugerida?: string | null
          deve_responder?: boolean | null
          deve_apagar?: boolean | null
          processado_em?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          unidade_id?: string | null
          conteudo?: string
          autor?: string
          timestamp_comentario?: string
          classificacao?: string | null
          confianca?: number | null
          justificativa?: string | null
          resposta_sugerida?: string | null
          deve_responder?: boolean | null
          deve_apagar?: boolean | null
          processado_em?: string | null
          updated_at?: string | null
        }
      }
      direct_instagram_conversas: {
        Row: {
          id: string
          unidade_id: string
          id_ig_usuario: string
          id_conta_instagram_unidade: string
          bearer_token: string | null
          mensagens: any
          id_recipient: string | null
          nome: string | null
          whatsapp: string | null
          pic: string | null
          mensagens_nao_lidas: number
          total_mensagens: number
          status: 'ativa' | 'arquivada' | 'bloqueada'
          metadados: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unidade_id: string
          id_ig_usuario: string
          id_conta_instagram_unidade: string
          bearer_token?: string | null
          mensagens?: any
          id_recipient?: string | null
          nome?: string | null
          whatsapp?: string | null
          pic?: string | null
          mensagens_nao_lidas?: number
          total_mensagens?: number
          status?: 'ativa' | 'arquivada' | 'bloqueada'
          metadados?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unidade_id?: string
          id_ig_usuario?: string
          id_conta_instagram_unidade?: string
          bearer_token?: string | null
          mensagens?: any
          id_recipient?: string | null
          nome?: string | null
          whatsapp?: string | null
          pic?: string | null
          mensagens_nao_lidas?: number
          total_mensagens?: number
          status?: 'ativa' | 'arquivada' | 'bloqueada'
          metadados?: any
          updated_at?: string
        }
      }
    }
  }
}
