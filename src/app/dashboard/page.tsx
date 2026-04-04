import DashboardLayout from '@/components/layout/DashboardLayout';
import AiAssistantCard from '@/components/dashboard/AiAssistantCard';
import GraphCard from '@/components/dashboard/GraphCard';
import StatsGrid from '@/components/dashboard/StatsGrid';

export const metadata = {
  title: 'Dashboard | Knowledge Graph Builder',
  description: 'Interactive concept network visualization',
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex gap-6 h-full min-h-[700px]">
        {/* Left column: AI Assistant */}
        <div className="w-[450px] shrink-0 h-full">
          <AiAssistantCard />
        </div>

        {/* Center column: Main Diagram */}
        <div className="flex-1 h-full min-w-0">
          <GraphCard />
        </div>

        {/* Right column: Stats blocks */}
        <div className="w-[320px] shrink-0 h-full">
          <StatsGrid />
        </div>
      </div>
    </DashboardLayout>
  );
}

