/*
  # Update fase_tipo enum with all required phase values

  1. Enum Updates
    - Add all 9 phase types that the application expects
    - Use ALTER TYPE to safely add new enum values
    - Handle cases where values might already exist

  2. Phase Types Added
    - interacao
    - pre_compras
    - compras
    - pre_inauguracao_semana_1
    - pre_inauguracao_semana_2
    - inauguracao
    - operacao
    - loja_fechada_temporariamente
    - loja_fechada_definitivamente
*/

-- Add enum values one by one to handle existing values gracefully
DO $$ 
BEGIN
    -- Add interacao if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'interacao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add pre_compras if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_compras';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add compras if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'compras';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add pre_inauguracao_semana_1 if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_1';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add pre_inauguracao_semana_2 if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'pre_inauguracao_semana_2';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add inauguracao if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'inauguracao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add operacao if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'operacao';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add loja_fechada_temporariamente if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_temporariamente';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add loja_fechada_definitivamente if it doesn't exist
    BEGIN
        ALTER TYPE fase_tipo ADD VALUE IF NOT EXISTS 'loja_fechada_definitivamente';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
