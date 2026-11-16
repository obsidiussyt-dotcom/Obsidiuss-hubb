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
      showToast('Sign in to bookmark resources.', 'info');
      openAuth?.();
      return;
    }
    const added = await toggleBookmark(resourceId);
    showToast(added ? 'Saved to your bookmarks!' : 'Removed from bookmarks.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Software Distribution &amp; Packages · Obsidiuss</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Software Releases &amp; Downloads
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Browse and download verified client engines, Minecraft mods, Android APKs, PC software,
          and developer source code packages engineered by Bhaskar Yadav (Obsidiuss).
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
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter by name, tag, or version..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'downloads' | 'rating')}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Recently Added</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-950 font-mono">{filteredResources.length}</strong> resources
        </span>
        {(activeCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              onFilterChange?.('all', '');
            }}
            className="text-blue-600 font-semibold hover:underline"
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
              className="h-80 rounded-3xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-950">
            {resources.length === 0 ? 'No resources published yet' : 'No matching resources found'}
          </p>
          <p className="text-xs text-slate-500">
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
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
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
                className="group rounded-3xl glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {res.thumbnailUrl ? (
                      <img
                        src={res.thumbnailUrl}
                        alt={res.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-sky-500 to-pink-500 flex items-center justify-center">
                        <Download className="w-10 h-10 text-white/60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[10px] font-mono text-blue-700 border border-slate-200 font-bold shadow-sm">
                        {res.category} · {res.version}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleBookmarkToggle(e, res.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-slate-600 hover:text-pink-600 shadow-sm transition"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-pink-600' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-base font-bold text-slate-950 group-hover:text-blue-600 transition line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
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
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">{res.fileSize}</span>
                      <span className="flex items-center gap-1 text-orange-500 font-mono font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />{' '}
                        {res.ratingCount && res.ratingCount > 0 ? res.rating.toFixed(1) : 'New'}
                      </span>
                      <span className="font-mono font-semibold text-blue-600">
                        {(res.downloadsCount || 0).toLocaleString()} dl
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => onSelectResource(res)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-sky-500 text-slate-800 hover:text-white border border-slate-200 hover:border-transparent text-xs font-bold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 group-hover:text-current" />
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
              className="p-4 rounded-2xl glass-panel glass-panel-hover cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-4">
                {res.thumbnailUrl ? (
                  <img
                    src={res.thumbnailUrl}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-mono">
                    <span className="uppercase text-[10px] font-bold text-blue-600">
                      {res.category}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {res.version}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 hover:text-blue-600 transition">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1 max-w-xl mt-0.5">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                <div className="text-left sm:text-right text-xs">
                  <div className="font-mono font-bold text-slate-950">
                    {(res.downloadsCount || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">{res.fileSize}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectResource(res);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
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
      <div className="p-6 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-950">Looking for something specific?</h3>
          <p className="text-xs text-slate-600">
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Projects Showcase</span>
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('community');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>Setup Support Forum</span>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('contact');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Request / Report</span>
          </a>
        </div>
      </div>
    </div>
  );
};
