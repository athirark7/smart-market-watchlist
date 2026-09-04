import { IMarketDataProvider, MarketQuote } from './IMarketDataProvider';

export class FinnhubMarketProvider implements IMarketDataProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
    const quotes = new Map<string, MarketQuote>();

    // We do sequential requests or Promise.all. For Finnhub free tier, rate limits apply.
    // Let's use Promise.all but wrap in a try/catch per symbol so one failure doesn't crash all.
    const fetchPromises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Finnhub returns { c: Current price, d: Change, dp: Percent change, h: High, l: Low, o: Open, pc: Previous close }
        // Volume is not reliably returned in this simple quote endpoint, we will mock it or default to 0 if missing.
        // Actually, if 'c' is missing or 0, it might be an invalid symbol.
        if (data && data.c !== undefined && data.c !== 0) {
          quotes.set(symbol, {
            symbol,
            price: data.c,
            volume: data.v || 1000000, // Fallback volume if not provided
            timestamp: new Date().toISOString(), // In reality we might use data.t if provided
            status: 'LIVE'
          });
        } else {
          quotes.set(symbol, {
            symbol,
            price: 0,
            volume: 0,
            timestamp: new Date().toISOString(),
            status: 'ERROR',
            error: 'Invalid or missing data for symbol'
          });
        }
      } catch (err) {
        console.error(`Failed to fetch data for ${symbol}:`, err);
        quotes.set(symbol, {
          symbol,
          price: 0,
          volume: 0,
          timestamp: new Date().toISOString(),
          status: 'ERROR',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    });

    await Promise.all(fetchPromises);
    return quotes;
  }
}
