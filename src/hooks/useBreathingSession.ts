'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BreathingPattern, Phase } from '../app/types';

export interface BreathingState {
  phase: Phase;
  phaseTime: number;
  totalTime: number;
  breathCount: number;
  isActive: boolean;
}

export function useBreathingSession(pattern: BreathingPattern) {
  const [state, setState] = useState<BreathingState>({
    phase: 'inhale',
    phaseTime: pattern.phases.inhale,
    totalTime: 0,
    breathCount: 1,
    isActive: false,
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  const getNextPhase = useCallback((currentPhase: Phase): Phase => {
    const { phases } = pattern;
    switch (currentPhase) {
      case 'inhale':
        return phases.holdIn ? 'holdIn' : 'exhale';
      case 'holdIn':
        return 'exhale';
      case 'exhale':
        return phases.holdOut ? 'holdOut' : 'inhale';
      case 'holdOut':
        return 'inhale';
    }
  }, [pattern]);
  
  const getPhaseDuration = useCallback((phase: Phase): number => {
    const { phases } = pattern;
    switch (phase) {
      case 'inhale': return phases.inhale;
      case 'holdIn': return phases.holdIn || 0;
      case 'exhale': return phases.exhale;
      case 'holdOut': return phases.holdOut || 0;
    }
  }, [pattern]);
  
  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    setState(prev => {
      const phaseElapsed = (now - phaseStartTimeRef.current) / 1000;
      const phaseDuration = getPhaseDuration(prev.phase);
      
      if (phaseElapsed >= phaseDuration) {
        const nextPhase = getNextPhase(prev.phase);
        const newBreathCount = nextPhase === 'inhale' ? prev.breathCount + 1 : prev.breathCount;
        
        // Check if session is complete
        if (nextPhase === 'inhale' && newBreathCount > pattern.totalBreaths) {
          return { ...prev, isActive: false };
        }
        
        phaseStartTimeRef.current = now;
        
        return {
          ...prev,
          phase: nextPhase,
          phaseTime: getPhaseDuration(nextPhase),
          breathCount: newBreathCount > pattern.totalBreaths ? prev.breathCount : newBreathCount,
          totalTime: elapsed,
        };
      }
      
      return {
        ...prev,
        phaseTime: phaseDuration - phaseElapsed,
        totalTime: elapsed,
      };
    });
  }, [getNextPhase, getPhaseDuration, pattern.totalBreaths]);
  
  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    phaseStartTimeRef.current = Date.now();
    
    setState({
      phase: 'inhale',
      phaseTime: pattern.phases.inhale,
      totalTime: 0,
      breathCount: 1,
      isActive: true,
    });
    
    timerRef.current = setInterval(tick, 50);
  }, [clearTimer, tick, pattern.phases.inhale]);
  
  const stop = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isActive: false }));
  }, [clearTimer]);
  
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);
  
  return {
    state,
    start,
    stop,
  };
}
