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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-orange-600">
          <Bell className="w-4 h-4 text-orange-500" />
          <span>Devlogs &amp; Architecture Notes · Obsidiuss</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Devlogs &amp; Platform Updates
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Stay up to date with new client releases, engine patch notes, and official announcements from Bhaskar Yadav (Obsidiuss).
        </p>
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-3xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-950">No announcements posted yet</p>
          <p className="text-xs text-slate-500">
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
                className={`rounded-3xl glass-panel transition duration-300 overflow-hidden ${
                  ann.pinned ? 'border-orange-300 bg-orange-50/40' : ''
                }`}
              >
                <div
                  onClick={() => toggleExpand(ann.id)}
                  className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                      {ann.pinned && (
                        <span className="flex items-center gap-1 font-bold text-orange-600">
                          <Pin className="w-3 h-3 text-orange-500" /> Pinned
                        </span>
                      )}
                      {ann.pinned && <span className="text-slate-300">·</span>}
                      <span className="font-bold uppercase tracking-wider text-blue-600">
                        {ann.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ann.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">By {ann.authorName}</span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold text-slate-950 hover:text-blue-600 transition">
                      {ann.title}
                    </h2>
                    <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                      {ann.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                      title="Share announcement"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    <div className="max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200 font-sans">
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
      <div className="p-6 rounded-3xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-600">
          Explore the latest releases mentioned in these announcements or share feedback in the forum.
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('resources');
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm"
          >
            Resource Downloads
          </a>
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('projects');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            Projects Showcase
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('community');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            Community Forum
          </a>
        </div>
      </div>
    </div>
  );
};
