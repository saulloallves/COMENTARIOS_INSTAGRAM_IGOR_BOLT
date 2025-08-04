/*
  # Fix duplicate RLS policies

  1. Drop existing policies that might conflict
  2. Recreate all policies with correct auth.uid() function
  3. Ensure no duplicates exist

  This migration safely handles existing policies and recreates them correctly.
*/

-- Drop existing policies that might conflict (using IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Anyone can read fases_historico" ON fases_historico;
DROP POLICY IF EXISTS "Only system can write fases_historico" ON fases_historico;
DROP POLICY IF EXISTS "Anyone can read fases_restricoes" ON fases_restricoes;
DROP POLICY IF EXISTS "Admins can modify fases_restricoes" ON fases_restricoes;
DROP POLICY IF EXISTS "Anyone can read fases_transicoes" ON fases_transicoes;
DROP POLICY IF EXISTS "Admins can modify fases_transicoes" ON fases_transicoes;
DROP POLICY IF EXISTS "Anyone can read fases_configuracao" ON fases_configuracao;
DROP POLICY IF EXISTS "Admins can modify fases_configuracao" ON fases_configuracao;
DROP POLICY IF EXISTS "Anyone can read fases_objetivos" ON fases_objetivos;
DROP POLICY IF EXISTS "Admins can modify fases_objetivos" ON fases_objetivos;
DROP POLICY IF EXISTS "Anyone can read fases_acoes_permitidas" ON fases_acoes_permitidas;
DROP POLICY IF EXISTS "Admins can modify fases_acoes_permitidas" ON fases_acoes_permitidas;
DROP POLICY IF EXISTS "Anyone can read documentacoes_por_fase" ON documentacoes_por_fase;
DROP POLICY IF EXISTS "Admins and gestors can modify documentacoes_por_fase" ON documentacoes_por_fase;
DROP POLICY IF EXISTS "Users can read own interactions" ON historico_interacoes;
DROP POLICY IF EXISTS "Users can insert own interactions" ON historico_interacoes;
DROP POLICY IF EXISTS "Users can read own data" ON usuarios;
DROP POLICY IF EXISTS "Users can update own data" ON usuarios;
DROP POLICY IF EXISTS "Admins can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Gestors and admins can modify unidades" ON unidades;
DROP POLICY IF EXISTS "Anyone can read active documentacoes" ON documentacoes;
DROP POLICY IF EXISTS "Authors and admins can modify documentacoes" ON documentacoes;
DROP POLICY IF EXISTS "Users can manage Instagram comments" ON comentarios_instagram;
DROP POLICY IF EXISTS "Users can read direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can insert direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can update direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Admins can delete direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can read direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Users can insert direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Users can update direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Admins can delete direct mensagens" ON direct_instagram_mensagens;

-- Now recreate all policies with correct auth.uid() function

-- Fases Histórico
CREATE POLICY "Anyone can read fases_historico"
  ON fases_historico
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only system can write fases_historico"
  ON fases_historico
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fases Restrições
CREATE POLICY "Anyone can read fases_restricoes"
  ON fases_restricoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can modify fases_restricoes"
  ON fases_restricoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Fases Transições
CREATE POLICY "Anyone can read fases_transicoes"
  ON fases_transicoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can modify fases_transicoes"
  ON fases_transicoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Fases Configuração
CREATE POLICY "Anyone can read fases_configuracao"
  ON fases_configuracao
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can modify fases_configuracao"
  ON fases_configuracao
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Fases Objetivos
CREATE POLICY "Anyone can read fases_objetivos"
  ON fases_objetivos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can modify fases_objetivos"
  ON fases_objetivos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Fases Ações Permitidas
CREATE POLICY "Anyone can read fases_acoes_permitidas"
  ON fases_acoes_permitidas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can modify fases_acoes_permitidas"
  ON fases_acoes_permitidas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Documentações por Fase
CREATE POLICY "Anyone can read documentacoes_por_fase"
  ON documentacoes_por_fase
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and gestors can modify documentacoes_por_fase"
  ON documentacoes_por_fase
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Histórico Interações
CREATE POLICY "Users can read own interactions"
  ON historico_interacoes
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Users can insert own interactions"
  ON historico_interacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Usuários
CREATE POLICY "Users can read own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios usuarios_1
      WHERE usuarios_1.id = auth.uid()
      AND usuarios_1.role = 'admin'
    )
  );

CREATE POLICY "Users can update own data"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios usuarios_1
      WHERE usuarios_1.id = auth.uid()
      AND usuarios_1.role = 'admin'
    )
  );

-- Unidades
CREATE POLICY "Gestors and admins can modify unidades"
  ON unidades
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Documentações
CREATE POLICY "Anyone can read active documentacoes"
  ON documentacoes
  FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "Authors and admins can modify documentacoes"
  ON documentacoes
  FOR ALL
  TO authenticated
  USING (
    autor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Comentários Instagram
CREATE POLICY "Users can manage Instagram comments"
  ON comentarios_instagram
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Direct Instagram Conversas
CREATE POLICY "Users can read direct conversas"
  ON direct_instagram_conversas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert direct conversas"
  ON direct_instagram_conversas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update direct conversas"
  ON direct_instagram_conversas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete direct conversas"
  ON direct_instagram_conversas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );

-- Direct Instagram Mensagens
CREATE POLICY "Users can read direct mensagens"
  ON direct_instagram_mensagens
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert direct mensagens"
  ON direct_instagram_mensagens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update direct mensagens"
  ON direct_instagram_mensagens
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete direct mensagens"
  ON direct_instagram_mensagens
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role IN ('admin', 'gestor')
    )
  );
