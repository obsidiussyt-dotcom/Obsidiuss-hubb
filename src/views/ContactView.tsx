import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Clock,
  Users,
  HelpCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import type { NavigateOptions } from '../App';

interface ContactViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate, onOpenRules }) => {
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
      showToast('Message sent! Obsidiuss will review your feedback soon.', 'success');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-purple-300">
          <Mail className="w-4 h-4 text-purple-400" />
          <span>Inquiries & Direct Collaboration · Obsidiuss</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Get in Touch with Obsidiuss
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Have an engineering inquiry, client integration proposal, bug report, or mod suggestion?
          Send a direct message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3 rounded-3xl glass-panel border border-white/10 p-6 sm:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Dispatched!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Thank you for reaching out. We have logged your submission in our feedback portal and
                will get back to you if a response is needed.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Subject / Category
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bug report, collaboration, or feature request"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us what's on your mind in detail..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Transmission...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Channels Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-[#5865F2]/30 bg-[#5865F2]/10 space-y-3">
            <div className="flex items-center gap-2 text-[#9ba5ff]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-sm font-bold">Fastest Response: Discord</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              For real-time mod setup help, quick bug reports, and community support, joining our
              Discord server is the fastest way to get answers.
            </p>
            <a
              href="https://discord.com/invite/aAgf7bnCNd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition"
            >
              <span>Join Discord Support</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3 text-xs text-zinc-400">
            <h4 className="font-bold text-white text-sm">Direct Channels</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Discord: Live community & support channel</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Contact Form: Saved directly for Obsidiuss to review</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Helpful Links</h4>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="/community"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('community');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white transition"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask in Community Discussions</span>
              </a>
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('about');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Read FAQ & Creator Info</span>
              </a>
              <a
                href="/resources"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('resources');
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Browse All Downloads</span>
              </a>
              {onOpenRules && (
                <button
                  type="button"
                  onClick={onOpenRules}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white transition text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Community & User Rules</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
