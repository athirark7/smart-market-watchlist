import { MarketQuote } from '../providers/IMarketDataProvider';

export type ChangeSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ChangeType = 'PRICE_UP' | 'PRICE_DOWN' | 'VOLUME_SPIKE' | 'STALE' | 'NEW' | 'UNCHANGED';

export interface ChangeAnalysis {
  symbol: string;
  severity: ChangeSeverity;
  type: ChangeType;
  message: string;
  previousPrice: number | null;
  currentPrice: number;
  percentageChange: number;
  absoluteChange: number;
  isStale: boolean;
}

export interface SnapshotItem {
  symbol: string;
  last_price: number;
  last_volume: number;
  seen_at: Date;
}

const CONFIG = {
  HIGH_PRICE_SHIFT: 5.0, // 5%
  MEDIUM_PRICE_SHIFT: 2.0, // 2%
  VOLUME_SPIKE_MULTIPLIER: 2.0, // 200% of previous
  STALE_DATA_HOURS: 24
};

export const analyzeChange = (
  quote: MarketQuote, 
  snapshot: SnapshotItem | null
): ChangeAnalysis => {
  // If no snapshot exists, it's a new item or first time viewing
  if (!snapshot) {
    return {
      symbol: quote.symbol,
      severity: 'NONE',
      type: 'NEW',
      message: 'New addition, no previous data.',
      previousPrice: null,
      currentPrice: quote.price,
      percentageChange: 0,
      absoluteChange: 0,
      isStale: false
    };
  }

  // Check for stale data (if data is LIVE but old)
  // For simplicity, we just check if the last snapshot was over 24h ago
  // and we haven't checked since, or if the quote timestamp itself is old.
  const quoteTime = new Date(quote.timestamp).getTime();
  const now = Date.now();
  const isStale = (now - quoteTime) > CONFIG.STALE_DATA_HOURS * 60 * 60 * 1000;

  if (isStale && quote.status !== 'DEMO') {
    return {
      symbol: quote.symbol,
      severity: 'LOW',
      type: 'STALE',
      message: 'Data is stale (>24h old).',
      previousPrice: snapshot.last_price,
      currentPrice: quote.price,
      percentageChange: 0,
      absoluteChange: 0,
      isStale: true
    };
  }

  const absoluteChange = quote.price - snapshot.last_price;
  const percentageChange = snapshot.last_price > 0 
    ? (absoluteChange / snapshot.last_price) * 100 
    : 0;
  
  const absPercent = Math.abs(percentageChange);
  
  let severity: ChangeSeverity = 'NONE';
  let type: ChangeType = 'UNCHANGED';
  let message = 'No significant change.';

  if (absPercent >= CONFIG.HIGH_PRICE_SHIFT) {
    severity = 'HIGH';
    type = absoluteChange > 0 ? 'PRICE_UP' : 'PRICE_DOWN';
    message = `Significant ${absoluteChange > 0 ? 'surge' : 'drop'} of ${absPercent.toFixed(1)}%`;
  } else if (absPercent >= CONFIG.MEDIUM_PRICE_SHIFT) {
    severity = 'MEDIUM';
    type = absoluteChange > 0 ? 'PRICE_UP' : 'PRICE_DOWN';
    message = `Price moved ${absPercent.toFixed(1)}%`;
  } else if (quote.volume > snapshot.last_volume * CONFIG.VOLUME_SPIKE_MULTIPLIER && snapshot.last_volume > 0) {
    severity = 'MEDIUM';
    type = 'VOLUME_SPIKE';
    message = `Unusual volume spike (${(quote.volume / snapshot.last_volume).toFixed(1)}x average)`;
  }

  return {
    symbol: quote.symbol,
    severity,
    type,
    message,
    previousPrice: snapshot.last_price,
    currentPrice: quote.price,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    absoluteChange: parseFloat(absoluteChange.toFixed(2)),
    isStale
  };
};
