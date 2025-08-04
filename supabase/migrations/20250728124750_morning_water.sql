/*
  # Fix status_unidade enum to include missing values

  1. Enum Updates
    - Add 'transicao' and 'erro' values to status_unidade enum
    - These values are used by the application but missing from database

  2. Safety
    - Check if values already exist before adding
    - Use safe DO blocks to prevent errors
*/

-- Add 'transicao' status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'transicao' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_unidade')
  ) THEN
    ALTER TYPE status_unidade ADD VALUE 'transicao';
  END IF;
END $$;

-- Add 'erro' status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'erro' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_unidade')
  ) THEN
    ALTER TYPE status_unidade ADD VALUE 'erro';
  END IF;
END $$;
