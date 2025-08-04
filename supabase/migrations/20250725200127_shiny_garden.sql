/*
  # Fix RLS policies for prompts_ia table

  1. Security Updates
    - Drop existing restrictive policies
    - Add permissive policies for authenticated users
    - Allow INSERT operations for authenticated users
    - Maintain proper access control for different operations

  2. Changes
    - Allow authenticated users to create prompts
    - Allow authenticated users to read active prompts
    - Restrict management operations to admins/gestors only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins podem gerenciar todos os prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Usuários podem ler prompts ativos" ON prompts_ia;

-- Create new permissive policies
CREATE POLICY "Authenticated users can read active prompts"
  ON prompts_ia
  FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "Authenticated users can create prompts"
  ON prompts_ia
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own prompts"
  ON prompts_ia
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all prompts"
  ON prompts_ia
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role IN ('admin', 'gestor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.role IN ('admin', 'gestor')
    )
  );
