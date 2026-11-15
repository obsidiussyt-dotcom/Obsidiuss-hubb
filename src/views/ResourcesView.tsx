import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Search,
  Star,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Bookmark,
  Layers,
  FolderGit2,
  Users,
  Mail,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Resource, ResourceCategory } from '../types';
import type { NavigateOptions } from '../App';

interface ResourcesViewProps {
  onSelectResource: (resource: Resource) => void;
  openAuth?: () => void;
  initialCategory?: ResourceCategory;
  initialSearch?: string;
  onFilterChange?: (category: ResourceCategory, search: string) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
}

const DEFAULT_CATEGORIES: { id: ResourceCategory; label: string }[] = [
  { id: 'all', label: 'All Resources' },
  { id: 'minecraft', label: 'Minecraft Mods & Clients' },
  { id: 'android', label: 'Android Apps & APKs' },
  { id: 'pc-software', label: 'PC Software & Tools' },
  { id: 'source-code', label: 'Source Codes' },
  { id: 'tutorials', label: 'Tutorials & Guides' },
  { id: 'dev-tools', label: 'Dev Tools' },
];

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  onSelectResource,
  openAuth,
  initialCategory = 'all',
  initialSearch = '',
  onFilterChange,
  onNavigate,
}) => {
  const { resources, categories: customCategories, loading } = useData();
  const { profile, toggleBookmark } = useAuth();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<ResourceCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const handleCategoryChange = (cat: ResourceCategory) => {
    setActiveCategory(cat);
    onFilterChange?.(cat, searchQuery);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    onFilterChange?.(activeCategory, q);
  };

  const categories = useMemo(() => {
    const baseSlugs = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
    const merged = [
      ...DEFAULT_CATEGORIES,
      ...customCategories
        .filter((c) => !baseSlugs.has(c.slug))
        .map((c) => ({ id: c.slug, label: c.name })),
    ];

    return merged.map((c) => ({
      ...c,
      count:
        c.id === 'all'
          ? resources.length
          : resources.filter((r) => r.category === c.id).length,
    }));
  }, [resources, customCategories]);

  const filteredResources = useMemo(() => {
    return resources
      .filter((item) => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return (b.downloadsCount || 0) - (a.downloadsCount || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [resources, activeCategory, searchQuery, sortBy]);

  const handleBookmarkToggle = async (e: React.MouseEvent, resourceId: string) => {
    e.stopPropagation();
    if (!profile) {
      showToast('Sign in with Google to bookmark resources.', 'info');
      openAuth?.();
      return;
    }
    const added = await toggleBookmark(resourceId);
    showToast(added ? 'Saved to your bookmarks!' : 'Removed from bookmarks.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-purple-300">
          <Download className="w-4 h-4 text-purple-400" />
          <span>Software Distribution & Packages · Obsidiuss</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Software Releases & Downloads
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Browse and download verified client engines, Minecraft mods, Android APKs, PC software,
          and developer source code packages engineered by Obsidiuss.
        </p>
      </div>

      {/* Control Bar: Categories, Search & Sort */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter by name, tag, or version..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'downloads' | 'rating')}
                className="bg-white/[0.04] border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="newest" className="bg-zinc-900">Recently Added</option>
                <option value="downloads" className="bg-zinc-900">Most Downloaded</option>
                <option value="rating" className="bg-zinc-900">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{filteredResources.length}</strong> resources
        </span>
        {(activeCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              onFilterChange?.('all', '');
            }}
            className="text-purple-400 hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Resources Cards / Loading / Empty */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
            />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">
            {resources.length === 0 ? 'No resources published yet' : 'No matching resources found'}
          </p>
          <p className="text-xs text-zinc-400">
            {resources.length === 0
              ? 'Resources published by Obsidiuss will appear here automatically.'
              : `No downloads match "${searchQuery || activeCategory}".`}
          </p>
          {resources.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                onFilterChange?.('all', '');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isBookmarked = profile?.bookmarks?.includes(res.id);
            return (
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
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
                        <Download className="w-10 h-10 text-purple-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-white/10 font-semibold">
                        {res.category} · {res.version}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleBookmarkToggle(e, res.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 hover:text-purple-300 transition"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-purple-400' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>

                    {res.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {res.tags.slice(0, 3).map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSearchChange(tag);
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.03] hover:bg-purple-500/20 text-zinc-400 hover:text-purple-300 border border-white/5 transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-mono">{res.fileSize}</span>
                      <span className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />{' '}
                        {res.ratingCount && res.ratingCount > 0 ? res.rating.toFixed(1) : 'New'}
                      </span>
                      <span className="font-mono text-purple-300">
                        {(res.downloadsCount || 0).toLocaleString()} dl
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => onSelectResource(res)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 text-zinc-200 hover:text-white border border-white/10 hover:border-transparent text-xs font-bold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download Resource</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              onClick={() => onSelectResource(res)}
              className="p-4 rounded-2xl glass-panel glass-panel-hover cursor-pointer border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4">
                {res.thumbnailUrl ? (
                  <img
                    src={res.thumbnailUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6 text-purple-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-mono">
                    <span className="uppercase text-[10px] font-bold text-purple-300">
                      {res.category}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[11px] text-zinc-400 font-semibold">
                      {res.version}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white hover:text-purple-300 transition">
                    {res.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl mt-0.5">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                <div className="text-left sm:text-right text-xs">
                  <div className="font-mono font-bold text-white">
                    {(res.downloadsCount || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">{res.fileSize}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectResource(res);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-900/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cross-Page Internal Navigation Strip */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Looking for something specific?</h3>
          <p className="text-xs text-zinc-400">
            Explore full project showcases, ask setup questions in the forum, or request a new release.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('projects');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects Showcase</span>
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('community');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Setup Support Forum</span>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('contact');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Request / Report</span>
          </a>
        </div>
      </div>
    </div>
  );
};
