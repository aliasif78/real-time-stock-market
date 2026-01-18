// Components
import TradingViewWidget from '@/components/TradingViewWidget';

// Constants
import { HEATMAP_WIDGET_CONFIG, MARKET_DATA_WIDGET_CONFIG, TOP_STORIES_WIDGET_CONFIG } from '@/lib/constants';

const page = () => {
  const scriptUrlPrefix = 'https://s3.tradingview.com/external-embedding/embed-widget-';

  return (
    <div className="home-wrapper flex min-h-screen">
      <section className="home-section flex w-full flex-col gap-8 md:flex-row">
        <div className="md:w-1/2 xl:w-1/3">
          <TradingViewWidget title="Market Overview" scriptUrl={`${scriptUrlPrefix}market-overview.js`} config={MARKET_DATA_WIDGET_CONFIG} className="custom-chart" height={600} />
        </div>

        <div className="md:w-1/2 xl:w-2/3">
          <TradingViewWidget title="Stock Heatmap" scriptUrl={`${scriptUrlPrefix}stock-heatmap.js`} config={HEATMAP_WIDGET_CONFIG} height={600} />
        </div>
      </section>

      <section className="home-section flex w-full flex-col gap-8 md:flex-row">
        <div className="md:w-1/2 xl:w-1/3">
          <TradingViewWidget scriptUrl={`${scriptUrlPrefix}timeline.js`} config={TOP_STORIES_WIDGET_CONFIG} className="custom-chart" height={600} />
        </div>

        <div className="md:w-1/2 xl:w-2/3">
          <TradingViewWidget scriptUrl={`${scriptUrlPrefix}market-quotes.js`} config={MARKET_DATA_WIDGET_CONFIG} height={600} />
        </div>
      </section>
    </div>
  );
};

export default page;
