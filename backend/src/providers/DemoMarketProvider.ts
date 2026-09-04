import { IMarketDataProvider, MarketQuote } from './IMarketDataProvider';

export class DemoMarketProvider implements IMarketDataProvider {
  private basePrices: Record<string, number> = {
    'AAPL': 150.0,
    'MSFT': 300.0,
    'GOOGL': 2800.0,
    'AMZN': 3300.0,
    'TSLA': 700.0,
    'RELIANCE': 2500.0,
    'TCS': 3500.0,
    'NVIDIA': 500.0
  };

  private baseVolumes: Record<string, number> = {
    'AAPL': 50000000,
    'MSFT': 25000000,
    'GOOGL': 1500000,
    'AMZN': 3000000,
    'TSLA': 20000000,
    'RELIANCE': 6000000,
    'TCS': 2500000,
    'NVIDIA': 40000000
  };

  async getQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
    const quotes = new Map<string, MarketQuote>();
    const now = Date.now();

    for (const symbol of symbols) {
      // Deterministic pseudo-random walk based on time
      // This ensures if you hit it repeatedly, it moves slightly but deterministically
      const basePrice = this.basePrices[symbol] || 100.0;
      const baseVolume = this.baseVolumes[symbol] || 1000000;
      
      // We'll create a sine wave movement based on time + a hash of the symbol
      const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Cycle every 10 minutes (600000 ms)
      const timeOffset = (now % 600000) / 600000; 
      
      // Price fluctuates by up to +/- 10%
      const priceVariation = Math.sin(timeOffset * Math.PI * 2 + symbolHash) * 0.10;
      const currentPrice = basePrice * (1 + priceVariation);
      
      // Volume spikes occasionally
      const volumeVariation = Math.cos(timeOffset * Math.PI * 4 + symbolHash);
      let currentVolume = baseVolume;
      if (volumeVariation > 0.9) {
        // High volume spike
        currentVolume = baseVolume * 3;
      } else {
        currentVolume = baseVolume * (1 + (volumeVariation * 0.2));
      }

      quotes.set(symbol, {
        symbol,
        price: parseFloat(currentPrice.toFixed(2)),
        volume: Math.floor(currentVolume),
        timestamp: new Date().toISOString(),
        status: 'DEMO'
      });
    }

    return quotes;
  }
}
