'use client';

import { useRouter } from 'next/navigation';
import { PROTOCOLS, ProtocolId } from './types';

const PROTOCOL_LIST = Object.values(PROTOCOLS);

export default function HomePage() {
  const router = useRouter();

  const handleStart = (protocolId: ProtocolId) => {
    router.push(`/session/${protocolId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="text-center mb-12 relative z-10">
        <h1 
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent)' }}
        >
          Psyked on Breathing
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-md mx-auto">
          Velg din pusteprotokoll og la deg guide til indre ro
        </p>
      </header>

      {/* Protocol Grid */}
      <div className="protocol-grid grid gap-4 md:gap-6 max-w-5xl w-full relative z-10">
        {PROTOCOL_LIST.map((protocol) => (
          <button
            key={protocol.id}
            onClick={() => handleStart(protocol.id)}
            className="protocol-card glass rounded-2xl p-6 text-left group cursor-pointer border-0 w-full"
            style={{ 
              background: 'var(--bg-card)',
            }}
          >
            <div className="flex flex-col h-full">
              {/* Emoji */}
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {protocol.emoji}
              </span>
              
              {/* Title */}
              <h2 
                className="text-xl md:text-2xl font-bold mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)', color: protocol.color }}
              >
                {protocol.norwegianTitle}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {protocol.englishSubtitle}
              </p>
              
              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] mb-6 flex-grow">
                {protocol.description}
              </p>
              
              {/* Start button */}
              <div 
                className="mt-auto py-2 px-4 rounded-xl text-center font-semibold transition-all duration-300 group-hover:scale-105"
                style={{ 
                  background: protocol.gradient,
                  color: protocol.id === 'søvnforberedelse' ? '#fff' : '#000',
                }}
              >
                Start
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-[var(--text-secondary)] relative z-10">
        <p>Ta et dypt pust. Slapp av. Du er i trygge hender.</p>
      </footer>
    </main>
  );
}
