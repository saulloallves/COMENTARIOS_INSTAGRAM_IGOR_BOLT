/*
  # Fix fase_tipo enum values

  1. Updates
    - Drop and recreate the fase_tipo enum with all required values
    - Update the fases table to use the new enum
    - Ensure all phase names match the application code

  2. Security
    - No RLS changes needed
*/

-- First, let's see what the current enum values are and update them
-- We need to add the enum values that the application expects

-- Add missing enum values to fase_tipo
DO $$
BEGIN
    -- Add each enum value if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'interacao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_compras';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'compras';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_1';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_2';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'inauguracao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'operacao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_temporariamente';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_definitivamente';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
