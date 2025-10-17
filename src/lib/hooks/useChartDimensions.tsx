import { useState, useEffect, useRef } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
  isReady: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Custom hook to ensure chart containers have proper dimensions before rendering
 */
export function useChartDimensions(minWidth: number = 250, minHeight: number = 200): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
    isReady: false,
    containerRef: useRef<HTMLDivElement>(null)
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(rect.width || 0, minWidth);
        const height = Math.max(rect.height || 0, minHeight);
        
        setDimensions({
          width,
          height,
          isReady: width > 0 && height > 0,
          containerRef
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Create ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback timeout to ensure dimensions are set
    const timeout = setTimeout(updateDimensions, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [minWidth, minHeight]);

  return { ...dimensions, containerRef };
}
