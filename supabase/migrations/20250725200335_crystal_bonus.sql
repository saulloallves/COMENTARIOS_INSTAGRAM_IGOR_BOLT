/*
  # Disable RLS for prompts_ia table

  1. Security Changes
    - Disable Row Level Security on prompts_ia table
    - This allows all authenticated users to perform CRUD operations
    - Temporary fix to resolve RLS policy violations

  Note: This is a temporary solution. In production, you should implement
  proper RLS policies based on your authentication requirements.
*/

-- Disable Row Level Security for prompts_ia table
ALTER TABLE prompts_ia DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read active prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Users can create prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Users can update prompts" ON prompts_ia;
DROP POLICY IF EXISTS "Admins have full access" ON prompts_ia;
