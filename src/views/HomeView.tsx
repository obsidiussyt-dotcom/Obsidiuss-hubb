import React, { useState } from 'react';
import {
  Sparkles,
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
  Code2,
  Cpu,
  Terminal,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  Github,
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
  const { resources, projects, announcements, siteVisits, loading } = useData();
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navigate = (tab: string, options?: NavigateOptions) => {
    if (onNavigate) onNavigate(tab, options);
    else setCurrentTab(tab);
  };

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

  // Filtered resources for portfolio catalog
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
    { id: 'all', label: 'All Releases' },
    { id: 'minecraft', label: 'Minecraft Clients & Mods' },
    { id: 'android', label: 'Android Utilities' },
    { id: 'pc-software', label: 'PC Tools' },
    { id: 'source-code', label: 'Source Codes' },
    { id: 'dev-tools', label: 'Developer Kits' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* =========================================================================
          HERO SECTION: Split-Screen Developer Portfolio Hero (Guidelines §2.B)
          Left: Editorial kicker, oversized headline, bio prose, primary CTAs, socials
          Right: Framed cinematic workspace visual with live lab badge
          Full-width row below: 4-column metric strip with tabular numerals
      ========================================================================== */}
      <section className="relative pt-10 sm:pt-16 pb-8 overflow-hidden">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-purple-900/15 via-indigo-900/10 to-cyan-900/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (7 cols): Editorial bio & core positioning */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Unboxed Kicker (Zero-Pill discipline) */}
              <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-purple-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
                <span>Obsidiuss · Systems Developer & Modding Architect</span>
              </div>

              {/* Oversized Headline */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Engineering High-Performance{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Game Clients
                </span>
                , Systems Tooling & Open-Source Utilities.
              </h1>

              {/* Editorial Lead Paragraph */}
              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
                Independent systems engineer specializing in low-latency Minecraft client runtimes,
                JVM bytecode manipulation with Fabric & ASM, hardware-accelerated Android utilities,
                and transparent open-source developer tooling.
              </p>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => navigate('projects')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-950/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Explore Selected Works</span>
                </button>

                <button
                  onClick={() => navigate('resources')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 font-semibold text-sm transition transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Browse Downloads</span>
                </button>

                <a
                  href="https://discord.com/invite/aAgf7bnCNd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#a0a8ff] font-semibold text-sm transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discord</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>

              {/* Verified External Channels Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                  Channels:
                </span>
                <a
                  href="https://youtube.com/@obsidiuss?feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-red-400 transition"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube (@obsidiuss)</span>
                </a>
                <span className="text-zinc-700">·</span>
                <a
                  href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-pink-400 transition"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram (@obsidiuss.yt)</span>
                </a>
                <span className="text-zinc-700">·</span>
                <button
                  onClick={() => navigate('about')}
                  className="hover:text-purple-300 transition"
                >
                  <span>Biography & Specs</span>
                </button>
              </div>
            </div>

            {/* Right Column (5 cols): Cinematic Studio Framed Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-2 bg-gradient-to-br from-white/[0.04] to-transparent group">
                <div className="relative aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-zinc-950">
                  <img
                    src={devWorkspaceImg}
                    alt="Obsidiuss Systems Engineering Studio Workspace"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-80" />

                  {/* Visual Studio Spec Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-[#08090d]/85 backdrop-blur-md border border-white/10 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white tracking-wide">
                        Obsidiuss Systems Lab
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                      <span>JVM / Fabric / Kotlin / NDK</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-purple-300">Production Builds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width metric row below split (Portfolio Guide §2.B) */}
          <div className="mt-14 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-purple-300 transition">
                  Verified Downloads
                </span>
                <Download className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : totalDownloads.toLocaleString()}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Tracked across all release packages
              </span>
            </a>

            <a
              href="/resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('resources');
              }}
              className="p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-cyan-300 transition">
                  Published Packages
                </span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : resources.length.toLocaleString()}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Tools, clients, mods & source repos
              </span>
            </a>

            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                navigate('projects');
              }}
              className="p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-indigo-300 transition">
                  Engineering Projects
                </span>
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {loading ? '—' : projects.length.toLocaleString()}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Active architectures & builds
              </span>
            </a>

            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('about');
              }}
              className="p-5 rounded-2xl glass-panel glass-panel-hover text-left block border border-white/5 group"
            >
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-emerald-300 transition">
                  Live Platform Visits
                </span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {siteVisits.toLocaleString()}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Direct community visitor sessions
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SELECTED WORKS & ENGINEERING SHOWCASE (100% Real Firestore Projects)
      ========================================================================== */}
      <section id="selected-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-purple-300">
              <FolderGit2 className="w-4 h-4 text-purple-400" />
              <span>Selected Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Projects & Architecture
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              Published builds, custom client systems, and open-source developer tools managed directly on OBSIDIUSS.
            </p>
          </div>

          <button
            onClick={() => navigate('projects')}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition shrink-0"
          >
            <span>View All Projects ({projects.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-10 rounded-3xl glass-panel border border-white/10 text-center space-y-4">
            <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-bold text-white">No projects published yet</p>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {isAdmin
                  ? 'Publish your real projects and repositories from the Admin Panel to showcase them here.'
                  : 'New engineering builds and repositories will appear here as they are published.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {isAdmin && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project in Admin</span>
                </button>
              )}
              <button
                onClick={() => navigate('resources')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-200 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Browse Release Catalog</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {(() => {
              const sortedProjects = [...projects].sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
              const featuredTop = sortedProjects.slice(0, 2);
              const extraProjects = sortedProjects.slice(2, 5);

              return (
                <>
                  {featuredTop.map((proj, idx) => {
                    const colSpan =
                      featuredTop.length === 1
                        ? 'lg:col-span-12'
                        : idx === 0
                        ? 'lg:col-span-7'
                        : 'lg:col-span-5';
                    return (
                      <div
                        key={proj.id}
                        className={`${colSpan} rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-purple-500/40 transition duration-300 flex flex-col justify-between group`}
                      >
                        <div>
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
                            {proj.bannerUrl ? (
                              <img
                                src={proj.bannerUrl}
                                alt={proj.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
                                <FolderGit2 className="w-12 h-12 text-purple-400/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-transparent to-transparent" />

                            <div className="absolute top-4 left-4 flex items-center gap-2">
                              <div className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-purple-300 font-semibold">
                                {proj.category} · {proj.status}
                              </div>
                            </div>

                            <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{proj.stars || 0}</span>
                            </div>
                          </div>

                          <div className="p-6 sm:p-7 space-y-3">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-300 transition">
                                {proj.title}
                              </h3>
                              <p className="text-xs font-mono text-purple-400 mt-1">{proj.tagline}</p>
                            </div>

                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                              {proj.description}
                            </p>

                            {proj.tags?.length > 0 && (
                              <div className="pt-2 text-xs font-mono text-zinc-400 flex flex-wrap gap-2">
                                {proj.tags.slice(0, 5).map((tag, tagIdx) => (
                                  <React.Fragment key={tag}>
                                    <span>{tag}</span>
                                    {tagIdx < Math.min(proj.tags.length, 5) - 1 && (
                                      <span className="text-zinc-600">·</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-6 sm:px-7 pb-6 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
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
                              onClick={() => navigate('projects')}
                              className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition px-2 py-1"
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
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Get Build</span>
                            </a>
                          ) : proj.demoUrl ? (
                            <a
                              href={proj.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Live Demo</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {extraProjects.length > 0 && (
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {extraProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => navigate('projects')}
                          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/5 cursor-pointer transition flex flex-col justify-between gap-4 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-purple-400 font-semibold">
                                {proj.category}
                              </span>
                              <span className="text-zinc-500 font-mono text-[11px]">{proj.status}</span>
                            </div>
                            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                              {proj.title}
                            </h4>
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {proj.tagline || proj.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{proj.stars || 0} stars</span>
                            </span>
                            <span className="text-purple-400 flex items-center gap-1">
                              <span>Explore</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </section>

      {/* =========================================================================
          TECHNICAL DISCIPLINES & CORE STACK BENTO (§3.B)
          Demonstrates engineering depth across Game Client Optimization,
          JVM Bytecode Manipulation, Native Android Systems & Open Tooling
      ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Technical Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineering Disciplines & Core Stack
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Core technical domains and architectures utilized across Obsidiuss projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Discipline 1: Game Client & Rendering Architecture */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-purple-500/30 transition space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Client & Rendering Core</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              OpenGL 4.5 and LWJGL 3 pipelines, off-heap chunk geometry meshing, sub-frame input
              polling, and custom camera smoothing math.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-300 flex flex-wrap gap-1.5">
              <span>LWJGL 3</span>
              <span>·</span>
              <span>OpenGL</span>
              <span>·</span>
              <span>VBO Caching</span>
              <span>·</span>
              <span>GLSL</span>
            </div>
          </div>

          {/* Discipline 2: JVM & Bytecode Manipulation */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-indigo-500/30 transition space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">JVM & Bytecode Systems</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              ASM bytecode transformations, Fabric mixin injection pipelines, custom ClassLoader
              isolation, and hot-reload patch mechanisms.
            </p>
            <div className="pt-2 text-[11px] font-mono text-indigo-300 flex flex-wrap gap-1.5">
              <span>Java 21</span>
              <span>·</span>
              <span>ASM 9</span>
              <span>·</span>
              <span>Fabric Loom</span>
              <span>·</span>
              <span>Mixins</span>
            </div>
          </div>

          {/* Discipline 3: Native Android Architecture */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-cyan-500/30 transition space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Native Android Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reactive Jetpack Compose, Kotlin Coroutines, NDK C++ JNI bridge, WorkManager background
              scheduling, and offline Room DB caching.
            </p>
            <div className="pt-2 text-[11px] font-mono text-cyan-300 flex flex-wrap gap-1.5">
              <span>Kotlin</span>
              <span>·</span>
              <span>Compose</span>
              <span>·</span>
              <span>NDK JNI</span>
              <span>·</span>
              <span>Media3</span>
            </div>
          </div>

          {/* Discipline 4: Transparent Distribution & Tooling */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 hover:border-emerald-500/30 transition space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Open Tooling & Transparency</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Clean, ad-free direct distribution, explicit version changelogs, verified community
              reviews, and open support channels.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-300 flex flex-wrap gap-1.5">
              <span>Direct Links</span>
              <span>·</span>
              <span>Changelogs</span>
              <span>·</span>
              <span>User Reviews</span>
              <span>·</span>
              <span>No Paywalls</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SOFTWARE RELEASES CATALOG (Portfolio Downloads with Real Firestore Data)
      ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Software Distribution</span>
            </div>
            <h2 className="text-3xl font-black text-white">Release Catalog</h2>
            <p className="text-xs text-zinc-400">
              Verified software packages, mods, APKs, and developer kits published by Obsidiuss.
            </p>
          </div>

          <button
            onClick={() => navigate('resources')}
            className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition"
          >
            <span>View Full Directory ({resources.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? resources.length
                : resources.filter((r) => r.category === cat.id).length;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span className="font-mono text-[10px] text-zinc-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : displayResources.length === 0 ? (
          <div className="p-10 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-white">No releases in this category yet</p>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {isAdmin
                ? 'Open the Admin Panel to upload a new release binary or source bundle.'
                : 'Check back soon or explore other categories in the catalog.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Release</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayResources.map((res) => (
              <div
                key={res.id}
                className="group rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-purple-500/40 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                    {res.thumbnailUrl ? (
                      <img
                        src={res.thumbnailUrl}
                        alt={res.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
                        <Download className="w-10 h-10 text-purple-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-transparent to-transparent" />

                    {/* Unboxed category & version indicator */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-white/10">
                        {res.category} · {res.version}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Unboxed Metadata Row */}
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

                <div className="px-6 pb-6 pt-2 border-t border-white/5">
                  <button
                    onClick={() => onSelectResource(res)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition"
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

      {/* =========================================================================
          LATEST DEVLOG & RESEARCH NOTE STRIP (Real Firestore Announcements)
      ========================================================================== */}
      {latestAnnouncement && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-zinc-900/60 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
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
                <h3 className="text-lg font-bold text-white">{latestAnnouncement.title}</h3>
                <p className="text-xs text-zinc-400 max-w-2xl line-clamp-1">
                  {latestAnnouncement.excerpt}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('announcements')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition shrink-0"
            >
              <span>Read Devlogs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          STUDIO INQUIRIES & DIRECT COLLABORATION (Portfolio Inquiries & Channels)
      ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-950/20 via-[#0a0b12] to-cyan-950/20 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Studio Inquiries & Direct Collaboration</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Connect With Obsidiuss
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Looking for custom client engine integration, mod development, systems architecture,
              or technical bug reporting? Reach out directly across official channels or join the
              community server.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href="https://discord.com/invite/aAgf7bnCNd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm shadow-xl shadow-[#5865F2]/30 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Discord (Active)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href="https://youtube.com/@obsidiuss?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-300 font-bold text-sm transition"
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube Channel</span>
              </a>

              <a
                href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-600/40 text-pink-300 font-bold text-sm transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>

              <button
                onClick={() => navigate('contact')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-200 font-semibold text-sm transition"
              >
                <span>Send Direct Inquiry</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
