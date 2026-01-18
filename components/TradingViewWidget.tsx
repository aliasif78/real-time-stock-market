'use client';

// Next Js
import { memo } from 'react';

// Utils
import { cn } from '@/lib/utils';

// Hooks
import useTradingViewWidget from '@/hooks/useTradingViewWidget';

// Types
interface TradingViewProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewProps) => {
  // Hooks
  const containerRef = useTradingViewWidget({ scriptUrl, config });

  return (
    <div className="w-full">
      {title && <h3 className="mb-5 text-2xl font-semibold text-gray-100">{title}</h3>}

      <div className={cn('tradingview-widget-container', className)} ref={containerRef}>
        <div className="tradingview-widget-container__widget" style={{ height, width: '100%' }} />
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
