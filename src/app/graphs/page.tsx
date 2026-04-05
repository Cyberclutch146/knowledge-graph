'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GraphsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [graphs, setGraphs] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/graphs')
      .then(r => r.json())
      .then(json => {
        if (json.success) setGraphs(json.data);
      })
      .finally(() => setLoadingList(false));
  }, []);

  const loadGraph = async (id: string) => {
    setLoadingDetail(true);
    setError(null);
    setDetail(null);
    try {
      const res = await fetch(`/api/graphs/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDetail(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div>
      <Link href="/">← Back</Link>
      <h2>View Saved Graphs & Connections</h2>
      
      {loadingList && <p>Loading lists...</p>}
      <ul>
        {graphs.map(g => (
          <li key={g.id}>
            {g.title} ({g.id}){' '}
            <button onClick={() => loadGraph(g.id)}>View Connections</button>
          </li>
        ))}
      </ul>

      <hr />

      {loadingDetail && <p>Loading detail...</p>}
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      {detail && (
        <div>
          <h3>Graph Data (Nodes & Edges)</h3>
          <pre>{JSON.stringify(detail, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
