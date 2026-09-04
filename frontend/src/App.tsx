import { useEffect, useState } from 'react';
import './App.css';

interface MarketQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: string;
  status: 'LIVE' | 'DELAYED' | 'DEMO' | 'STALE' | 'ERROR';
}

interface ChangeAnalysis {
  symbol: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  type: 'PRICE_UP' | 'PRICE_DOWN' | 'VOLUME_SPIKE' | 'STALE' | 'NEW' | 'UNCHANGED';
  message: string;
  previousPrice: number | null;
  currentPrice: number;
  percentageChange: number;
  absoluteChange: number;
  isStale: boolean;
}

interface WatchlistItem {
  symbol: string;
  quote: MarketQuote;
  analysis: ChangeAnalysis;
}

interface WatchlistResponse {
  items: WatchlistItem[];
  changes: ChangeAnalysis[];
}

function App() {
  const [data, setData] = useState<WatchlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/watchlist`);
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const result = await response.json();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const addSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;
    try {
      await fetch(`${backendUrl}/api/watchlist/symbols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol })
      });
      setNewSymbol('');
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  const removeSymbol = async (symbol: string) => {
    try {
      await fetch(`${backendUrl}/api/watchlist/symbols/${symbol}`, {
        method: 'DELETE'
      });
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsSeen = async () => {
    try {
      await fetch(`${backendUrl}/api/watchlist/mark-seen`, {
        method: 'POST'
      });
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return '#ef4444'; // red
      case 'MEDIUM': return '#f59e0b'; // orange
      case 'LOW': return '#6b7280'; // gray
      default: return '#10b981'; // green
    }
  };

  const getStatusBadge = (status: string) => {
    let color = '#6b7280';
    if (status === 'LIVE') color = '#10b981';
    if (status === 'DEMO') color = '#3b82f6';
    if (status === 'STALE' || status === 'DELAYED') color = '#f59e0b';
    if (status === 'ERROR') color = '#ef4444';
    
    return (
      <span style={{ 
        backgroundColor: color, 
        color: 'white', 
        padding: '2px 6px', 
        borderRadius: '4px', 
        fontSize: '12px',
        fontWeight: 'bold',
        marginLeft: '8px'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Smart Market Watchlist</h1>
        <div className="header-actions">
          <span>{lastRefreshed ? `Last Refreshed: ${lastRefreshed.toLocaleTimeString()}` : ''}</span>
          <button onClick={fetchWatchlist} className="btn">Refresh</button>
          <button onClick={markAsSeen} className="btn btn-primary">Mark as Seen</button>
        </div>
      </header>
      
      {error && <div className="error-banner">Error: {error}</div>}

      <section className="attention-section">
        <h2>Since your last visit</h2>
        {loading && !data ? <p>Loading...</p> : null}
        
        {!loading && data && data.changes.length === 0 ? (
          <p className="empty-state">No significant changes since you last checked. You're all caught up!</p>
        ) : null}

        <div className="changes-grid">
          {data?.changes.map((change, i) => (
            <div key={i} className="change-card" style={{ borderLeft: `4px solid ${getSeverityColor(change.severity)}` }}>
              <h3>{change.symbol}</h3>
              <p className="message">{change.message}</p>
              <div className="details">
                {change.previousPrice && <span>Prev: ${change.previousPrice.toFixed(2)}</span>}
                <span>Now: ${change.currentPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="watchlist-section">
        <div className="watchlist-header">
          <h2>Your Watchlist</h2>
          <form onSubmit={addSymbol} className="add-form">
            <input 
              type="text" 
              value={newSymbol} 
              onChange={e => setNewSymbol(e.target.value)} 
              placeholder="Add Symbol (e.g. AAPL)" 
            />
            <button type="submit" className="btn">Add</button>
          </form>
        </div>

        <div className="table-container">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
                <th>Since Last Seen</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center'}}>No symbols tracked yet. Add one above!</td>
                </tr>
              ) : data?.items.map((item) => (
                <tr key={item.symbol}>
                  <td><strong>{item.symbol}</strong></td>
                  <td>${item.quote.price.toFixed(2)}</td>
                  <td style={{ color: item.analysis.absoluteChange >= 0 ? 'green' : 'red' }}>
                    {item.analysis.absoluteChange > 0 ? '+' : ''}{item.analysis.absoluteChange.toFixed(2)} 
                    ({item.analysis.percentageChange > 0 ? '+' : ''}{item.analysis.percentageChange.toFixed(2)}%)
                  </td>
                  <td>
                    {item.analysis.severity === 'NONE' ? 
                      <span className="text-muted">{item.analysis.message}</span> : 
                      <strong style={{ color: getSeverityColor(item.analysis.severity) }}>{item.analysis.message}</strong>
                    }
                  </td>
                  <td>
                    {getStatusBadge(item.quote.status)}
                    {item.analysis.isStale && getStatusBadge('STALE')}
                  </td>
                  <td>
                    <button onClick={() => removeSymbol(item.symbol)} className="btn-small text-danger">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
