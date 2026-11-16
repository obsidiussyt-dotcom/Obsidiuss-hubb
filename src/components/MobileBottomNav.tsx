import React from 'react';
import { Home, Download, Film, MessageSquare, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'resources', label: 'Apps', icon: Download },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'dashboard', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#06070c]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-5 items-center px-1"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          currentTab === item.id || (item.id === 'chat' && currentTab === 'dms');
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setCurrentTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
              active ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
