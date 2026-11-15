import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Youtube,
  MessageSquare,
  Instagram,
  Code2,
  Zap,
  Download,
  FolderGit2,
  Users,
  BookOpen,
  Mail,
  Cpu,
  Terminal,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { NavigateOptions } from '../App';

interface AboutViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenRules }) => {
  const { resources, projects, discussions } = useData();
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

  const faqs = [
    {
      q: 'What is Obsidiuss specializing in?',
      a: 'Custom low-latency Minecraft client engines, JVM bytecode manipulation with Fabric & ASM, hardware-accelerated Android system utilities, and open-source tooling.',
    },
    {
      q: 'Are the software packages and client builds free to download?',
      a: 'Yes. All releases published on this portfolio are shared directly with the community without paywalls, subscriptions, or malicious ad-redirect links.',
    },
    {
      q: 'How are software releases documented?',
      a: 'Every package includes target runtime requirements, version changelogs, direct download links, and community ratings and reviews.',
    },
    {
      q: 'Can I study and build upon the open-source code repositories?',
      a: 'Yes. Any open-source project or starter kit published in the Source Codes catalog is designed for developers to inspect, learn from, and adapt.',
    },
    {
      q: 'How do I submit an inquiry, bug report, or mod request?',
      a: 'You can reach out via the official Discord server, leave a comment under any release or topic, or send a direct inquiry via the Contact page.',
    },
    {
      q: 'What runtime environments are supported?',
      a: 'Each software release specifies its exact runtime requirements (such as Minecraft loader/version, Java runtime, or Android version) in its Requirements & Setup tab.',
    },
  ];

  const devSetupSpecs = [
    { label: 'Primary Languages', value: 'Java 21 · Kotlin · TypeScript · C++ (JNI)' },
    { label: 'Client Frameworks', value: 'Fabric Loom · LWJGL 3 · OpenGL 4.5 · ASM' },
    { label: 'Mobile Architecture', value: 'Jetpack Compose · Coroutines · Room · NDK' },
    { label: 'Tooling & CI/CD', value: 'Gradle · Vite · Linux · Git · GitHub Actions' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Intro Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-purple-300">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Biography & Engineering Profile</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About Obsidiuss
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Systems developer, Minecraft modding architect, and software engineer dedicated to
          performance, clean distribution, and community empowerment.
        </p>
      </div>

      {/* Creator Profile Bento Card */}
      <div className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 bg-gradient-to-br from-purple-950/20 via-[#0d0e17] to-zinc-900/60 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-1 shrink-0 shadow-2xl shadow-purple-900/40">
            <div className="w-full h-full rounded-[20px] bg-[#0b0c14] flex items-center justify-center">
              <span className="text-5xl font-black bg-gradient-to-br from-white via-purple-200 to-cyan-400 bg-clip-text text-transparent">
                Ω
              </span>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-white">Obsidiuss</h2>
              <span className="text-xs font-mono text-purple-300 uppercase tracking-wider font-semibold">
                Systems Developer & Modding Architect
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Obsidiuss engineers low-latency client engines, JVM bytecode optimization utilities,
              and native Android software. This portfolio serves as the centralized distribution
              and architecture showcase for all live releases, projects, and community discussions.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://youtube.com/@obsidiuss?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-semibold transition"
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube (@obsidiuss)</span>
              </a>

              <a
                href="https://discord.com/invite/aAgf7bnCNd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#9da5ff] text-xs font-semibold transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discord Server</span>
              </a>

              <a
                href="https://www.instagram.com/obsidiuss.yt?mdxt=MWJ1aXcyNWFpeXQ2bA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 border border-pink-600/30 text-pink-400 text-xs font-semibold transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram (@obsidiuss.yt)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Development Environment & Technical Stack Specs */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Engineering Environment & Core Toolchains</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devSetupSpecs.map((spec) => (
              <div
                key={spec.label}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-zinc-500 uppercase">{spec.label}</span>
                <span className="text-xs font-mono font-semibold text-zinc-200 mt-1">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Verified Platform Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <p className="text-[11px] text-zinc-400">Published Packages</p>
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
          <p className="text-[11px] text-zinc-400">Published Projects</p>
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
          <p className="text-[11px] text-zinc-400">Community Threads</p>
        </a>
      </div>

      {/* Core Engineering Principles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-white text-center">Engineering Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Sub-Millisecond Latency</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every client optimization pass targets tickrate consistency, raw frame pacing, and
              minimal GC churn through off-heap memory allocations.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Uncompromised Distribution</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero ad-link shorteners, zero bundled adware, and zero paywalls. Everything is delivered
              directly with explicit version histories, setup notes, and community reviews.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Open Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Providing source code, modular templates, and technical devlogs so fellow developers and
              modders can extend client features cleanly.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-white text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-panel border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white">{faq.q}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Quick Links Strip */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Explore Software & Inquiries</h3>
          <p className="text-xs text-zinc-400">
            Download client binaries, participate in community discussions, or request custom tooling.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('resources');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Releases</span>
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('community');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 text-xs font-semibold transition"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Community</span>
          </a>
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 text-xs font-semibold transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Rules</span>
            </button>
          )}
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('contact');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 text-xs font-semibold transition"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Contact</span>
          </a>
        </div>
      </div>
    </div>
  );
};
