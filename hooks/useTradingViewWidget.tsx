'use client';

// React
import { useEffect, useRef } from 'react';

const useTradingViewWidget = ({ scriptUrl, config }: { scriptUrl: string; config: Record<string, unknown> }) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Clean up potential duplicates (Strict Mode fix)
    const existingScript = containerRef.current.querySelector('script');
    if (existingScript) existingScript.remove();
    // We only clear scripts, we DO NOT clear the 'tradingview-widget-container__widget' div

    // 2. Create Script
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    // 3. Append script to the container
    containerRef.current.appendChild(script);

    // 4. Cleanup on unmount
    return () => {
      if (containerRef.current) {
        const scriptToRemove = containerRef.current.querySelector('script');
        if (scriptToRemove) scriptToRemove.remove();
      }
    };
  }, [config, scriptUrl]);

  return containerRef;
};

export default useTradingViewWidget;
