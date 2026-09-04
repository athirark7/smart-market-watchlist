import { Request, Response } from 'express';
import { WatchlistRepository } from '../repositories/watchlistRepo';
import { MarketProviderFactory } from '../providers/MarketProviderFactory';
import { analyzeChange } from '../engine/changeEngine';

// Hardcoded demo user for this challenge
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const symbols = await WatchlistRepository.getWatchlistSymbols(DEMO_USER_ID);
    if (symbols.length === 0) {
      return res.status(200).json({ items: [], changes: [] });
    }

    const provider = MarketProviderFactory.getProvider();
    const quotes = await provider.getQuotes(symbols);
    const snapshots = await WatchlistRepository.getSnapshots(DEMO_USER_ID);

    const items = [];
    const changes = [];

    for (const symbol of symbols) {
      const quote = quotes.get(symbol);
      if (!quote) continue;

      const snapshot = snapshots.get(symbol) || null;
      const analysis = analyzeChange(quote, snapshot);

      items.push({
        symbol,
        quote,
        snapshot,
        analysis
      });

      if (analysis.severity === 'HIGH' || analysis.severity === 'MEDIUM') {
        changes.push(analysis);
      }
    }

    // Sort changes by severity (HIGH first)
    changes.sort((a, b) => (a.severity === 'HIGH' ? -1 : 1));

    res.status(200).json({ items, changes });
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addSymbol = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Invalid symbol' });
    }
    
    await WatchlistRepository.addSymbol(DEMO_USER_ID, symbol.trim().toUpperCase());
    res.status(201).json({ message: 'Added' });
  } catch (err) {
    console.error('Error adding symbol:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeSymbol = async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    if (!symbol) {
      return res.status(400).json({ error: 'Invalid symbol' });
    }
    
    await WatchlistRepository.removeSymbol(DEMO_USER_ID, symbol);
    res.status(200).json({ message: 'Removed' });
  } catch (err) {
    console.error('Error removing symbol:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsSeen = async (req: Request, res: Response) => {
  try {
    const symbols = await WatchlistRepository.getWatchlistSymbols(DEMO_USER_ID);
    if (symbols.length === 0) {
      return res.status(200).json({ message: 'Nothing to mark' });
    }

    const provider = MarketProviderFactory.getProvider();
    const quotes = await provider.getQuotes(symbols);

    const snapshotUpdates = [];
    for (const symbol of symbols) {
      const quote = quotes.get(symbol);
      if (quote && quote.price > 0) {
        snapshotUpdates.push({
          symbol: quote.symbol,
          price: quote.price,
          volume: quote.volume
        });
      }
    }

    if (snapshotUpdates.length > 0) {
      await WatchlistRepository.updateSnapshots(DEMO_USER_ID, snapshotUpdates);
    }

    res.status(200).json({ message: 'Marked as seen' });
  } catch (err) {
    console.error('Error marking as seen:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
