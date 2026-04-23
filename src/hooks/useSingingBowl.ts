'use client';

import { useCallback, useRef } from 'react';

export function useSingingBowl() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const createBowlTone = useCallback((frequency: number) => {
    const ctx = getAudioContext();
    
    // Create oscillator for fundamental frequency
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Set frequency with slight detuning for rich harmonic content
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = 'sine';
    
    // Add harmonics for singing bowl richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(frequency * 2.5, ctx.currentTime);
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, ctx.currentTime);
    
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.frequency.setValueAtTime(frequency * 3.2, ctx.currentTime);
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0.15, ctx.currentTime);
    
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Connect
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    gainNodeRef.current = masterGain;
    oscillatorRef.current = oscillator;
    
    return { oscillator, osc2, osc3, masterGain };
  }, [getAudioContext]);

  const strike = useCallback((frequency: number) => {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Create a new bowl tone for each strike
    const { oscillator, osc2, osc3, masterGain } = createBowlTone(frequency);
    
    oscillator.start();
    osc2.start();
    osc3.start();
    
    // Bowl attack - quick rise
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
    
    // Sustain with slow decay
    masterGain.gain.exponentialRampToValueAtTime(0.25, now + 0.5);
    masterGain.gain.exponentialRampToValueAtTime(0.15, now + 1.5);
    
    // Let it ring
    oscillator.stop(now + 2);
    osc2.stop(now + 2);
    osc3.stop(now + 2);
    
    return masterGain;
  }, [getAudioContext, createBowlTone]);

  const sustain = useCallback((gain: number = 0.15) => {
    if (gainNodeRef.current) {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(now);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
      gainNodeRef.current.gain.linearRampToValueAtTime(gain, now + 0.3);
    }
  }, [getAudioContext]);

  const fadeOut = useCallback((duration: number = 1.5) => {
    if (gainNodeRef.current) {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(now);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }
  }, [getAudioContext]);

  const stop = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }
  }, []);

  return { strike, sustain, fadeOut, stop };
}
