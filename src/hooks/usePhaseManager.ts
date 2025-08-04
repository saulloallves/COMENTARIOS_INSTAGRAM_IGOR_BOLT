import { useState, useCallback, useEffect } from 'react';
import { Unit, Phase, BehaviorGroup, UnitBehaviorConfig, PhaseTransitionLog } from '../types';
import { useBusinessRules } from './useBusinessRules';
import { useSupabaseData } from './useSupabaseData';

export const usePhaseManager = () => {
  const { 
    units, 
    phases, 
    behaviorGroups,
    updateUnit,
    createUnit: createUnitInSupabase
  } = useSupabaseData();
  
  const [phaseTransitionLogs, setPhaseTransitionLogs] = useState<PhaseTransitionLog[]>([]);
  
  const { activatePhaseDocumentation } = useBusinessRules();

  // Get behavior group for a specific phase
  const getBehaviorGroupForPhase = useCallback((phaseId: string): BehaviorGroup | null => {
    const supabaseBehaviorGroup = behaviorGroups.find(bg => bg.fase_id === phaseId);
    if (!supabaseBehaviorGroup) return null;
    
    // Convert Supabase format to internal format
    return {
      id: supabaseBehaviorGroup.id,
      phaseId: supabaseBehaviorGroup.fase_id,
      name: `Grupo ${supabaseBehaviorGroup.descricao}`,
      description: supabaseBehaviorGroup.descricao,
      allowedToRespond: supabaseBehaviorGroup.permitido_responder,
      permissions: supabaseBehaviorGroup.escopo?.permissoes || [],
      restrictions: supabaseBehaviorGroup.escopo?.restricoes || [],
      scope: {
        allowedQuestions: supabaseBehaviorGroup.escopo?.perguntas_permitidas || [],
        automatedResponses: supabaseBehaviorGroup.escopo?.respostas_automaticas || false,
        responseDelay: supabaseBehaviorGroup.escopo?.delay_resposta || 0,
        confidenceThreshold: supabaseBehaviorGroup.escopo?.limite_confianca || 0.8
      }
    };
  }, [behaviorGroups]);

  // Get unit behavior config
  const getUnitBehaviorConfig = useCallback((unitId: string): UnitBehaviorConfig | null => {
    // For now, return null as we'll implement this later when needed
    return null;
  }, []);

  // Check if unit can respond based on current phase and behavior
  const canUnitRespond = useCallback((unitId: string): boolean => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return false;

    const behaviorGroup = getBehaviorGroupForPhase(unit.fase_atual_id);
    if (!behaviorGroup) return false;

    const unitConfig = getUnitBehaviorConfig(unitId);
    
    // Check for unit-specific overrides
    if (unitConfig?.overrides?.allowedToRespond !== undefined) {
      return unitConfig.overrides.allowedToRespond;
    }

    return behaviorGroup.allowedToRespond;
  }, [units, getBehaviorGroupForPhase, getUnitBehaviorConfig]);

  // Log phase transition
  const logPhaseTransition = useCallback((
    unitId: string,
    fromPhaseId: string,
    toPhaseId: string,
    triggeredBy: string,
    reason: string,
    success: boolean,
    errorMessage?: string
  ) => {
    const log: PhaseTransitionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      unitId,
      fromPhaseId,
      toPhaseId,
      timestamp: new Date().toISOString(),
      triggeredBy,
      reason,
      success,
      errorMessage
    };

    setPhaseTransitionLogs(prev => [log, ...prev]);
    console.log('Phase Transition:', log);
  }, []);

  // Transition unit to new phase
  const transitionUnitPhase = useCallback(async (
    unitId: string,
    newPhaseId: string,
    triggeredBy: string = 'system',
    reason: string = 'Manual transition'
  ): Promise<boolean> => {
    try {
      const unit = units.find(u => u.id === unitId);
      if (!unit) {
        throw new Error(`Unit with ID ${unitId} not found`);
      }

      const newPhase = phases.find(p => p.id === newPhaseId);
      if (!newPhase) {
        throw new Error(`Phase with ID ${newPhaseId} not found`);
      }

      const behaviorGroup = getBehaviorGroupForPhase(newPhaseId);
      if (!behaviorGroup) {
        console.warn(`No behavior group found for phase ${newPhaseId}, but continuing with transition`);
      }

      const oldPhaseId = unit.fase_atual_id;

      // Update unit to transitioning state
      const transitionResult = await updateUnit(unitId, { status: 'transicao' });
      if (!transitionResult.success) {
        throw new Error(`Failed to set unit to transitioning state: ${transitionResult.error}`);
      }

      // Simulate transition delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update unit phase
      const updateResult = await updateUnit(unitId, {
        fase_atual_id: newPhaseId,
        status: 'ativa'
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update unit');
      }

      // Activate phase-specific documentation
      const activatedDocs = activatePhaseDocumentation(unitId, newPhaseId);
      console.log(`Phase transition: Activated ${activatedDocs.length} documents for unit ${unitId}`);

      // Log successful transition
      logPhaseTransition(unitId, oldPhaseId, newPhaseId, triggeredBy, reason, true);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Reset unit status on error - use try/catch to handle potential enum errors
      try {
        await updateUnit(unitId, { status: 'erro' });
      } catch (statusError) {
        console.warn('Failed to set error status, setting to inactive instead');
        await updateUnit(unitId, { status: 'inativa' });
      }

      // Log failed transition
      logPhaseTransition(unitId, '', newPhaseId, triggeredBy, reason, false, errorMessage);

      console.error('Phase transition failed:', errorMessage);
      return false;
    }
  }, [units, phases, getBehaviorGroupForPhase, logPhaseTransition, updateUnit, activatePhaseDocumentation]);

  // Register new unit with initial phase
  const registerNewUnit = useCallback(async (
    name: string,
    code: string,
    location: string
  ): Promise<any | null> => {
    try {
      // Validate required fields
      if (!name.trim() || !code.trim() || !location.trim()) {
        throw new Error('All fields are required for unit registration');
      }

      // Check for duplicate code
      const existingUnit = units.find(u => u.codigo === code);
      if (existingUnit) {
        throw new Error(`Unit with code ${code} already exists`);
      }

      // Get initial phase (interaction)
      const initialPhase = phases.find(p => p.nome === 'interacao');
      if (!initialPhase) {
        throw new Error('Initial phase "interacao" not found');
      }

      // Validate behavior group exists for initial phase
      const behaviorGroup = getBehaviorGroupForPhase(initialPhase.id);
      if (!behaviorGroup) {
        console.warn('No behavior group configured for initial phase, but continuing with registration');
      }

      const newUnitData = {
        nome: name.trim(),
        codigo: code.trim(),
        localizacao: location.trim(),
        fase_atual_id: initialPhase.id,
        status: 'ativa' as const
      };

      // Create unit in Supabase
      const result = await createUnitInSupabase(newUnitData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create unit');
      }

      // Log unit registration
      logPhaseTransition(
        result.data.id,
        '',
        initialPhase.id,
        'system',
        'Unit registration',
        true
      );

      console.log('Unit registered successfully:', result.data);
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Unit registration failed:', errorMessage);
      return null;
    }
  }, [units, phases, getBehaviorGroupForPhase, logPhaseTransition, createUnitInSupabase]);

  return {
    units,
    phases,
    behaviorGroups,
    phaseTransitionLogs,
    canUnitRespond,
    transitionUnitPhase,
    registerNewUnit,
    getBehaviorGroupForPhase,
    getUnitBehaviorConfig
  };
};
