'use server';

import { validateArticle, formatArticle, getDateRange } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// Internal type for stock profile2 API response
type StockProfile = {
  name?: string;
  ticker?: string;
  exchange?: string;
};

// Internal type to carry __exchange through the mapping pipeline without using any
type FinnhubSearchResultWithExchange = FinnhubSearchResult & {
  __exchange?: string;
};

async function fetchJSON<T = unknown>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit = revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: 'no-store' };
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getNews(symbols?: string[]) {
  try {
    const { from, to } = getDateRange(5);
    const articles: RawNewsArticle[] = []; // Using any[] temporarily as RawNewsArticle might be global or needing implicit typing

    if (symbols && symbols.length > 0) {
      const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase().trim())));
      const maxRounds = 6;
      // We want to collect up to 6 articles total, round-robin style
      // This implementation fetches news for all symbols and then round-robins.
      // Optimally, we might not want to fetch for ALL if we have many, but per prompt:
      // "Loop max 6 times, round-robin through symbols. Fetch company news for each symbol."
      // Actually, if we loop 6 times and fetch inside the loop, that's many requests.
      // But let's follow the prompt's likely intent or a reasoned approach.
      // "Loop max 6 times, round-robin through symbols." -> This sounds like we iterate 1..6 and pick a symbol?
      // Or we fetch news for all symbols and then interleave them?
      // "Fetch company news for each symbol. Take one valid article per round."

      // Let's first fetch news for each symbol.
      const newsBySymbol: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            // Company news endpoint: /company-news?symbol=AAPL&from=2023-01-01&to=2023-01-05
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
            const data = await fetchJSON<RawNewsArticle[]>(url, 3600); // 1 hour cache maybe? Or no-store as per default if not specified. Prompt says "fetchJSON(url, revalidateSeconds?)".
            // Prompt says "If revalidateSeconds is passed...". It doesn't specify what to use for news.
            // I'll use 0 (no-store) for freshness or maybe a small cache.
            // Let's use no-store (undefined) to ensure fresh news, or maybe 1800 (30m).
            // Given it's a daily summary, freshness matters but 1 hour is probably fine.
            // However, to be safe and strictly follow "If revalidateSeconds is passed... Otherwise use cache: no-store", I will assume we should define revalidate strategy.
            // For now, let's stick to no-store (undefined) to be safe unless performant.

            if (Array.isArray(data)) {
              newsBySymbol[symbol] = data.filter(validateArticle);
            }
          } catch (e) {
            console.error(`Error fetching news for ${symbol}:`, e);
          }
        })
      );

      // Round robin selection
      for (let i = 0; i < maxRounds; i++) {
        const symbolIndex = i % uniqueSymbols.length;
        const symbol = uniqueSymbols[symbolIndex];
        const symbolNews = newsBySymbol[symbol];

        if (symbolNews && symbolNews.length > 0) {
          // Take the first one (most recent usually)
          const article = symbolNews.shift();
          if (article) articles.push(formatArticle(article, true, symbol));
        }
      }
    }

    // If we didn't get enough articles or no symbols, fetch general news
    if (articles.length === 0) {
      const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
      const generalNews = await fetchJSON<RawNewsArticle[]>(url, 3600); // General news can be cached longer?

      if (Array.isArray(generalNews)) {
        // Deduplicate by id/url/headline
        // Since we only have general news here, standard dedup.
        // "Deduplicate by id/url/headline. Take top 6, format them."

        const uniqueGeneral = generalNews
          .filter(validateArticle)
          .reduce((acc: RawNewsArticle[], current: RawNewsArticle) => {
            const exists = acc.find((a) => a.id === current.id || a.url === current.url || a.headline === current.headline);
            if (!exists) acc.push(current);
            return acc;
          }, [])
          .slice(0, 6)
          .map((a: RawNewsArticle) => formatArticle(a, false));

        articles.push(...uniqueGeneral);
      }
    }

    // Sort by datetime desc
    return articles
      .sort((a, b) => {
        // If datetime is undefined, use 0
        const dateB = new Date(b.datetime ?? 0).getTime();
        const dateA = new Date(a.datetime ?? 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw new Error(`Failed to fetch news: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = FINNHUB_API_KEY;

    if (!token) {
      // If no token, log and return empty to avoid throwing per requirements
      console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim() : '';
    let results: FinnhubSearchResultWithExchange[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);

      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;

            // Revalidate every hour
            const profile = await fetchJSON<StockProfile>(url, 3600);
            return { sym, profile } as { sym: string; profile: StockProfile };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null } as { sym: string; profile: StockProfile | null };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name: string | undefined = profile?.name || profile?.ticker || undefined;
          const exchange: string | undefined = profile?.exchange || undefined;
          if (!name) return undefined;

          const r: FinnhubSearchResultWithExchange = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
            // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
            // To keep pipeline simple, attach exchange via closure map stage
            // We'll reconstruct exchange when mapping to final type
            __exchange: exchange, // internal only
          };

          return r;
        })
        .filter((x): x is FinnhubSearchResultWithExchange => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = r.__exchange;
        const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
        const type = r.type || 'Stock';

        const item: StockWithWatchlistStatus = { symbol: upper, name, exchange, type, isInWatchlist: false };
        return item;
      })
      .slice(0, 15);
    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
});
