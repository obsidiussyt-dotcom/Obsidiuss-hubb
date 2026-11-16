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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12 animate-fade-up">
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-wider uppercase text-blue-600">
          Owner &amp; Creator Profile
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight [text-wrap:balance]">
          Bhaskar Yadav <span className="text-blue-600">(Obsidiuss)</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Founder, owner, and developer of OBSIDIUSS HUB.
        </p>
      </div>

      {/* Creator Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 bg-gradient-to-br from-white via-blue-50/40 to-pink-50/30">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-7 text-center md:text-left">
          <div className="shrink-0">
            <BrandLogo size={108} />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-black text-slate-950">Bhaskar Yadav</h2>
              <p className="text-xs font-mono text-blue-600 uppercase tracking-wider font-semibold mt-0.5">
                Handle: Obsidiuss · Owner &amp; Creator
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Creator behind OBSIDIUSS HUB — building Minecraft mods and clients, Android tools,
              desktop software, and open-source code shared directly with the community without
              paywalls or ad-link redirects.
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <a
                href="https://youtube.com/@obsidiuss?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition"
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube (@obsidiuss)</span>
              </a>

              <a
                href="https://discord.com/invite/aAgf7bnCNd"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discord</span>
              </a>

              <a
                href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 text-xs font-semibold transition"
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
          className="p-5 rounded-2xl glass-panel glass-panel-hover text-center space-y-1 block"
        >
          <Download className="w-5 h-5 text-blue-600 mx-auto" />
          <div className="font-display text-2xl font-black text-slate-950 font-mono tabular-nums">
            {totalDownloads.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Total Downloads</p>
        </a>

        <a
          href="/resources"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('resources');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover text-center space-y-1 block"
        >
          <Zap className="w-5 h-5 text-orange-500 mx-auto" />
          <div className="font-display text-2xl font-black text-slate-950 font-mono tabular-nums">
            {resources.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Packages</p>
        </a>

        <a
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('projects');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover text-center space-y-1 block"
        >
          <FolderGit2 className="w-5 h-5 text-sky-600 mx-auto" />
          <div className="font-display text-2xl font-black text-slate-950 font-mono tabular-nums">
            {projects.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Projects</p>
        </a>

        <a
          href="/community"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('community');
          }}
          className="p-5 rounded-2xl glass-panel glass-panel-hover text-center space-y-1 block"
        >
          <Users className="w-5 h-5 text-pink-500 mx-auto" />
          <div className="font-display text-2xl font-black text-slate-950 font-mono tabular-nums">
            {discussions.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Forum Threads</p>
        </a>
      </div>

      {/* Direct Actions */}
      <div className="p-6 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-950">Get in Touch</h3>
          <p className="text-xs text-slate-600">
            Message Bhaskar Yadav directly or review community rules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate?.('contact')}
            className="min-h-[42px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Form</span>
          </button>
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="min-h-[42px] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-500" />
              <span>Community Rules</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
