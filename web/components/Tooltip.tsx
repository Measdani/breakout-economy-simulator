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
        <div className="absolute z-50 px-4 py-3 text-sm text-white rounded-xl max-w-xs whitespace-normal shadow-xl" style={{ backgroundColor: '#1a1a1a', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px', border: '1px solid #333', lineHeight: '1.5' }}>
          {text}
          <div className="absolute w-2 h-2 transform rotate-45" style={{ backgroundColor: '#1a1a1a', bottom: '100%', left: '50%', marginLeft: '-4px', border: 'solid 1px #333', borderRight: 'none', borderBottom: 'none' }}></div>
        </div>
      )}
    </div>
  );
}
