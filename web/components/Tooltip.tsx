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
        <div className="absolute z-50 px-6 py-4 text-sm text-white rounded-xl pointer-events-none" style={{ maxWidth: '700px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px', border: '2px solid rgba(0, 217, 255, 0.6)', lineHeight: '1.6', overflow: 'visible', boxShadow: '0 15px 50px rgba(0, 217, 255, 0.25), 0 0 30px rgba(0, 217, 255, 0.2), inset 0 1px 0 rgba(0, 217, 255, 0.1)', whiteSpace: 'normal' }}>
          {text}
          <div className="absolute w-3 h-3 transform rotate-45" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)', bottom: '100%', left: '50%', marginLeft: '-6px', border: 'solid 2px rgba(0, 217, 255, 0.6)', borderRight: 'none', borderTop: 'none' }}></div>
        </div>
      )}
    </div>
  );
}
