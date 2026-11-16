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
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_20px_-8px_rgba(37,99,235,0.12)] grid grid-cols-5 items-center px-1"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          currentTab === item.id || (item.id === 'chat' && currentTab === 'dms');
        const isReels = item.id === 'reels';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setCurrentTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition active:scale-95 ${
              active
                ? isReels
                  ? 'text-pink-600'
                  : 'text-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-[19px] h-[19px] ${active ? 'scale-110 transition-transform' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
