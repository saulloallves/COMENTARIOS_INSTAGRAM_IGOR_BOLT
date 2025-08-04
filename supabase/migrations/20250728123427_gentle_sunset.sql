/*
  # Add missing enum values to fase_tipo

  1. Enum Updates
    - Add all missing values to fase_tipo enum
    - Must be in separate transaction from usage

  2. Safety
    - Uses IF NOT EXISTS equivalent for enum values
    - Safe to run multiple times
*/

-- Add missing enum values one by one
-- Note: Each ALTER TYPE must be in its own statement for PostgreSQL

DO $$ 
BEGIN
    -- Add compras if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'compras' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'compras';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add pre_inauguracao_semana_1 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pre_inauguracao_semana_1' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'pre_inauguracao_semana_1';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add pre_inauguracao_semana_2 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pre_inauguracao_semana_2' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'pre_inauguracao_semana_2';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add inauguracao if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'inauguracao' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'inauguracao';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add operacao if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'operacao' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'operacao';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add loja_fechada_temporariamente if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'loja_fechada_temporariamente' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'loja_fechada_temporariamente';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add loja_fechada_definitivamente if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'loja_fechada_definitivamente' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'loja_fechada_definitivamente';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add pos_compras if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pos_compras' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'pos_compras';
    END IF;
END $$;

DO $$ 
BEGIN
    -- Add fidelizacao if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'fidelizacao' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')
    ) THEN
        ALTER TYPE fase_tipo ADD VALUE 'fidelizacao';
    END IF;
END $$;
