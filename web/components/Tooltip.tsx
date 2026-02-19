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
        <div className="absolute z-50 px-3 py-2 text-sm text-white rounded-lg max-w-sm whitespace-normal pointer-events-none shadow-lg" style={{ backgroundColor: '#000000', top: '-90px', left: '50%', transform: 'translateX(-50%)' }}>
          {text}
          <div className="absolute w-2 h-2 transform rotate-45" style={{ backgroundColor: '#000000', bottom: '-4px', left: '50%', marginLeft: '-4px' }}></div>
        </div>
      )}
    </div>
  );
}
