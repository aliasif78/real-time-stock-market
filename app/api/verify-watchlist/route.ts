import { NextResponse } from 'next/server';
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions';
import { getNews } from '@/lib/actions/finnhub.actions';

export async function GET() {
  try {
    // 1. Test Watchlist Actions (might return empty if no user)
    const symbols = await getWatchlistSymbolsByEmail('test@example.com'); // Expect empty or specific if user exists

    // 2. Test Finnhub Actions with symbols
    const newsWithSymbols = await getNews(['AAPL', 'MSFT']);

    // 3. Test Finnhub Actions without symbols (General news)
    const newsGeneral = await getNews([]);

    return NextResponse.json({
      watchlistSymbols: symbols,
      newsWithSymbolsCount: newsWithSymbols.length,
      newsWithSymbolsSample: newsWithSymbols.slice(0, 1),
      newsGeneralCount: newsGeneral.length,
      newsGeneralSample: newsGeneral.slice(0, 1),
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
