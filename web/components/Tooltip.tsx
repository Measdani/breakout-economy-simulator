'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div className="absolute z-50 px-5 py-4 text-sm text-white rounded-xl max-w-xs whitespace-normal pointer-events-none" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px', border: '1px solid rgba(0, 217, 255, 0.3)', lineHeight: '1.6', overflow: 'visible', boxShadow: '0 10px 40px rgba(0, 217, 255, 0.15), 0 0 20px rgba(0, 217, 255, 0.1)' }}>
          {text}
          <div className="absolute w-2 h-2 transform rotate-45" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', bottom: '100%', left: '50%', marginLeft: '-4px', border: 'solid 1px rgba(0, 217, 255, 0.3)', borderRight: 'none', borderTop: 'none' }}></div>
        </div>
      )}
    </div>
  );
}
