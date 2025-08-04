/*
  # Add missing enum values to fase_tipo

  1. Enum Updates
    - Add all missing values to fase_tipo enum
    - Must be in separate transaction from usage

  Note: New enum values must be committed before they can be used in the same session.
*/

-- Add missing enum values one by one
DO $$ 
BEGIN
    -- Add compras if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'compras' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'compras';
    END IF;
    
    -- Add pre_inauguracao_semana_1 if not exists  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pre_inauguracao_semana_1' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'pre_inauguracao_semana_1';
    END IF;
    
    -- Add pre_inauguracao_semana_2 if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pre_inauguracao_semana_2' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'pre_inauguracao_semana_2';
    END IF;
    
    -- Add inauguracao if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inauguracao' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'inauguracao';
    END IF;
    
    -- Add operacao if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'operacao' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'operacao';
    END IF;
    
    -- Add loja_fechada_temporariamente if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'loja_fechada_temporariamente' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'loja_fechada_temporariamente';
    END IF;
    
    -- Add loja_fechada_definitivamente if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'loja_fechada_definitivamente' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fase_tipo')) THEN
        ALTER TYPE fase_tipo ADD VALUE 'loja_fechada_definitivamente';
    END IF;
END $$;
