import { IMarketDataProvider } from './IMarketDataProvider';
import { DemoMarketProvider } from './DemoMarketProvider';
import { FinnhubMarketProvider } from './FinnhubMarketProvider';
import dotenv from 'dotenv';

dotenv.config();

export class MarketProviderFactory {
  static getProvider(): IMarketDataProvider {
    const providerStr = process.env.MARKET_DATA_PROVIDER || 'DEMO';
    
    if (providerStr === 'LIVE' && process.env.FINNHUB_API_KEY) {
      console.log('Using Live Finnhub Market Data Provider');
      return new FinnhubMarketProvider(process.env.FINNHUB_API_KEY);
    }
    
    console.log('Using Demo Market Data Provider');
    return new DemoMarketProvider();
  }
}
