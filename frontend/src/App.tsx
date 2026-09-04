import { useEffect, useState } from 'react';
import './App.css';

interface HealthResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/health`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="App">
      <h1>Groww Challenge - Full Stack Foundation</h1>
      
      <div className="card">
        <h2>Backend Health Check</h2>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : health ? (
          <div>
            <p>Status: <span style={{ color: 'green', fontWeight: 'bold' }}>{health.status}</span></p>
            <p>Timestamp: {health.timestamp}</p>
          </div>
        ) : (
          <p>Loading backend status...</p>
        )}
      </div>
    </div>
  );
}

export default App;
