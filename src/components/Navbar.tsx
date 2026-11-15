import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Download,
  FolderGit2,
  Users,
  Bell,
  HelpCircle,
  Mail,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  CheckCheck,
  Pin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserAvatar } from './UserAvatar';

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
  const { announcements } = useData();
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
    { id: 'community', label: 'Community', icon: Users },
    { id: 'announcements', label: 'Devlogs', icon: Bell },
    { id: 'about', label: 'About', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#08090d]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Logo - Top Bar Contract: Single clean wordmark, no attached pills */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="flex items-center gap-3 group text-left focus:outline-none shrink-0"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-900/30 group-hover:shadow-purple-600/40 transition">
            <div className="w-full h-full bg-[#0d0e15] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-xl tracking-tighter bg-gradient-to-br from-white via-purple-200 to-cyan-400 bg-clip-text text-transparent">
                Ω
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white group-hover:text-purple-300 transition">
              OBSIDIUSS
            </span>
            <span className="text-[11px] font-medium text-zinc-400 hidden sm:block tracking-wide">
              Systems Developer & Creator
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white shadow-md shadow-purple-900/30 border border-purple-400/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-purple-200' : 'text-zinc-400'}`} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Action Controls & User Account */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut */}
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/5 text-xs font-medium transition"
            title="Search resources, topics, and updates (Cmd+K)"
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {/* Real Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/5 transition"
              title="Notifications & Updates"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-purple-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-white">Updates & Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300"
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
                          onClick={() => {
                            if (isUnread) setReadIds((prev) => [...prev, ann.id]);
                            handleNavClick('announcements');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition border ${
                            isUnread
                              ? 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15'
                              : 'bg-white/[0.02] border-transparent hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1">
                              {ann.pinned && <Pin className="w-2.5 h-2.5 text-amber-400" />}
                              {ann.category}
                            </span>
                            <span className="text-[10px] text-zinc-500">
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

          {/* Community Rules Button */}
          <button
            onClick={onOpenRules}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/5 text-xs font-semibold transition"
            title="Community & User Rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rules</span>
          </button>

          {/* Admin Dashboard shortcut if admin */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-950/40'
                  : 'bg-white/[0.03] hover:bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}

          {/* User Profile / Auth State */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              >
                <UserAvatar
                  src={profile.photoURL}
                  name={profile.displayName}
                  sizeClass="w-7 h-7 text-xs"
                  className="rounded-lg ring-1 ring-purple-500/50"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white max-w-[110px] truncate leading-tight">
                    {profile.displayName}
                  </span>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    {profile.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-white truncate">{profile.displayName}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{profile.email}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-purple-300 uppercase tracking-wider text-[10px]">
                        {profile.role}
                      </span>
                      {profile.downloadsCount > 0 && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[10px] text-zinc-400">
                            {profile.downloadsCount} downloads
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-purple-400" />
                    My Dashboard & Saved
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition text-left"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 hover:shadow-purple-700/40 transition active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white border border-white/5 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0b12] px-4 pt-3 pb-6 animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRules();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 mb-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200 text-xs font-bold transition"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Community Guidelines & Rules</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 mb-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Admin Management Dashboard</span>
            </button>
          )}

          {profile && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-bold transition"
            >
              <UserIcon className="w-4 h-4 text-purple-400" />
              <span>My User Dashboard & Bookmarks</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
