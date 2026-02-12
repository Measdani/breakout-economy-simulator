'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for smoothly animating number changes
 * Uses requestAnimationFrame for 60fps performance
 *
 * @param target - The target number to animate to
 * @param duration - Animation duration in milliseconds (default: 800ms)
 * @param formatter - Optional formatting function for display
 * @returns Formatted animated number string
 */
export function useAnimatedNumber(
  target: number,
  duration: number = 800,
  formatter?: (value: number) => string
): string {
  const [displayValue, setDisplayValue] = useState(target);
  const startValueRef = useRef(target);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any in-progress animation
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Reset start point to current display value for smooth transitions
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    // Animation loop using requestAnimationFrame
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: ease-out cubic for natural deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValueRef.current + (target - startValueRef.current) * easeOutCubic;
      setDisplayValue(currentValue);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount or target change
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [target, duration]);

  // Apply formatter if provided, otherwise return raw number
  return formatter ? formatter(displayValue) : displayValue.toFixed(2);
}

/**
 * Preset formatters for common use cases
 */
export const numberFormatters = {
  billions: (value: number) => {
    return `${(value / 1e9).toFixed(1)}B`;
  },

  trillions: (value: number) => {
    return `${(value / 1e12).toFixed(2)}T`;
  },

  currency: (value: number) => {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  },

  percent: (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  },
};
