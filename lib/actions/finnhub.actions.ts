'use server';

import { validateArticle, formatArticle, getDateRange } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchJSON(url: string, revalidateSeconds?: number) {
  const options: RequestInit = revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : { cache: 'no-store' };

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  return res.json();
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
            const data = await fetchJSON(url, 3600); // 1 hour cache maybe? Or no-store as per default if not specified. Prompt says "fetchJSON(url, revalidateSeconds?)".
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
          if (article) {
            articles.push(formatArticle(article, true, symbol));
          }
        }
      }
    }

    // If we didn't get enough articles or no symbols, fetch general news
    if (articles.length === 0) {
      const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
      const generalNews = await fetchJSON(url, 3600); // General news can be cached longer?

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
