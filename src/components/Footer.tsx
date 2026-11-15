import React from 'react';
import {
  Youtube,
  MessageSquare,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import type { NavigateOptions } from '../App';
import { buildHref } from '../App';
import { PWAInstallButton } from './PWAControls';
import { ResourceCategory } from '../types';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onNavigate, onOpenRules }) => {
  const navigate = (tab: string, options?: NavigateOptions) => {
    if (onNavigate) {
      onNavigate(tab, options);
    } else {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categoryLinks: { label: string; category: ResourceCategory }[] = [
    { label: 'Minecraft Mods & Clients', category: 'minecraft' },
    { label: 'Android Applications', category: 'android' },
    { label: 'PC Software & Tools', category: 'pc-software' },
    { label: 'Source Codes', category: 'source-code' },
    { label: 'Tutorials & Guides', category: 'tutorials' },
  ];

  const navLinks = [
    { label: 'Overview', tab: 'home' },
    { label: 'Selected Works', tab: 'projects' },
    { label: 'Software Releases', tab: 'resources' },
    { label: 'Community', tab: 'community' },
    { label: 'Devlogs', tab: 'announcements' },
  ];

  return (
    <footer className="w-full border-t border-white/5 bg-[#06070a] text-zinc-400 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Creator Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('home');
              }}
              className="flex items-center gap-3 w-fit group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 p-0.5 shadow-md shadow-purple-900/30">
                <div className="w-full h-full bg-[#0d0e15] rounded-[10px] flex items-center justify-center font-extrabold text-white text-lg">
                  Ω
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white group-hover:text-purple-200 transition">
                OBSIDIUSS
              </span>
            </a>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Official engineering portfolio of Obsidiuss: High-performance Minecraft clients, JVM
              modding architecture, native Android system utilities, and open developer tooling.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <PWAInstallButton />
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {navLinks.map((item) => (
                <li key={item.tab}>
                  <a
                    href={buildHref(item.tab)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.tab);
                    }}
                    className="hover:text-white transition"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Direct Category Deep-Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categoryLinks.map((item) => (
                <li key={item.category}>
                  <a
                    href={buildHref('resources', { category: item.category })}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('resources', { category: item.category });
                    }}
                    className="hover:text-white transition"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Social Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Official Channels
            </h4>
            <p className="text-xs text-zinc-500">
              Connect with Obsidiuss on official social platforms.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="https://discord.com/invite/aAgf7bnCNd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#858ffc] text-xs font-semibold transition"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Discord Community</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>

              <a
                href="https://youtube.com/@obsidiuss?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-semibold transition"
              >
                <Youtube className="w-4 h-4 shrink-0" />
                <span>YouTube Channel</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>

              <a
                href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 border border-pink-600/30 text-pink-400 text-xs font-semibold transition"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>Instagram Profile</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">OBSIDIUSS</span>
            <span>·</span>
            <span>Systems Developer & Creator Portfolio</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {onOpenRules && (
              <button onClick={onOpenRules} className="hover:text-purple-300 transition text-zinc-400">
                Community Rules
              </button>
            )}
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('dashboard');
              }}
              className="hover:text-zinc-300 transition"
            >
              My Dashboard
            </a>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('about');
              }}
              className="hover:text-zinc-300 transition"
            >
              About Creator
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                navigate('contact');
              }}
              className="hover:text-zinc-300 transition"
            >
              Support & Inquiries
            </a>
            <span className="text-zinc-600">|</span>
            <span>© {new Date().getFullYear()} OBSIDIUSS. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
