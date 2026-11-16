import React from 'react';
import { Compass, ArrowLeft, Download, FolderGit2, Users, Bell, HelpCircle, Mail } from 'lucide-react';
import type { NavigateOptions } from '../App';

interface NotFoundViewProps {
  onGoHome: () => void;
  onGoResources: () => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onGoHome,
  onGoResources,
  onNavigate,
}) => {
  const quickLinks = [
    { tab: 'projects', label: 'Projects Showcase', icon: FolderGit2 },
    { tab: 'community', label: 'Community Forum', icon: Users },
    { tab: 'announcements', label: 'Updates & Changelogs', icon: Bell },
    { tab: 'about', label: 'About Owner', icon: HelpCircle },
    { tab: 'contact', label: 'Contact Support', icon: Mail },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-up">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
        <Compass className="w-10 h-10 text-blue-600" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-pink-600">
          Error 404
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The page or route you requested does not exist on OBSIDIUSS HUB.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </a>

        <a
          href="/resources"
          onClick={(e) => {
            e.preventDefault();
            onGoResources();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold transition"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Browse Resources</span>
        </a>
      </div>

      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.tab}
              href={`/${link.tab}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(link.tab);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-xs text-slate-600 hover:text-blue-700 transition"
            >
              <Icon className="w-3.5 h-3.5 text-blue-600" />
              <span>{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
