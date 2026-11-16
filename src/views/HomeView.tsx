import React, { useState } from 'react';
import {
  Download,
  FolderGit2,
  Bell,
  Star,
  ExternalLink,
  MessageSquare,
  Youtube,
  Instagram,
  Activity,
  ChevronRight,
  Layers,
  Plus,
  ArrowUpRight,
  Zap,
  Github,
  Film,
  Mail,
  Hash,
  Heart,
  Eye,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Resource } from '../types';
import type { NavigateOptions } from '../App';

import devWorkspaceImg from '../assets/images/portfolio_dev_workspace_1794658366383.jpg';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onSelectResource: (resource: Resource) => void;
  openAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentTab,
  onNavigate,
  onSelectResource,
}) => {
  const { resources, projects, announcements, reels, siteVisits, loading } = useData();
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navigate = (tab: string, options?: NavigateOptions) => {
    if (onNavigate) onNavigate(tab, options);
    else setCurrentTab(tab);
  };

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

  const filteredResources =
    selectedCategory === 'all'
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const displayResources = filteredResources.slice(0, 6);

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const latestAnnouncement = sortedAnnouncements[0];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'minecraft', label: 'Minecraft' },
    { id: 'android', label: 'Android' },
    { id: 'pc-software', label: 'PC Software' },
    { id: 'source-code', label: 'Source Code' },
    { id: 'dev-tools', label: 'Dev Tools' },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      {/* Split Hero */}
      <section className="relative pt-8 sm:pt-14 pb-4 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[400px] bg-gradient-to-tr from-purple-900/15 via-indigo-900/10 to-cyan-900/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-wider uppercase text-cyan-300">
                <span className="w-5 h-px bg-cyan-400" />
                <span>Bhaskar Yadav (Obsidiuss) · Owner &amp; Developer</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] [text-wrap:balance]">
                Official{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  OBSIDIUSS HUB
                </span>{' '}
                for Builds, Reels &amp; Community.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
                Created by <strong className="text-white">Bhaskar Yadav</strong> (Obsidiuss).
                Download verified software packages, explore active projects, watch reels, and chat
                live with members.
              </p>

              {/* Primary CTAs — comfortable touch targets on mobile */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('resources')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-950/40 transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Browse Downloads</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('projects')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-zinc-100 font-semibold text-sm transition"
                >
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('reels')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-zinc-100 font-semibold text-sm transition"
                >
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>Watch Reels</span>
                </button>
              </div>

              {/* Clean Channels Row */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
                <a
                  href="https://discord.com/invite/aAgf7bnCNd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#9ea7ff] transition py-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#7280ff]" />
                  <span>Discord</span>
                </a>
                <span className="text-zinc-700">·</span>
                <a
                  href="https://youtube.com/@obsidiuss?feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-red-400 transition py-1"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube</span>
                </a>
                <span className="text-zinc-700">·</span>
                <a
                  href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition py-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram</span>
                </a>
                <span className="text-zinc-700">·</span>
                <button
                  type="button"
                  onClick={() => navigate('about')}
                  className="hover:text-cyan-300 transition py-1"
                >
                  About Bhaskar Yadav
                </button>
              </div>
            </div>

            {/* Right Column: Visual Studio Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-2 bg-gradient-to-br from-white/[0.04] to-transparent group">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950">
                  <img
                    src={devWorkspaceImg}
                    alt="Obsidiuss Workspace by Bhaskar Yadav"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-85" />

                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-[#08090d]/90 backdrop-blur-md border border-white/10 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        Bhaskar Yadav · Obsidiuss
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                        Owner
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400">
                      Minecraft · Android · PC Tools · Open Source
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Real Metrics Row */}
          <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-purple-300 transition">
                  Downloads
                </span>
                <Download className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : totalDownloads.toLocaleString()}
              </div>
            </a>

            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-cyan-300 transition">
                  Packages
                </span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : resources.length.toLocaleString()}
              </div>
            </a>

            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                navigate('projects');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-indigo-300 transition">
                  Projects
                </span>
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : projects.length.toLocaleString()}
              </div>
            </a>

            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('about');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-300 transition">
                  Visits
                </span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                {siteVisits.toLocaleString()}
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Social Hub: Reels, Live Chat, Direct Messages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Community Hub
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reels, Live Chat &amp; Direct Messages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => navigate('reels')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover border border-white/10 text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Film className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">
                  {reels.length} {reels.length === 1 ? 'reel' : 'reels'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                Reels Feed
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Watch or post vertical clips, showcase videos, and quick walkthroughs.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-300">
              <span>Open Reels</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('chat')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover border border-white/10 text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Hash className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-cyan-400">4 Channels</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                Live Chat Lounge
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real-time community channels across #general-lounge, #minecraft-dev, and #help-desk.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>Join Live Chat</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('dms')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover border border-white/10 text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-indigo-300">Private 1-on-1</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                Direct Messages
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Send private messages directly to Bhaskar Yadav or any registered member.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Open Inbox</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {reels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {reels.slice(0, 3).map((reel) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => navigate('reels', { reelId: reel.id })}
                className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-purple-500/40 text-left transition flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block">
                    {reel.category} · {reel.authorName}
                  </span>
                  <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition">
                    {reel.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {reel.likesCount || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {reel.viewsCount || 0}
                    </span>
                  </div>
                </div>
                <Film className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 shrink-0 transition" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Selected Projects (100% Real Firestore Data) */}
      <section id="selected-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider uppercase text-purple-300">
              Selected Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Projects
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition shrink-0 self-start sm:self-auto"
          >
            <span>All Projects ({projects.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 text-center space-y-4">
            <FolderGit2 className="w-9 h-9 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-white">No projects published yet</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {isAdmin
                  ? 'Add projects from the Admin Panel to showcase them here.'
                  : 'Published projects from Bhaskar Yadav (Obsidiuss) will appear here.'}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...projects]
              .sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .slice(0, 4)
              .map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-purple-500/40 transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                      {proj.bannerUrl ? (
                        <img
                          src={proj.bannerUrl}
                          alt={proj.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
                          <FolderGit2 className="w-12 h-12 text-purple-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-purple-300 font-semibold">
                        {proj.category} · {proj.status}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{proj.stars || 0}</span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-2">
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-purple-300 transition">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-mono text-purple-400">{proj.tagline}</p>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Source</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('projects')}
                        className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition px-2 py-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {proj.downloadUrl ? (
                      <a
                        href={proj.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : proj.demoUrl ? (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Demo</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Software Release Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Downloads
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Release Catalog</h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('resources')}
            className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition self-start sm:self-auto"
          >
            <span>Full Catalog ({resources.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? resources.length
                : resources.filter((r) => r.category === cat.id).length;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span className="font-mono text-[10px] text-zinc-500">({count})</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : displayResources.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-white">No releases in this category yet</p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Release</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {displayResources.map((res) => (
              <div
                key={res.id}
                className="group rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-purple-500/40 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                    {res.thumbnailUrl ? (
                      <img
                        src={res.thumbnailUrl}
                        alt={res.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
                        <Download className="w-10 h-10 text-purple-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-white/10">
                      {res.category} · {res.version}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    <div className="pt-3 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/5">
                      <span>{res.fileSize}</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {res.ratingCount && res.ratingCount > 0 ? res.rating.toFixed(1) : 'New'}
                        </span>
                      </span>
                      <span className="text-purple-300">
                        {(res.downloadsCount || 0).toLocaleString()} dl
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => onSelectResource(res)}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Devlog Strip */}
      {latestAnnouncement && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-7 rounded-3xl glass-panel border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-zinc-900/60 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                  <span className="font-semibold uppercase tracking-wider">
                    {latestAnnouncement.category}
                  </span>
                  <span>·</span>
                  <span className="text-zinc-400">
                    {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {latestAnnouncement.title}
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl line-clamp-1">
                  {latestAnnouncement.excerpt}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('announcements')}
              className="min-h-[42px] flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition shrink-0"
            >
              <span>All Devlogs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
