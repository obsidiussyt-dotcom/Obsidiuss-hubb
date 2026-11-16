import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import type { NavigateOptions } from '../App';

interface ContactViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onOpenRules }) => {
  const { submitFeedback } = useData();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      showToast('Message sent to Bhaskar Yadav (Obsidiuss).', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      showToast('Could not send message. Please try again or join Discord.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 animate-fade-up">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-wider uppercase text-blue-600">
          Direct Contact · Bhaskar Yadav (Obsidiuss)
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Contact Owner
        </h1>
        <p className="text-sm text-slate-600">
          Send a bug report, feature suggestion, or collaboration inquiry directly to Bhaskar Yadav.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="lg:col-span-3 rounded-3xl glass-panel p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-950">Message Sent</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your message has been delivered to Bhaskar Yadav (Obsidiuss).
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="min-h-[42px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Bug report, request, or inquiry"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Write your message..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-700 hover:to-sky-600 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-sm font-bold">Discord Support</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Join the official OBSIDIUSS Discord server for quick help and updates.
            </p>
            <a
              href="https://discord.com/invite/aAgf7bnCNd"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-sm transition"
            >
              <span>Join Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-950 text-sm">Owner</h4>
            <p className="flex items-center gap-2 text-slate-800 font-medium">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Bhaskar Yadav (Obsidiuss)</span>
            </p>
            {onOpenRules && (
              <button
                type="button"
                onClick={onOpenRules}
                className="min-h-[42px] w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition text-left"
              >
                <BookOpen className="w-4 h-4 text-pink-500" />
                <span>Read Community Rules</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
