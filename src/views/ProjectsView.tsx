import React from 'react';
import {
  FolderGit2,
  ExternalLink,
  Github,
  Star,
  Download,
  Plus,
  Users,
  Mail,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { NavigateOptions } from '../App';

interface ProjectsViewProps {
  setCurrentTab: (tab: string) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  openAuth?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  setCurrentTab,
  onNavigate,
  openAuth,
}) => {
  const { projects, loading, starredProjectIds, toggleProjectStar } = useData();
  const { profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const handleStarClick = async (projectId: string) => {
    if (!profile) {
      showToast('Sign in with Google to star projects.', 'info');
      openAuth?.();
      return;
    }
    try {
      const starred = await toggleProjectStar(projectId);
      showToast(starred ? 'Project starred!' : 'Star removed.', 'info');
    } catch {
      showToast('Could not update star.', 'error');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Portfolio Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-purple-300">
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span>Selected Works & Engineering Builds · Obsidiuss</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Engineering Projects & Systems
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
          Explore published client builds, utilities, and open-source systems engineered by Obsidiuss.
        </p>
      </div>

      {/* Published Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <span>Published Projects ({projects.length})</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project in Admin</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
              />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-3">
            <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-base font-bold text-white">No Projects Published Yet</p>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {isAdmin
                ? 'Use the Admin Panel to add your real software projects, repositories, and builds.'
                : 'Projects and open-source repositories will appear here once published by Obsidiuss.'}
            </p>
            <button
              onClick={() => (onNavigate ?? setCurrentTab)('resources')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Browse Release Downloads</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedProjects.map((proj) => {
              const isStarred = starredProjectIds.has(proj.id);
              return (
                <div
                  key={proj.id}
                  className="group rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-60 w-full overflow-hidden bg-zinc-900">
                      {proj.bannerUrl ? (
                        <img
                          src={proj.bannerUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-950/70 via-[#0d0e17] to-purple-950/60 flex items-center justify-center">
                          <FolderGit2 className="w-12 h-12 text-indigo-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f18] via-[#0e0f18]/40 to-transparent" />

                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-mono text-indigo-300 border border-white/10">
                          {proj.category} · {proj.status}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStarClick(proj.id)}
                        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md text-xs font-mono font-bold border transition ${
                          isStarred
                            ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                            : 'bg-black/60 text-amber-400 border-white/10 hover:bg-black/80'
                        }`}
                        title={isStarred ? 'Remove star' : 'Star this project'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
                        <span>{proj.stars || 0}</span>
                      </button>
                    </div>

                    <div className="p-6 sm:p-7 space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition">
                          {proj.title}
                        </h3>
                        <p className="text-xs font-semibold text-purple-400 mt-1">{proj.tagline}</p>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                        {proj.description}
                      </p>

                      {proj.tags?.length > 0 && (
                        <div className="pt-2 text-xs font-mono text-zinc-400 flex flex-wrap gap-2">
                          {proj.tags.map((tag, idx) => (
                            <React.Fragment key={tag}>
                              <span>{tag}</span>
                              {idx < proj.tags.length - 1 && <span className="text-zinc-600">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold transition"
                        >
                          <Github className="w-4 h-4" />
                          <span>Source</span>
                        </a>
                      )}

                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold transition"
                        >
                          <ExternalLink className="w-4 h-4 text-cyan-400" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    {proj.downloadUrl && (
                      <a
                        href={proj.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 transition active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Get Build</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Internal Navigation Links */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Direct Engineering Releases & Inquiries</h3>
          <p className="text-xs text-zinc-400">
            Download production binaries, discuss mod architecture, or send direct inquiries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              (onNavigate ?? setCurrentTab)('resources');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Download Packages</span>
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              (onNavigate ?? setCurrentTab)('community');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discussions</span>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              (onNavigate ?? setCurrentTab)('contact');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-bold text-indigo-200 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inquire / Collaborate</span>
          </a>
        </div>
      </div>
    </div>
  );
};
