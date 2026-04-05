import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1>Graph API Debugger</h1>
      <ul>
        <li><Link href="/dashboard">Create Node / Extract Graph</Link></li>
        <li><Link href="/graphs">View Saved Graphs</Link></li>
      </ul>
    </div>
  );
}
