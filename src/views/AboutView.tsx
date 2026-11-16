import React from 'react';
import {
  Youtube,
  MessageSquare,
  Instagram,
  Download,
  FolderGit2,
  Users,
  BookOpen,
  Mail,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { BrandLogo } from '../components/BrandLogo';
import type { NavigateOptions } from '../App';

interface AboutViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenRules }) => {
  const { resources, projects, discussions } = useData();
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
          Owner &amp; Creator Profile
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight [text-wrap:balance]">
          Bhaskar Yadav <span className="text-purple-400">(Obsidiuss)</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Founder, owner, and developer of OBSIDIUSS HUB.
        </p>
      </div>

      {/* Creator Card */}
      <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 bg-gradient-to-br from-purple-950/20 via-[#0d0e17] to-zinc-900/60">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-7 text-center md:text-left">
          <div className="shrink-0">
            <BrandLogo size={108} />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-white">Bhaskar Yadav</h2>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold mt-0.5">
                Handle: Obsidiuss · Owner &amp; Creator
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              Creator behind OBSIDIUSS HUB — building Minecraft mods and clients, Android tools,
              desktop software, and open-source code shared directly with the community without
              paywalls or ad-link redirects.
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <a
                href="https://youtube.com/@obsidiuss?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-semibold transition"
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube (@obsidiuss)</span>
              </a>

              <a
                href="https://discord.com/invite/aAgf7bnCNd"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#9da5ff] text-xs font-semibold transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discord</span>
              </a>

              <a
                href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 border border-pink-600/30 text-pink-400 text-xs font-semibold transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram (@obsidiuss.yt)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Live Verified Platform Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <a
          href="/resources"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('resources');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/5 text-center space-y-1 block"
        >
          <Download className="w-5 h-5 text-purple-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {totalDownloads.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400">Total Downloads</p>
        </a>

        <a
          href="/resources"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('resources');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/5 text-center space-y-1 block"
        >
          <Zap className="w-5 h-5 text-cyan-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {resources.length}
          </div>
          <p className="text-[11px] text-zinc-400">Packages</p>
        </a>

        <a
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('projects');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/5 text-center space-y-1 block"
        >
          <FolderGit2 className="w-5 h-5 text-indigo-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {projects.length}
          </div>
          <p className="text-[11px] text-zinc-400">Projects</p>
        </a>

        <a
          href="/community"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('community');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-white/5 text-center space-y-1 block"
        >
          <Users className="w-5 h-5 text-emerald-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {discussions.length}
          </div>
          <p className="text-[11px] text-zinc-400">Forum Threads</p>
        </a>
      </div>

      {/* Direct Actions */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Get in Touch</h3>
          <p className="text-xs text-zinc-400">
            Message Bhaskar Yadav directly or review community rules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate?.('contact')}
            className="min-h-[42px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Form</span>
          </button>
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="min-h-[42px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 text-xs font-semibold transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Community Rules</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
