import { useCallback } from 'react';
import { useSupabaseData } from './useSupabaseData';

export const useBusinessRules = () => {
  const { documentationsByPhase, updateDocumentation } = useSupabaseData();

  // Activate phase-specific documentation for a unit
  const activatePhaseDocumentation = useCallback((unitId: string, phaseId: string) => {
    try {
      // Find documentations associated with this phase
      const phaseDocumentations = documentationsByPhase.filter(
        dp => dp.fase_id === phaseId
      );

      console.log(`Activating ${phaseDocumentations.length} documentations for unit ${unitId} in phase ${phaseId}`);

      // Return the list of activated documentation IDs
      return phaseDocumentations.map(dp => dp.documentacao_id);
    } catch (error) {
      console.error('Error activating phase documentation:', error);
      return [];
    }
  }, [documentationsByPhase]);

  // Validate phase transition rules
  const validatePhaseTransition = useCallback((fromPhaseId: string, toPhaseId: string) => {
    // Basic validation - can be extended with business rules
    if (!fromPhaseId || !toPhaseId) {
      return { valid: false, reason: 'Invalid phase IDs' };
    }

    if (fromPhaseId === toPhaseId) {
      return { valid: false, reason: 'Cannot transition to the same phase' };
    }

    return { valid: true, reason: 'Transition allowed' };
  }, []);

  // Check if unit meets requirements for phase
  const checkPhaseRequirements = useCallback((unitId: string, phaseId: string) => {
    // Placeholder for business logic to check if unit meets phase requirements
    // This could include checking completion of previous phase tasks, etc.
    return { meets: true, missingRequirements: [] };
  }, []);

  return {
    activatePhaseDocumentation,
    validatePhaseTransition,
    checkPhaseRequirements
  };
};
