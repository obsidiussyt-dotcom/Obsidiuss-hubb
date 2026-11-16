import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Bell,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  CheckCheck,
  Pin,
  Mail,
  MessageSquare,
  Film,
  FolderGit2,
  Download,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserAvatar } from './UserAvatar';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSearch: () => void;
  openAuth: () => void;
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openSearch,
  openAuth,
  onOpenRules,
}) => {
  const { profile, isAdmin, signOut } = useAuth();
  const { announcements, dmThreads } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('obsidiuss_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('obsidiuss_read_notifications', JSON.stringify(readIds));
    } catch {
      // ignore storage quota errors
    }
  }, [readIds]);

  const recentAnnouncements = useMemo(() => announcements.slice(0, 5), [announcements]);
  const unreadCount = useMemo(
    () => recentAnnouncements.filter((a) => !readIds.includes(a.id)).length,
    [recentAnnouncements, readIds]
  );

  const markAllRead = () => {
    setReadIds(recentAnnouncements.map((a) => a.id));
  };

  const navItems = [
    { id: 'home', label: 'Overview', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'resources', label: 'Downloads', icon: Download },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'community', label: 'Forum', icon: Users },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#06070c]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Clean single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="flex items-center gap-2.5 group text-left focus:outline-none whitespace-nowrap shrink-0"
        >
          <BrandLogo size={32} className="group-hover:scale-105 transition-transform duration-200" />
          <span className="text-base font-black tracking-wider text-white group-hover:text-cyan-300 transition whitespace-nowrap">
            OBSIDIUSS
          </span>
        </a>

        {/* Zone 2: Clean Typographic Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const active =
              currentTab === item.id || (item.id === 'chat' && currentTab === 'dms');
            const href = item.id === 'home' ? '/' : `/${item.id}`;
            return (
              <a
                key={item.id}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative py-1 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Actions & User Account */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 text-xs font-medium transition whitespace-nowrap shrink-0"
            title="Search hub (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition"
              title="Devlogs & Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-zinc-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-zinc-950 text-[10px] font-extrabold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0b0c14] shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Devlogs &amp; Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                </div>

                {recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    No announcements published yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {recentAnnouncements.map((ann) => {
                      const isUnread = !readIds.includes(ann.id);
                      return (
                        <button
                          key={ann.id}
                          type="button"
                          onClick={() => {
                            if (isUnread) setReadIds((prev) => [...prev, ann.id]);
                            handleNavClick('announcements');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition border ${
                            isUnread
                              ? 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15'
                              : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-cyan-300 flex items-center gap-1">
                              {ann.pinned && <Pin className="w-2.5 h-2.5 text-amber-400" />}
                              {ann.category}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white line-clamp-1">{ann.title}</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                            {ann.excerpt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Panel Shortcut (Strictly Admin Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/[0.03] hover:bg-amber-500/10 border-amber-500/25 text-amber-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* Account Menu / Sign In CTA */}
          {profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition whitespace-nowrap shrink-0"
              >
                <UserAvatar
                  src={profile.photoURL}
                  name={profile.displayName}
                  sizeClass="w-7 h-7 text-xs"
                  className="rounded-lg"
                />
                <span className="hidden sm:inline text-xs font-semibold text-white max-w-[100px] truncate">
                  {profile.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0b0c14] shadow-2xl p-2 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{profile.displayName}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{profile.email}</p>
                    <p className="text-[10px] font-semibold text-cyan-400 mt-1">
                      {profile.role}
                      {profile.downloadsCount > 0 ? ` · ${profile.downloadsCount} downloads` : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    My Profile &amp; Activity
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('dms')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      Direct Messages
                    </span>
                    {dmThreads.length > 0 && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {dmThreads.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenRules}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition text-left"
                  >
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    Community Rules
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 rounded-xl transition text-left"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('signin')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold shadow-md transition active:scale-95 whitespace-nowrap shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white border border-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#08090f] px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'bg-white/[0.03] text-zinc-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleNavClick('dms')}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                currentTab === 'dms'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'bg-white/[0.03] text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              Direct Messages
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('announcements')}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                currentTab === 'announcements'
                  ? 'bg-white text-zinc-950 font-bold'
                  : 'bg-white/[0.03] text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              <Bell className="w-4 h-4" />
              Devlogs
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRules();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200 text-xs font-bold transition"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Community Guidelines &amp; Rules</span>
          </button>

          {!profile && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuth();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white text-zinc-950 text-xs font-bold transition"
            >
              Quick Sign In
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Management Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
