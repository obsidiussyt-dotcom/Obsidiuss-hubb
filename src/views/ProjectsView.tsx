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
      showToast('Sign in to star projects.', 'info');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-up">
      {/* Portfolio Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600">
          <FolderGit2 className="w-4 h-4 text-blue-600" />
          <span>Selected Works &amp; Engineering Builds · Obsidiuss</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Engineering Projects &amp; Systems
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Explore published client builds, utilities, and open-source systems engineered by Bhaskar Yadav (Obsidiuss).
        </p>
      </div>

      {/* Published Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Published Projects ({projects.length})</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition"
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
                className="h-80 rounded-3xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-base font-bold text-slate-950">No Projects Published Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isAdmin
                ? 'Use the Admin Panel to add your real software projects, repositories, and builds.'
                : 'Projects and open-source repositories will appear here once published by Obsidiuss.'}
            </p>
            <button
              onClick={() => (onNavigate ?? setCurrentTab)('resources')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
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
                  className="group rounded-3xl glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                      {proj.bannerUrl ? (
                        <img
                          src={proj.bannerUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-sky-500 to-pink-500 flex items-center justify-center">
                          <FolderGit2 className="w-12 h-12 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-mono font-bold text-blue-700 border border-slate-200 shadow-sm">
                          {proj.category} · {proj.status}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStarClick(proj.id)}
                        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-xl backdrop-blur-md text-xs font-mono font-bold border shadow-sm transition ${
                          isStarred
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white/95 text-orange-600 border-slate-200 hover:bg-orange-50'
                        }`}
                        title={isStarred ? 'Remove star' : 'Star this project'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
                        <span>{proj.stars || 0}</span>
                      </button>
                    </div>

                    <div className="p-6 sm:p-7 space-y-4">
                      <div>
                        <h3 className="font-display text-xl font-black text-slate-950 group-hover:text-blue-600 transition">
                          {proj.title}
                        </h3>
                        <p className="text-xs font-semibold text-pink-600 mt-1">{proj.tagline}</p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {proj.description}
                      </p>

                      {proj.tags?.length > 0 && (
                        <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap gap-2">
                          {proj.tags.map((tag, idx) => (
                            <React.Fragment key={tag}>
                              <span>{tag}</span>
                              {idx < proj.tags.length - 1 && <span className="text-slate-300">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition"
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
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    {proj.downloadUrl && (
                      <a
                        href={proj.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95"
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
      <div className="p-6 sm:p-8 rounded-3xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-950">Direct Engineering Releases &amp; Inquiries</h3>
          <p className="text-xs text-slate-600">
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Packages</span>
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              (onNavigate ?? setCurrentTab)('community');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>Discussions</span>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              (onNavigate ?? setCurrentTab)('contact');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inquire / Collaborate</span>
          </a>
        </div>
      </div>
    </div>
  );
};
