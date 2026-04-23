export type ProtocolId = 
  | 'oppvåkning' 
  | 'energihenting' 
  | 'avspenning' 
  | 'avslapning' 
  | 'søvnforberedelse';

export interface BreathingPattern {
  id: string;
  name: string;
  phases: {
    inhale: number;
    holdIn?: number;
    exhale: number;
    holdOut?: number;
  };
  totalBreaths: number;
}

export interface Protocol {
  id: ProtocolId;
  title: string;
  englishSubtitle: string;
  emoji: string;
  description: string;
  pattern: BreathingPattern;
  color: string;
  gradient: string;
  frequency: number;
  glowClass: string;
}

export const PROTOCOLS: Record<ProtocolId, Protocol> = {
  oppvåkning: {
    id: 'oppvåkning',
    title: 'Wake Up',
    englishSubtitle: 'Wake Up',
    emoji: '🌅',
    description: 'Energizing morning breathing to start your day with vitality',
    pattern: {
      id: 'physiological-sigh',
      name: 'Physiological Sigh',
      phases: { inhale: 1.5, holdIn: 0, exhale: 4 },
      totalBreaths: 10,
    },
    color: '#FFB347',
    gradient: 'linear-gradient(135deg, #FF8C00 0%, #FFB347 50%, #FFD700 100%)',
    frequency: 432,
    glowClass: 'glow-wake-up',
  },
  energihenting: {
    id: 'energihenting',
    title: 'Energy Boost',
    englishSubtitle: 'Energy Boost',
    emoji: '⚡',
    description: 'Quick energy lift when you need an instant boost',
    pattern: {
      id: 'energizing',
      name: 'Energizing Breath',
      phases: { inhale: 2, holdIn: 0, exhale: 2 },
      totalBreaths: 15,
    },
    color: '#BFFF00',
    gradient: 'linear-gradient(135deg, #7FFF00 0%, #BFFF00 50%, #DFFF00 100%)',
    frequency: 480,
    glowClass: 'glow-energy',
  },
  avspenning: {
    id: 'avspenning',
    title: 'Decompression',
    englishSubtitle: 'Decompression',
    emoji: '🌿',
    description: 'Stress relief breathing after a long day',
    pattern: {
      id: 'box-breathing',
      name: 'Box Breathing',
      phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
      totalBreaths: 8,
    },
    color: '#20B2AA',
    gradient: 'linear-gradient(135deg, #008B8B 0%, #20B2AA 50%, #40E0D0 100%)',
    frequency: 420,
    glowClass: 'glow-decompression',
  },
  avslapning: {
    id: 'avslapning',
    title: 'Relaxation',
    englishSubtitle: 'Relaxation',
    emoji: '🧘',
    description: 'Deep relaxation for calm and inner peace',
    pattern: {
      id: 'relaxing',
      name: 'Relaxing Breath',
      phases: { inhale: 4, holdIn: 7, exhale: 8 },
      totalBreaths: 6,
    },
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #6B21A8 0%, #8B5CF6 50%, #A78BFA 100%)',
    frequency: 396,
    glowClass: 'glow-relaxation',
  },
  søvnforberedelse: {
    id: 'søvnforberedelse',
    title: 'Sleep Prep',
    englishSubtitle: 'Sleep Prep',
    emoji: '🌙',
    description: 'Calming breathing to prepare for restful sleep',
    pattern: {
      id: '4-7-8',
      name: '4-7-8 Breathing',
      phases: { inhale: 4, holdIn: 7, exhale: 8 },
      totalBreaths: 6,
    },
    color: '#4C1D95',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #6D28D9 100%)',
    frequency: 174,
    glowClass: 'glow-sleep',
  },
};

export type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
