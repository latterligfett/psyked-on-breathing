'use client';

import { useEffect, useRef, useState } from 'react';

interface ClickEvent {
  id: number;
  element: string;
  x: number;
  y: number;
  timestamp: Date;
}

export default function ClickLogger() {
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const idRef = useRef(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementInfo = getElementInfo(target);
      
      setClicks(prev => {
        const newClick: ClickEvent = {
          id: idRef.current++,
          element: elementInfo,
          x: e.clientX,
          y: e.clientY,
          timestamp: new Date(),
        };
        const updated = [newClick, ...prev].slice(0, 20);
        return updated;
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getElementInfo = (el: HTMLElement): string => {
    const tag = el.tagName.toLowerCase();
    const classes = el.className ? `.${el.className.split(' ').filter(Boolean).join('.')}` : '';
    const id = el.id ? `#${el.id}` : '';
    const text = el.textContent?.slice(0, 30).trim() || '';
    const dataAttr = el.dataset?.action || '';
    
    return [tag, id, classes, dataAttr, text].filter(Boolean).join(' ') || tag;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-mono opacity-60 hover:opacity-100 transition-opacity"
      >
        📊 Log
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 flex flex-col rounded-xl overflow-hidden shadow-2xl"
      style={{ 
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-move"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>
          Click Log ({clicks.length})
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-card)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            onClick={() => setClicks([])}
            className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-card)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Clear
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-card)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Click list */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clicks.length === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Click anywhere in the app...
            </div>
          ) : (
            clicks.map(click => (
              <div 
                key={click.id}
                className="text-xs font-mono p-2 rounded"
                style={{ 
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>
                    {click.element}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {formatTime(click.timestamp)}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  x: {click.x} · y: {click.y}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
