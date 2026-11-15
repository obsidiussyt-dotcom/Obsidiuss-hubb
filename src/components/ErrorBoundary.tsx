import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('OBSIDIUSS HUB ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090d] text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl glass-panel border border-rose-500/25 p-8 text-center space-y-5 bg-[#0e0f17]">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-white">Something went wrong</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                OBSIDIUSS HUB hit an unexpected rendering issue. You can reload the page or return
                home.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <a
                href="/"
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-200 text-xs font-semibold transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
