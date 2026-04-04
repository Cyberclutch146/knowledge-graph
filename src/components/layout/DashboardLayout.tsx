import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DebugPanel from '@/components/DebugPanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#03040a] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-10 pb-10 relative">
          <DebugPanel />
          {children}
        </main>
      </div>
    </div>
  );
}
