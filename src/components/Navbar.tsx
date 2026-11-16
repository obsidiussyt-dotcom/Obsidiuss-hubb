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
import { RoleBadge } from './RoleBadge';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs shadow-blue-950/[0.03]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="flex items-center gap-2.5 group text-left focus:outline-none whitespace-nowrap shrink-0"
        >
          <BrandLogo
            size={32}
            className="group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-200"
          />
          <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-slate-950 group-hover:text-blue-600 transition whitespace-nowrap">
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
                  active ? 'text-blue-600' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-[21px] h-[2.5px] bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 rounded-full" />
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
            className="min-h-[38px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 text-xs font-semibold transition whitespace-nowrap shrink-0"
            title="Search hub (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500">
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
              className="relative min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded-xl bg-slate-100/80 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 transition"
              title="Devlogs & Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="animate-modal-pop absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/10 p-3 z-50">
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Devlogs &amp; Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark read
                    </button>
                  )}
                </div>

                {recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
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
                              ? 'bg-blue-50/70 border-blue-200 hover:bg-blue-50'
                              : 'bg-slate-50/60 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1">
                              {ann.pinned && <Pin className="w-2.5 h-2.5 text-orange-500" />}
                              {ann.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {ann.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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

          {/* Admin Panel Shortcut */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap shrink-0 ${
                currentTab === 'admin'
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'bg-white hover:bg-orange-50 border-orange-200 text-orange-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* Account Menu */}
          {profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100/80 hover:bg-blue-50 border border-slate-200/80 transition whitespace-nowrap shrink-0"
              >
                <UserAvatar
                  src={profile.photoURL}
                  name={profile.displayName}
                  sizeClass="w-7 h-7 text-xs"
                  className="rounded-lg"
                />
                <span className="hidden sm:inline text-xs font-semibold text-slate-900 max-w-[100px] truncate">
                  {profile.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className="animate-modal-pop absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/10 p-2 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <RoleBadge role={profile.role} size="xs" />
                      {profile.downloadsCount > 0 && (
                        <span className="text-[10px] text-slate-400">
                          · {profile.downloadsCount} dl
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    My Profile &amp; Activity
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('dms')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-pink-700 hover:bg-pink-50/70 rounded-xl transition text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-500" />
                      Direct Messages
                    </span>
                    {dmThreads.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {dmThreads.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenRules}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition text-left"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    Community Rules
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 rounded-xl transition text-left"
                    >
                      <ShieldAlert className="w-4 h-4 text-orange-500" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50 rounded-xl transition text-left"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 whitespace-nowrap shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded-xl bg-slate-100/80 text-slate-700 hover:text-blue-600 border border-slate-200/80 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="animate-fade-up lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
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
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200/70'
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
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200/70'
              }`}
            >
              <Mail className="w-4 h-4 text-pink-500" />
              Direct Messages
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('announcements')}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                currentTab === 'announcements'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200/70'
              }`}
            >
              <Bell className="w-4 h-4 text-orange-500" />
              Devlogs
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRules();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Community Guidelines &amp; Rules</span>
          </button>

          {!profile && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuth();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold transition"
            >
              Quick Sign In
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold transition"
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
