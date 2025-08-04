/*
  # Fix RLS policies for prompts_ia table

  1. Security Updates
    - Remove restrictive policies that block INSERT operations
    - Add permissive policies for authenticated users
    - Maintain admin/gestor access controls

  2. Policy Changes
    - Allow authenticated users to read active prompts
    - Allow authenticated users to create new prompts
    - Allow authenticated users to update prompts
    - Allow admins/gestors full access to all prompts
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage all prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Authenticated users can create prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Authenticated users can read active prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Authenticated users can update own prompts" ON prompts_ia;

-- Create new permissive policies
CREATE POLICY "Users can read active prompts"
  ON prompts_ia
  FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "Users can create prompts"
  ON prompts_ia
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update prompts"
  ON prompts_ia
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access"
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
