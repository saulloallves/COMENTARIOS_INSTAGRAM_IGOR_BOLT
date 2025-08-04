import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AITestResult, Unit, BehaviorGroup, UnitBehaviorConfig } from '../types';

export const useAITesting = () => {
  const [testResults, setTestResults] = useState<AITestResult[]>([]);
  const [isUnitBeingTested, setIsUnitBeingTested] = useState<Set<string>>(new Set());

  // Test AI for a specific unit
  const testAI = useCallback(async (
    unit: Unit,
    behaviorGroup: BehaviorGroup,
    unitConfig: UnitBehaviorConfig | null,
    query: string
  ) => {
    const unitId = unit.id;
    setIsUnitBeingTested(prev => new Set([...prev, unitId]));

    try {
      const startTime = Date.now();
      
      // Call AI service to generate response
      const aiResponse = await aiService.generateResponse(unitId, query);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Create test result
      const testResult: AITestResult = {
        unitId: unit.id,
        phaseId: unit.currentPhaseId,
        query,
        response: aiResponse.content,
        responseTime,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        behaviorGroupUsed: behaviorGroup.name,
        timestamp: new Date().toISOString(),
        success: true
      };

      // Add to test results
      setTestResults(prev => [testResult, ...prev]);

      return testResult;
    } catch (error) {
      console.error('AI test failed:', error);
      
      // Create error test result
      const errorResult: AITestResult = {
        unitId: unit.id,
        phaseId: unit.currentPhaseId,
        query,
        response: '',
        responseTime: 0,
        confidence: 0,
        sources: [],
        behaviorGroupUsed: behaviorGroup.name,
        timestamp: new Date().toISOString(),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setTestResults(prev => [errorResult, ...prev]);
      throw error;
    } finally {
      setIsUnitBeingTested(prev => {
        const newSet = new Set(prev);
        newSet.delete(unitId);
        return newSet;
      });
    }
  }, []);

  // Clear all test results
  const clearTestResults = useCallback(() => {
    setTestResults([]);
  }, []);

  // Check if a specific unit is being tested
  const isUnitTesting = useCallback((unitId: string) => {
    return isUnitBeingTested.has(unitId);
  }, [isUnitBeingTested]);

  return {
    testResults,
    testAI,
    isUnitBeingTested: isUnitTesting,
    clearTestResults
  };
};
