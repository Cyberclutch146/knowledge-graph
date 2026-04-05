'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'strict' })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/">← Back</Link>
      <h2>Create Graph Node & Edges</h2>
      <form onSubmit={handleSubmit}>
        <textarea 
          rows={5} 
          cols={50} 
          value={text} 
          onChange={e => setText(e.target.value)}
          placeholder="Enter text to generate graph"
        />
        <br/>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit Post'}
        </button>
      </form>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      {data && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
