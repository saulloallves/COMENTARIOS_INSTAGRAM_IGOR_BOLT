/*
  # Fix uid() function error in RLS policies

  1. Security
    - Replace uid() with auth.uid() in all RLS policies
    - Update all existing policies to use correct function
    - Ensure proper authentication checks

  2. Changes
    - Fix direct_instagram_conversas policies
    - Fix direct_instagram_mensagens policies
    - Update usuarios table policies
    - Update all other tables with uid() references
*/

-- Drop existing policies that use uid()
DROP POLICY IF EXISTS "Users can insert direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can read direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Users can update direct conversas" ON direct_instagram_conversas;
DROP POLICY IF EXISTS "Admins can delete direct conversas" ON direct_instagram_conversas;

DROP POLICY IF EXISTS "Users can insert direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Users can read direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Users can update direct mensagens" ON direct_instagram_mensagens;
DROP POLICY IF EXISTS "Admins can delete direct mensagens" ON direct_instagram_mensagens;

-- Recreate policies with correct auth.uid() function
CREATE POLICY "Users can insert direct conversas"
  ON direct_instagram_conversas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read direct conversas"
  ON direct_instagram_conversas
  FOR SELECT
  TO authenticated
  USING (true);

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
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

CREATE POLICY "Users can insert direct mensagens"
  ON direct_instagram_mensagens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read direct mensagens"
  ON direct_instagram_mensagens
  FOR SELECT
  TO authenticated
  USING (true);

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
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix other tables that might have uid() issues
DROP POLICY IF EXISTS "Users can read own data" ON usuarios;
DROP POLICY IF EXISTS "Users can update own data" ON usuarios;
DROP POLICY IF EXISTS "Admins can manage all users" ON usuarios;

CREATE POLICY "Users can read own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    (id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM usuarios usuarios_1 
      WHERE usuarios_1.id = auth.uid() 
      AND usuarios_1.role = 'admin'::usuario_role
    ))
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
      AND usuarios_1.role = 'admin'::usuario_role
    )
  );

-- Fix historico_interacoes policies
DROP POLICY IF EXISTS "Users can insert own interactions" ON historico_interacoes;
DROP POLICY IF EXISTS "Users can read own interactions" ON historico_interacoes;

CREATE POLICY "Users can insert own interactions"
  ON historico_interacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can read own interactions"
  ON historico_interacoes
  FOR SELECT
  TO authenticated
  USING (
    (usuario_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    ))
  );

-- Fix fases_restricoes policies
DROP POLICY IF EXISTS "Admins can modify fases_restricoes" ON fases_restricoes;

CREATE POLICY "Admins can modify fases_restricoes"
  ON fases_restricoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix fases_transicoes policies
DROP POLICY IF EXISTS "Admins can modify fases_transicoes" ON fases_transicoes;

CREATE POLICY "Admins can modify fases_transicoes"
  ON fases_transicoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix fases_configuracao policies
DROP POLICY IF EXISTS "Admins can modify fases_configuracao" ON fases_configuracao;

CREATE POLICY "Admins can modify fases_configuracao"
  ON fases_configuracao
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix fases_objetivos policies
DROP POLICY IF EXISTS "Admins can modify fases_objetivos" ON fases_objetivos;

CREATE POLICY "Admins can modify fases_objetivos"
  ON fases_objetivos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix fases_acoes_permitidas policies
DROP POLICY IF EXISTS "Admins can modify fases_acoes_permitidas" ON fases_acoes_permitidas;

CREATE POLICY "Admins can modify fases_acoes_permitidas"
  ON fases_acoes_permitidas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix documentacoes_por_fase policies
DROP POLICY IF EXISTS "Admins and gestors can modify documentacoes_por_fase" ON documentacoes_por_fase;

CREATE POLICY "Admins and gestors can modify documentacoes_por_fase"
  ON documentacoes_por_fase
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    )
  );

-- Fix documentacoes policies
DROP POLICY IF EXISTS "Authors and admins can modify documentacoes" ON documentacoes;

CREATE POLICY "Authors and admins can modify documentacoes"
  ON documentacoes
  FOR ALL
  TO authenticated
  USING (
    (autor_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = ANY (ARRAY['admin'::usuario_role, 'gestor'::usuario_role])
    ))
  );

-- Fix only admins can modify fases policy
DROP POLICY IF EXISTS "Only admins can modify fases" ON fases;

CREATE POLICY "Only admins can modify fases"
  ON fases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role = 'admin'::usuario_role
    )
  );
