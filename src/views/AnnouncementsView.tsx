import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Pin,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import type { NavigateOptions } from '../App';

interface AnnouncementsViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ onNavigate }) => {
  const { announcements, loading } = useData();
  const { showToast } = useToast();

  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!expandedId && sortedAnnouncements.length > 0) {
      setExpandedId(sortedAnnouncements[0].id);
    }
  }, [sortedAnnouncements, expandedId]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Announcement link copied!', 'success');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-300">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Devlogs & Architecture Notes · Obsidiuss</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Devlogs & Platform Updates
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Stay up to date with new client releases, engine patch notes, and official announcements from Obsidiuss.
        </p>
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
            />
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-2">
          <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No announcements posted yet</p>
          <p className="text-xs text-zinc-400">
            Official updates and release changelogs from Obsidiuss will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAnnouncements.map((ann) => {
            const isExpanded = expandedId === ann.id;
            return (
              <div
                key={ann.id}
                className={`rounded-3xl glass-panel border transition duration-300 overflow-hidden ${
                  ann.pinned ? 'border-amber-500/30 bg-amber-950/10' : 'border-white/10'
                }`}
              >
                <div
                  onClick={() => toggleExpand(ann.id)}
                  className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-white/[0.02] transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                      {ann.pinned && (
                        <span className="flex items-center gap-1 font-bold text-amber-300">
                          <Pin className="w-3 h-3 text-amber-400" /> Pinned
                        </span>
                      )}
                      {ann.pinned && <span className="text-zinc-600">·</span>}
                      <span className="font-bold uppercase tracking-wider text-purple-300">
                        {ann.category}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(ann.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-500">By {ann.authorName}</span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white hover:text-purple-300 transition">
                      {ann.title}
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                      {ann.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
                      title="Share announcement"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <div className="p-2 rounded-xl bg-white/[0.04] text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in fade-in duration-200">
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-white/[0.02] p-5 rounded-2xl border border-white/5 font-sans">
                      {ann.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cross-Page Internal Links */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-zinc-400">
          Explore the latest releases mentioned in these announcements or share feedback in the forum.
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('resources');
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition"
          >
            Resource Downloads
          </a>
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('projects');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            Projects Showcase
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('community');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            Community Forum
          </a>
        </div>
      </div>
    </div>
  );
};
