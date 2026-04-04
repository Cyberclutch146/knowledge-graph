import { LayoutDashboard, Database, Activity, Calendar, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function Sidebar() {
  const activeIcon = 'dashboard';

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'activity', icon: Activity, href: '/dashboard' },
    { id: 'search', icon: Database, href: '/graphs' },
    { id: 'calendar', icon: Calendar, href: '/dashboard' },
    { id: 'settings', icon: Settings, href: '/dashboard' },
  ];

  return (
    <aside className="w-[88px] h-screen bg-[#070914] flex flex-col items-center py-6 shrink-0 z-50 border-r border-[#1a1f3c]">
      {/* Logo */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 w-full flex flex-col items-center gap-4">
        {menuItems.map((item) => (
          <Link 
            key={item.id}
            href={item.href}
            className={clsx(
              "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative group",
              activeIcon === item.id 
                ? "bg-[#11162a] text-blue-400" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-[#0c1020]"
            )}
          >
            {activeIcon === item.id && (
              <div className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto w-full flex justify-center pt-6">
        <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
