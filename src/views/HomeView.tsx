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
  Play,
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
    <div className="space-y-16 sm:space-y-20 pb-12 animate-fade-up">
      {/* Split Hero */}
      <section className="relative pt-8 sm:pt-14 pb-4 overflow-hidden">
        <div className="animate-float-slow absolute -top-10 left-1/4 w-[520px] h-[360px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div
          className="animate-float-slow absolute top-10 right-1/4 w-[380px] h-[320px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"
          style={{ animationDelay: '-3s' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-blue-600">
                <span className="w-6 h-[2px] bg-gradient-to-r from-blue-600 to-orange-500 rounded-full" />
                <span>Bhaskar Yadav (Obsidiuss) · Owner &amp; Developer</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.08] [text-wrap:balance]">
                Official{' '}
                <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 bg-clip-text text-transparent animate-gradient-flow">
                  OBSIDIUSS HUB
                </span>{' '}
                for Builds, Reels &amp; Community.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Created by <strong className="text-slate-950">Bhaskar Yadav</strong> (Obsidiuss).
                Download verified software packages, explore active projects, swipe through reels,
                and chat live with members.
              </p>

              {/* Primary CTAs */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('resources')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Browse Downloads</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('reels')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition active:scale-[0.98]"
                >
                  <Film className="w-4 h-4" />
                  <span>Watch Reels</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('projects')}
                  className="min-h-[44px] flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 font-semibold text-sm shadow-xs transition"
                >
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  <span>Projects</span>
                </button>
              </div>

              {/* Clean Channels Row */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <a
                  href="https://discord.com/invite/aAgf7bnCNd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-600 font-medium transition py-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Discord</span>
                </a>
                <span className="text-slate-300">·</span>
                <a
                  href="https://youtube.com/@obsidiuss?feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-orange-600 font-medium transition py-1"
                >
                  <Youtube className="w-3.5 h-3.5 text-orange-500" />
                  <span>YouTube</span>
                </a>
                <span className="text-slate-300">·</span>
                <a
                  href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-600 font-medium transition py-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram</span>
                </a>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => navigate('about')}
                  className="hover:text-blue-600 font-medium transition py-1"
                >
                  About Bhaskar Yadav
                </button>
              </div>
            </div>

            {/* Right Column: Visual Studio Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-blue-950/10 p-2 group">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src={devWorkspaceImg}
                    alt="Obsidiuss Workspace by Bhaskar Yadav"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-white text-left shadow-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-extrabold text-slate-950 tracking-tight">
                        Bhaskar Yadav · Obsidiuss
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-600">
                        Owner
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500">
                      Minecraft · Android · PC Tools · Open Source
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Real Metrics Row */}
          <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition">
                  Downloads
                </span>
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums">
                {loading ? '—' : totalDownloads.toLocaleString()}
              </div>
            </a>

            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-sky-600 transition">
                  Packages
                </span>
                <Zap className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums">
                {loading ? '—' : resources.length.toLocaleString()}
              </div>
            </a>

            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                navigate('projects');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-orange-600 transition">
                  Projects
                </span>
                <FolderGit2 className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums">
                {loading ? '—' : projects.length.toLocaleString()}
              </div>
            </a>

            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('about');
              }}
              className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover text-left block group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-pink-600 transition">
                  Visits
                </span>
                <Activity className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tabular-nums">
                {siteVisits.toLocaleString()}
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Social Hub: Reels, Live Chat, Direct Messages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Community Hub
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Reels, Live Chat &amp; Direct Messages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => navigate('reels')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                  <Film className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {reels.length} {reels.length === 1 ? 'reel' : 'reels'}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 group-hover:text-pink-600 transition">
                Instagram-Style Reels
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Double-tap to heart, swipe vertical clips, browse Explore Grid, and save favorites.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-600">
              <span>Open Reels</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('chat')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Hash className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-blue-600 font-semibold">4 Channels</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 group-hover:text-blue-600 transition">
                Live Chat Lounge
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time community channels across #general-lounge, #minecraft-dev, and #help-desk.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Join Live Chat</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('dms')}
            className="p-5 sm:p-6 rounded-3xl glass-panel glass-panel-hover text-left flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-orange-600 font-semibold">Private 1-on-1</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-950 group-hover:text-orange-600 transition">
                Direct Messages
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send private messages directly to Bhaskar Yadav or any registered member.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
              <span>Open Inbox</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Instagram-Style Reels Preview Strip */}
        {reels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {reels.slice(0, 3).map((reel) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => navigate('reels', { reelId: reel.id })}
                className="p-4 rounded-2xl glass-panel glass-panel-hover text-left flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 block">
                    {reel.category} · {reel.authorName}
                  </span>
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                    {reel.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-500" />
                      {reel.likesCount || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3 text-blue-500" />
                      {reel.viewsCount || 0}
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full ig-ring p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-pink-600">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Selected Projects */}
      <section id="selected-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-wider uppercase text-blue-600">
              Selected Works
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Projects
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition shrink-0 self-start sm:self-auto"
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
                className="h-72 rounded-3xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl glass-panel text-center space-y-4">
            <FolderGit2 className="w-9 h-9 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-900">No projects published yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isAdmin
                  ? 'Add projects from the Admin Panel to showcase them here.'
                  : 'Published projects from Bhaskar Yadav (Obsidiuss) will appear here.'}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition"
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
                  className="rounded-3xl glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      {proj.bannerUrl ? (
                        <img
                          src={proj.bannerUrl}
                          alt={proj.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-sky-500 to-pink-500 flex items-center justify-center">
                          <FolderGit2 className="w-12 h-12 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-mono text-blue-700 font-bold shadow-sm">
                        {proj.category} · {proj.status}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-mono text-orange-600 font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{proj.stars || 0}</span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-2">
                      <h3 className="font-display text-lg sm:text-xl font-black text-slate-950 group-hover:text-blue-600 transition">
                        {proj.title}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-pink-600">{proj.tagline}</p>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Source</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('projects')}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition px-2 py-1"
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : proj.demoUrl ? (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
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
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Downloads</p>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950">
              Release Catalog
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('resources')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto"
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
                className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`font-mono text-[10px] ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : displayResources.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl glass-panel text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No releases in this category yet</p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentTab('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition"
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
                className="group rounded-3xl glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    {res.thumbnailUrl ? (
                      <img
                        src={res.thumbnailUrl}
                        alt={res.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-sky-500 to-orange-400 flex items-center justify-center">
                        <Download className="w-10 h-10 text-white/65" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold text-blue-700 shadow-sm">
                      {res.category} · {res.version}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-display text-base font-bold text-slate-950 group-hover:text-blue-600 transition line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    <div className="pt-3 flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-100">
                      <span>{res.fileSize}</span>
                      <span className="flex items-center gap-1 text-orange-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {res.ratingCount && res.ratingCount > 0 ? res.rating.toFixed(1) : 'New'}
                        </span>
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {(res.downloadsCount || 0).toLocaleString()} dl
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectResource(res)}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-[0.98]"
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
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-50 via-white to-pink-50 border border-blue-200/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-pink-500 text-white shadow-md shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-600">
                  <span className="font-bold uppercase tracking-wider">
                    {latestAnnouncement.category}
                  </span>
                  <span>·</span>
                  <span className="text-slate-500">
                    {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-950">
                  {latestAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl line-clamp-1">
                  {latestAnnouncement.excerpt}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('announcements')}
              className="min-h-[42px] flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-600 border border-blue-200 text-blue-700 hover:text-white text-xs font-bold shadow-xs transition shrink-0"
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
