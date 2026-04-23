'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROTOCOLS, Phase } from '../../types';
import { useSingingBowl } from '../../../hooks/useSingingBowl';

const PHASE_LABELS: Record<Phase, { no: string; en: string }> = {
  inhale: { no: 'Innhale', en: 'Breathe In' },
  holdIn: { no: 'Hold', en: 'Hold' },
  exhale: { no: 'Pust ut', en: 'Breathe Out' },
  holdOut: { no: 'Hold', en: 'Hold' },
};

export default function SessionPage({ params }: { params: Promise<{ protocol: string }> }) {
  const { protocol: protocolId } = use(params);
  const router = useRouter();
  const protocol = PROTOCOLS[protocolId as keyof typeof PROTOCOLS];
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [breathCount, setBreathCount] = useState(1);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const circleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  
  const { strike, fadeOut } = useSingingBowl();
  
  if (!protocol) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-[var(--accent)] mb-4">Protocol not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-[var(--bg-card)] text-white"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }
  
  const { phases, totalBreaths } = protocol.pattern;
  
  const getNextPhase = (currentPhase: Phase): Phase => {
    switch (currentPhase) {
      case 'inhale': return phases.holdIn ? 'holdIn' : 'exhale';
      case 'holdIn': return 'exhale';
      case 'exhale': return phases.holdOut ? 'holdOut' : 'inhale';
      case 'holdOut': return 'inhale';
    }
  };
  
  const getPhaseDuration = (p: Phase): number => {
    switch (p) {
      case 'inhale': return phases.inhale;
      case 'holdIn': return phases.holdIn || 0;
      case 'exhale': return phases.exhale;
      case 'holdOut': return phases.holdOut || 0;
    }
  };
  
  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    setTotalTime(elapsed);
    
    const currentPhaseDuration = getPhaseDuration(phase);
    const phaseElapsed = (now - phaseStartTimeRef.current) / 1000;
    
    if (phaseElapsed >= currentPhaseDuration) {
      const nextPhase = getNextPhase(phase);
      const newBreathCount = nextPhase === 'inhale' ? breathCount + 1 : breathCount;
      
      // Check if session is complete
      if (newBreathCount > totalBreaths) {
        setSessionComplete(true);
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      
      phaseStartTimeRef.current = now;
      setPhase(nextPhase);
      setBreathCount(newBreathCount);
      
      // Play bowl at start of inhale
      if (nextPhase === 'inhale') {
        strike(protocol.frequency);
      }
      
      // Fade during exhale
      if (phase === 'exhale') {
        fadeOut(0.8);
      }
      
      // Update circle animation
      if (circleRef.current) {
        circleRef.current.style.transform = '';
        circleRef.current.className = 'breathe-circle';
        
        if (nextPhase === 'inhale') {
          circleRef.current.classList.add('inhaling');
          circleRef.current.style.setProperty('--inhale-duration', `${phases.inhale}s`);
          circleRef.current.style.animation = `breatheIn ${phases.inhale}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        } else if (nextPhase === 'exhale') {
          circleRef.current.classList.add('exhaling');
          circleRef.current.style.setProperty('--exhale-duration', `${phases.exhale}s`);
          circleRef.current.style.animation = `breatheOut ${phases.exhale}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        } else {
          circleRef.current.classList.add('holding');
        }
      }
    }
    
    setPhaseTime(Math.max(0, currentPhaseDuration - phaseElapsed));
  }, [phase, breathCount, phases, totalBreaths, protocol.frequency, strike, fadeOut]);
  
  const startSession = () => {
    setSessionComplete(false);
    startTimeRef.current = Date.now();
    phaseStartTimeRef.current = Date.now();
    setIsActive(true);
    setPhase('inhale');
    setBreathCount(1);
    setPhaseTime(phases.inhale);
    
    // Initial bowl strike
    strike(protocol.frequency);
    
    timerRef.current = setInterval(tick, 50);
  };
  
  const stopSession = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    fadeOut(0.5);
    router.push('/');
  };
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((breathCount - 1) / totalBreaths) * 100;
  
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `var(--bg-base)` }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${protocol.color}22 0%, transparent 50%)`,
          }}
        />
      </div>
      
      {/* Back button */}
      <button
        onClick={stopSession}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-20 px-4 py-2 rounded-xl glass text-sm font-medium hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        ← Tilbake
      </button>
      
      {/* Session content */}
      <div className="flex flex-col items-center relative z-10">
        {/* Protocol title */}
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">{protocol.emoji}</span>
          <h1 
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: protocol.color }}
          >
            {protocol.norwegianTitle}
          </h1>
        </div>
        
        {/* Breathing circle */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
          {/* Outer glow */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-50"
            style={{ background: protocol.gradient }}
          />
          
          {/* Main circle */}
          <div 
            ref={circleRef}
            className="breathe-circle absolute inset-8 rounded-full"
            style={{ 
              background: protocol.gradient,
              boxShadow: `0 0 60px ${protocol.color}66, 0 0 100px ${protocol.color}33`,
            }}
          />
          
          {/* Phase indicator inside circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {PHASE_LABELS[phase].no}
            </span>
            <span className="text-sm text-white/70 mt-2">
              {Math.ceil(phaseTime)}s
            </span>
          </div>
        </div>
        
        {/* Timer */}
        <div className="text-center mb-4">
          <span className="text-3xl font-light text-[var(--text-secondary)]">
            {formatTime(totalTime)}
          </span>
        </div>
        
        {/* Progress */}
        <div className="w-64 md:w-80 mb-8">
          <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
            <span>Pust {breathCount} av {totalBreaths}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`, 
                background: protocol.gradient,
              }}
            />
          </div>
        </div>
        
        {/* Start/Stop button */}
        {!isActive && !sessionComplete && (
          <button
            onClick={startSession}
            className="py-4 px-12 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
            style={{ 
              background: protocol.gradient,
              color: protocol.id === 'søvnforberedelse' ? '#fff' : '#000',
              boxShadow: `0 0 30px ${protocol.color}66`,
            }}
          >
            Start Økt
          </button>
        )}
        
        {isActive && (
          <button
            onClick={stopSession}
            className="py-3 px-8 rounded-xl text-base font-medium glass hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            Avslutt
          </button>
        )}
        
        {/* Session complete */}
        {sessionComplete && (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl block mb-4">✨</span>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)', color: protocol.color }}
              >
                Fantastisk!
              </h2>
              <p className="text-[var(--text-secondary)]">
                Du fullførte økten
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="py-3 px-8 rounded-xl text-base font-medium glass hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              Tilbake til forsiden
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
