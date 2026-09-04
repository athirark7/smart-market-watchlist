export interface MarketQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: string;
  status: 'LIVE' | 'DELAYED' | 'DEMO' | 'STALE' | 'ERROR';
  error?: string;
}

export interface IMarketDataProvider {
  getQuotes(symbols: string[]): Promise<Map<string, MarketQuote>>;
}
