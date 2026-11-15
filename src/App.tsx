/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/PWAControls';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { CommunityRulesModal } from './components/CommunityRulesModal';
import { HomeView } from './views/HomeView';
import { ResourcesView } from './views/ResourcesView';
import { ProjectsView } from './views/ProjectsView';
import { CommunityView } from './views/CommunityView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { UserDashboardView } from './views/UserDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { NotFoundView } from './views/NotFoundView';
import { Resource, ResourceCategory } from './types';

export interface NavigateOptions {
  category?: ResourceCategory;
  search?: string;
  resourceId?: string;
  threadId?: string;
}

const VALID_TABS = new Set([
  'home',
  'resources',
  'projects',
  'community',
  'announcements',
  'about',
  'contact',
  'dashboard',
  'admin',
]);

const TAB_META: Record<string, { title: string; description: string }> = {
  home: {
    title: 'OBSIDIUSS – Systems Developer & Creator Portfolio',
    description:
      'Portfolio and engineering platform of Obsidiuss: High-performance Minecraft clients, JVM optimizations, Android utilities, open-source software, and developer tools.',
  },
  resources: {
    title: 'Software Releases & Downloads | OBSIDIUSS',
    description:
      'Browse and download Minecraft mods, clients, Android apps, PC software, source code, and developer guides by Obsidiuss.',
  },
  projects: {
    title: 'Selected Works & Engineering Projects | OBSIDIUSS',
    description:
      'Explore standalone game clients, native Android utilities, and open-source applications engineered by Obsidiuss.',
  },
  community: {
    title: 'Community Discussions | OBSIDIUSS',
    description:
      'Join OBSIDIUSS community discussions, ask for mod setup support, share suggestions, and connect with members.',
  },
  announcements: {
    title: 'Devlogs & Platform Updates | OBSIDIUSS',
    description:
      'Read technical devlogs, release changelogs, and architecture notes from Obsidiuss.',
  },
  about: {
    title: 'About Obsidiuss – Systems Developer & Modding Architect',
    description:
      'Learn about Obsidiuss, engineering principles, technical disciplines, live platform metrics, and frequently asked questions.',
  },
  contact: {
    title: 'Contact & Collaboration | OBSIDIUSS',
    description:
      'Send direct engineering inquiries, bug reports, feature suggestions, or collaboration requests to Obsidiuss.',
  },
  dashboard: {
    title: 'Member Dashboard | OBSIDIUSS',
    description:
      'Manage your profile, bookmarked resources, download history, and community topics.',
  },
  admin: {
    title: 'Admin Control Panel | OBSIDIUSS',
    description: 'Manage resources, projects, announcements, users, categories, and moderation.',
  },
  '404': {
    title: 'Page Not Found | OBSIDIUSS HUB',
    description: 'The requested page could not be found on OBSIDIUSS HUB.',
  },
};

export function buildHref(tab: string, options?: NavigateOptions): string {
  const basePath = tab === 'home' ? '/' : `/${tab}`;
  if (!options) return basePath;
  const params = new URLSearchParams();
  if (options.category && options.category !== 'all') params.set('category', options.category);
  if (options.search?.trim()) params.set('q', options.search.trim());
  if (options.resourceId) params.set('resource', options.resourceId);
  if (options.threadId) params.set('thread', options.threadId);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getTabFromPath(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return 'home';
  if (VALID_TABS.has(clean)) return clean;
  return '404';
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: (params.get('category') as ResourceCategory) || 'all',
    search: params.get('q') || '',
    resourceId: params.get('resource') || null,
    threadId: params.get('thread') || null,
  };
}

function MainApp() {
  const { resources } = useData();
  const { isAdmin } = useAuth();
  const initialParams = readUrlParams();

  const [currentTab, setCurrentTabState] = useState<string>(() =>
    getTabFromPath(window.location.pathname)
  );
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>(
    initialParams.category
  );
  const [resourceSearch, setResourceSearch] = useState<string>(initialParams.search);
  const [pendingResourceId, setPendingResourceId] = useState<string | null>(
    initialParams.resourceId
  );
  const [communityThreadId, setCommunityThreadId] = useState<string | null>(
    initialParams.threadId
  );

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [reportState, setReportState] = useState<{
    isOpen: boolean;
    targetId: string;
    targetTitle: string;
    targetType: 'resource' | 'discussion' | 'comment' | 'review';
  }>({
    isOpen: false,
    targetId: '',
    targetTitle: '',
    targetType: 'resource',
  });

  const navigateTo = useCallback((tab: string, options?: NavigateOptions) => {
    setCurrentTabState(tab);

    if (tab === 'resources') {
      setResourceCategory(options?.category ?? 'all');
      setResourceSearch(options?.search ?? '');
      if (options?.resourceId) {
        setPendingResourceId(options.resourceId);
      }
    } else if (tab === 'community') {
      setCommunityThreadId(options?.threadId ?? null);
    }

    const targetUrl = buildHref(tab, options);
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) {
      window.history.pushState({ tab, options }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setCurrentTab = useCallback(
    (tab: string) => {
      navigateTo(tab);
    },
    [navigateTo]
  );

  // Sync deep-linked ?resource=<id> once Firestore resources arrive
  useEffect(() => {
    if (pendingResourceId && resources.length > 0) {
      const match = resources.find((r) => r.id === pendingResourceId);
      if (match) {
        setSelectedResource(match);
      }
      setPendingResourceId(null);
    }
  }, [pendingResourceId, resources]);

  // Handle browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const nextTab = getTabFromPath(window.location.pathname);
      const params = readUrlParams();
      setCurrentTabState(nextTab);
      setResourceCategory(params.category);
      setResourceSearch(params.search);
      setCommunityThreadId(params.threadId);
      if (params.resourceId) {
        const match = resources.find((r) => r.id === params.resourceId);
        setSelectedResource(match || null);
      } else {
        setSelectedResource(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resources]);

  // Dynamic Page Title, Meta Description & Canonical URL per route
  useEffect(() => {
    const meta =
      currentTab === 'admin' && !isAdmin
        ? { title: 'Restricted Area | OBSIDIUSS HUB', description: 'Restricted area on OBSIDIUSS HUB.' }
        : TAB_META[currentTab] || TAB_META['404'];
    document.title = selectedResource
      ? `${selectedResource.title} (${selectedResource.version}) | OBSIDIUSS HUB`
      : meta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute(
        'content',
        selectedResource ? selectedResource.description.slice(0, 155) : meta.description
      );
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, [currentTab, selectedResource, isAdmin]);

  // Scroll-to-Top visibility listener
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Global keyboard shortcut for Quick Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectResource = useCallback(
    (resource: Resource) => {
      setSelectedResource(resource);
      if (currentTab === 'resources') {
        const nextUrl = buildHref('resources', {
          category: resourceCategory !== 'all' ? resourceCategory : undefined,
          search: resourceSearch || undefined,
          resourceId: resource.id,
        });
        window.history.replaceState(null, '', nextUrl);
      }
    },
    [currentTab, resourceCategory, resourceSearch]
  );

  const handleCloseResourceModal = useCallback(() => {
    setSelectedResource(null);
    if (new URLSearchParams(window.location.search).has('resource')) {
      const cleanUrl =
        currentTab === 'resources'
          ? buildHref('resources', {
              category: resourceCategory !== 'all' ? resourceCategory : undefined,
              search: resourceSearch || undefined,
            })
          : buildHref(currentTab);
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [currentTab, resourceCategory, resourceSearch]);

  const handleThreadChange = useCallback(
    (threadId: string | null) => {
      setCommunityThreadId(threadId);
      if (currentTab === 'community') {
        const nextUrl = buildHref('community', threadId ? { threadId } : undefined);
        if (window.location.pathname + window.location.search !== nextUrl) {
          window.history.pushState({ tab: 'community', threadId }, '', nextUrl);
        }
      }
    },
    [currentTab]
  );

  const openReport = (
    targetId: string,
    targetTitle: string,
    targetType: 'resource' | 'discussion' | 'comment' | 'review' = 'resource'
  ) => {
    setReportState({
      isOpen: true,
      targetId,
      targetTitle,
      targetType,
    });
  };

  const closeReport = () => {
    setReportState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-purple-600 focus:text-white focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSearch={() => setIsSearchOpen(true)}
        openAuth={() => setIsAuthOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main id="main-content" className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            setCurrentTab={setCurrentTab}
            onNavigate={navigateTo}
            onSelectResource={handleSelectResource}
            openAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'resources' && (
          <ResourcesView
            onSelectResource={handleSelectResource}
            openAuth={() => setIsAuthOpen(true)}
            initialCategory={resourceCategory}
            initialSearch={resourceSearch}
            onFilterChange={(cat, q) => {
              setResourceCategory(cat);
              setResourceSearch(q);
              const nextUrl = buildHref('resources', {
                category: cat !== 'all' ? cat : undefined,
                search: q || undefined,
              });
              window.history.replaceState(null, '', nextUrl);
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsView
            setCurrentTab={setCurrentTab}
            onNavigate={navigateTo}
            openAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'community' && (
          <CommunityView
            openAuth={() => setIsAuthOpen(true)}
            onOpenReport={openReport}
            onOpenRules={() => setIsRulesOpen(true)}
            selectedThreadId={communityThreadId}
            onThreadChange={handleThreadChange}
            onNavigate={navigateTo}
          />
        )}

        {currentTab === 'announcements' && <AnnouncementsView onNavigate={navigateTo} />}

        {currentTab === 'about' && (
          <AboutView onNavigate={navigateTo} onOpenRules={() => setIsRulesOpen(true)} />
        )}

        {currentTab === 'contact' && (
          <ContactView onNavigate={navigateTo} onOpenRules={() => setIsRulesOpen(true)} />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboardView
            onSelectResource={handleSelectResource}
            setCurrentTab={setCurrentTab}
            onNavigate={navigateTo}
            openAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView
            openAuth={() => setIsAuthOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === '404' && (
          <NotFoundView
            onNavigate={navigateTo}
            onGoHome={() => setCurrentTab('home')}
            onGoResources={() => setCurrentTab('resources')}
          />
        )}
      </main>

      <Footer
        setCurrentTab={setCurrentTab}
        onNavigate={navigateTo}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-[#12131f]/90 hover:bg-purple-600 text-zinc-200 hover:text-white border border-white/10 shadow-xl backdrop-blur-md transition active:scale-95"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <OfflineBanner />

      <DownloadModal
        resource={selectedResource}
        onClose={handleCloseResourceModal}
        onOpenReport={(id, title, type = 'resource') => openReport(id, title, type)}
        openAuth={() => setIsAuthOpen(true)}
        onNavigate={navigateTo}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResource={handleSelectResource}
        onNavigateTab={navigateTo}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <CommunityRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ReportModal
        isOpen={reportState.isOpen}
        onClose={closeReport}
        targetId={reportState.targetId}
        targetTitle={reportState.targetTitle}
        targetType={reportState.targetType}
        openAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
