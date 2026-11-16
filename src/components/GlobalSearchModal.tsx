import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Download,
  FolderGit2,
  Bell,
  Users,
  ArrowRight,
  Film,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Resource } from '../types';
import type { NavigateOptions } from '../App';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResource: (resource: Resource) => void;
  onNavigateTab: (tab: string, options?: NavigateOptions) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResource,
  onNavigateTab,
}) => {
  const { resources, projects, announcements, discussions, reels } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return { resources: [], projects: [], announcements: [], discussions: [], reels: [] };
    }
    const query = searchTerm.toLowerCase();

    const matchedResources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(query)) ||
        r.category.toLowerCase().includes(query)
    );

    const matchedProjects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(query))
    );

    const matchedAnnouncements = announcements.filter(
      (a) => a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query)
    );

    const matchedDiscussions = discussions.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(query))
    );

    const matchedReels = reels.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        (r.caption || '').toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.authorName.toLowerCase().includes(query)
    );

    return {
      resources: matchedResources.slice(0, 5),
      projects: matchedProjects.slice(0, 3),
      announcements: matchedAnnouncements.slice(0, 3),
      discussions: matchedDiscussions.slice(0, 4),
      reels: matchedReels.slice(0, 3),
    };
  }, [searchTerm, resources, projects, announcements, discussions, reels]);

  if (!isOpen) return null;

  const totalResults =
    searchResults.resources.length +
    searchResults.projects.length +
    searchResults.announcements.length +
    searchResults.discussions.length +
    searchResults.reels.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-800 overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources, reels, projects, announcements, or forum..."
            autoFocus
            className="w-full bg-transparent text-slate-950 placeholder-slate-400 text-sm focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-900"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-700">Search across OBSIDIUSS HUB</p>
              <p className="mt-1">Enter keywords to search resources, reels, projects, updates, and forum posts.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-700">No results found for "{searchTerm}"</p>
              <p className="mt-1 text-slate-400">Try checking spelling or use broader keywords.</p>
            </div>
          ) : (
            <>
              {searchResults.resources.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Downloads & Resources
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.resources.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => {
                          onSelectResource(res);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition text-left group"
                      >
                        <div className="flex items-center gap-3">
                          {res.thumbnailUrl ? (
                            <img
                              src={res.thumbnailUrl}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                              <Download className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {res.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {res.category.toUpperCase()} · {res.version} · {res.fileSize}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.reels.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-600 mb-2 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Reels
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.reels.map((reel) => (
                      <button
                        key={reel.id}
                        onClick={() => {
                          onNavigateTab('reels', { reelId: reel.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50/70 border border-slate-200/80 hover:border-pink-200 transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-pink-600 transition">
                            {reel.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {reel.category} · By {reel.authorName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5" /> Projects
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onNavigateTab('projects');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-200 transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                            {proj.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-md">
                            {proj.tagline}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.discussions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Community Discussions
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.discussions.map((disc) => (
                      <button
                        key={disc.id}
                        onClick={() => {
                          onNavigateTab('community', { threadId: disc.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                            {disc.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            By {disc.authorName} · {disc.repliesCount || 0} replies · {disc.likesCount || 0} likes
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.announcements.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-2 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" /> Devlogs & Updates
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.announcements.map((ann) => (
                      <button
                        key={ann.id}
                        onClick={() => {
                          onNavigateTab('announcements');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200 transition text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition">
                            {ann.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-md">
                            {ann.excerpt}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
