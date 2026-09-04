import { query } from '../db';
import { SnapshotItem } from '../engine/changeEngine';

export class WatchlistRepository {
  static async getWatchlistSymbols(userId: string): Promise<string[]> {
    const res = await query('SELECT symbol FROM watchlist_items WHERE user_id = $1 ORDER BY added_at ASC', [userId]);
    return res.rows.map((row: any) => row.symbol);
  }

  static async addSymbol(userId: string, symbol: string): Promise<void> {
    await query(
      'INSERT INTO watchlist_items (user_id, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, symbol.toUpperCase()]
    );
  }

  static async removeSymbol(userId: string, symbol: string): Promise<void> {
    await query(
      'DELETE FROM watchlist_items WHERE user_id = $1 AND symbol = $2',
      [userId, symbol.toUpperCase()]
    );
  }

  static async getSnapshots(userId: string): Promise<Map<string, SnapshotItem>> {
    const res = await query('SELECT symbol, last_price, last_volume, seen_at FROM user_snapshots WHERE user_id = $1', [userId]);
    const map = new Map<string, SnapshotItem>();
    for (const row of res.rows) {
      map.set(row.symbol, {
        symbol: row.symbol,
        last_price: parseFloat(row.last_price),
        last_volume: parseInt(row.last_volume, 10),
        seen_at: new Date(row.seen_at)
      });
    }
    return map;
  }

  static async updateSnapshots(userId: string, items: { symbol: string, price: number, volume: number }[]): Promise<void> {
    // Upsert snapshots
    // To do this efficiently, we can iterate or use a transaction
    for (const item of items) {
      await query(`
        INSERT INTO user_snapshots (user_id, symbol, last_price, last_volume, seen_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, symbol) DO UPDATE 
        SET last_price = EXCLUDED.last_price,
            last_volume = EXCLUDED.last_volume,
            seen_at = CURRENT_TIMESTAMP
      `, [userId, item.symbol, item.price, item.volume]);
    }
  }
}
