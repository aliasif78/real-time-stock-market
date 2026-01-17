// Components
import TradingViewWidget from '@/components/TradingViewWidget';

// Constants
import { MARKET_DATA_WIDGET_CONFIG } from '@/lib/constants';

const page = () => {
  return (
    <div className="home-wrapper flex min-h-screen">
      <section className="home-section grid w-full gap-8">
        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget title="Market Overview" scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" config={MARKET_DATA_WIDGET_CONFIG} className="custom-chart" />
        </div>
      </section>
    </div>
  );
};

export default page;
