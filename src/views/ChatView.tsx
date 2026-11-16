import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Hash,
  Mail,
  Send,
  Trash2,
  Reply,
  X,
  Plus,
  Search,
  Lock,
  ShieldAlert,
  Flag,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  ChatChannelId,
  ChatMessage,
  DMMessage,
  PublicProfile,
} from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface ChatViewProps {
  initialMode?: 'chat' | 'dms';
  initialDmThreadId?: string | null;
  openAuth: () => void;
  onOpenReport?: (
    targetId: string,
    targetTitle: string,
    targetType?: 'resource' | 'discussion' | 'comment' | 'review' | 'reel' | 'chat'
  ) => void;
  onModeChange?: (mode: 'chat' | 'dms') => void;
}

const CHANNELS: { id: ChatChannelId; label: string; topic: string }[] = [
  { id: 'general', label: 'general-lounge', topic: 'Live community hangouts, introductions, and updates' },
  { id: 'minecraft-dev', label: 'minecraft-dev', topic: 'Fabric, Mixins, JVM tuning, and client engineering' },
  { id: 'android-hub', label: 'android-hub', topic: 'Kotlin, Jetpack Compose, NDK, and mobile tools' },
  { id: 'help-desk', label: 'help-desk', topic: 'Quick installation troubleshooting and build support' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  initialMode = 'chat',
  initialDmThreadId = null,
  openAuth,
  onOpenReport,
  onModeChange,
}) => {
  const { user, profile, isAdmin, isVerifiedUser } = useAuth();
  const {
    publicProfiles,
    dmThreads,
    subscribeChannelMessages,
    sendChannelMessage,
    deleteChannelMessage,
    startOrGetDMThread,
    subscribeDMMessages,
    sendDMMessage,
    deleteDMMessage,
  } = useData();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'chat' | 'dms'>(initialMode);
  const [activeChannel, setActiveChannel] = useState<ChatChannelId>('general');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialDmThreadId);

  const [channelMessages, setChannelMessages] = useState<ChatMessage[]>([]);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);
  const [composerText, setComposerText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTarget, setReplyTarget] = useState<{ id: string; preview: string } | null>(null);

  // Member directory picker modal for starting a new DM
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialDmThreadId) {
      setMode('dms');
      setActiveThreadId(initialDmThreadId);
    }
  }, [initialDmThreadId]);

  useEffect(() => {
    if (mode === 'dms' && !activeThreadId && dmThreads.length > 0) {
      setActiveThreadId(dmThreads[0].id);
    }
  }, [mode, activeThreadId, dmThreads]);

  // Subscribe to active Live Chat channel
  useEffect(() => {
    if (mode !== 'chat') return;
    const unsub = subscribeChannelMessages(activeChannel, setChannelMessages);
    return () => unsub();
  }, [mode, activeChannel, subscribeChannelMessages]);

  // Subscribe to active Direct Message thread
  useEffect(() => {
    if (mode !== 'dms' || !activeThreadId || !user) {
      setDmMessages([]);
      return;
    }
    const unsub = subscribeDMMessages(activeThreadId, setDmMessages);
    return () => unsub();
  }, [mode, activeThreadId, user, subscribeDMMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, dmMessages.length, mode, activeChannel, activeThreadId]);

  const switchMode = (nextMode: 'chat' | 'dms') => {
    setMode(nextMode);
    setReplyTarget(null);
    onModeChange?.(nextMode);
  };

  const activeThread = useMemo(
    () => dmThreads.find((t) => t.id === activeThreadId) || null,
    [dmThreads, activeThreadId]
  );

  const getThreadPartner = (thread: typeof dmThreads[number]) => {
    const partnerUid = thread.participantIds.find((id) => id !== user?.uid) || '';
    const directoryMatch = publicProfiles.find((p) => p.uid === partnerUid);
    return {
      uid: partnerUid,
      name: directoryMatch?.displayName || thread.participantNames?.[partnerUid] || 'Member',
      avatar: directoryMatch?.photoURL || thread.participantAvatars?.[partnerUid] || '',
      role: directoryMatch?.role || 'Member',
    };
  };

  const handleStartDM = async (target: PublicProfile) => {
    if (!user) {
      openAuth();
      return;
    }
    if (!isVerifiedUser) {
      showToast('Please verify your email address to start direct messages.', 'info');
      openAuth();
      return;
    }
    try {
      const threadId = await startOrGetDMThread({
        uid: target.uid,
        displayName: target.displayName,
        photoURL: target.photoURL,
      });
      setIsNewDMOpen(false);
      setMemberSearch('');
      setActiveThreadId(threadId);
      switchMode('dms');
    } catch {
      showToast('Could not open direct message thread.', 'error');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    if (!isVerifiedUser) {
      showToast('Verify your email address before sending messages.', 'info');
      openAuth();
      return;
    }
    const text = composerText.trim();
    if (!text) return;

    setSending(true);
    try {
      if (mode === 'chat') {
        await sendChannelMessage(activeChannel, text, replyTarget || undefined);
        setReplyTarget(null);
      } else if (activeThreadId) {
        await sendDMMessage(activeThreadId, text);
      }
      setComposerText('');
    } catch {
      showToast('Failed to send message. Please check your connection.', 'error');
    } finally {
      setSending(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return publicProfiles
      .filter((p) => p.uid !== user?.uid)
      .filter(
        (p) =>
          !q ||
          p.displayName.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          (p.bio || '').toLowerCase().includes(q)
      );
  }, [publicProfiles, user?.uid, memberSearch]);

  const currentChannelInfo = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Real-Time Community Messaging
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {mode === 'chat' ? 'Live Community Lounge' : 'Private Direct Messages'}
          </h1>
          <p className="text-xs text-zinc-400">
            {mode === 'chat'
              ? 'Instant topic channels synced live across all connected members.'
              : 'Private 1-on-1 conversations visible only to you and the recipient.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => switchMode('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              mode === 'chat'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('dms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              mode === 'dms'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Messages</span>
            {dmThreads.length > 0 && (
              <span className="font-mono text-[10px] opacity-75">({dmThreads.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Messaging Container */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0c14] overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[620px]">
        {/* Left Navigation Column */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 p-3 sm:p-4 flex flex-col justify-between gap-3 sm:gap-6 bg-[#08090f]">
          {mode === 'chat' ? (
            <div className="space-y-2.5 sm:space-y-4">
              <div className="hidden lg:flex items-center justify-between px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Channels
                </span>
                <span className="text-[11px] font-mono text-zinc-500">{CHANNELS.length}</span>
              </div>
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {CHANNELS.map((ch) => {
                  const active = activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setActiveChannel(ch.id);
                        setReplyTarget(null);
                      }}
                      className={`lg:w-full min-h-[40px] flex items-center gap-2 px-3 py-2 rounded-xl text-left transition whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Hash className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                      <span className="text-xs truncate">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Conversations
                </span>
                {user && (
                  <button
                    type="button"
                    onClick={() => setIsNewDMOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New DM</span>
                  </button>
                )}
              </div>

              {!user ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                  <Lock className="w-6 h-6 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    Sign in to view or start private direct messages.
                  </p>
                  <button
                    type="button"
                    onClick={openAuth}
                    className="w-full py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition"
                  >
                    Sign In
                  </button>
                </div>
              ) : dmThreads.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                  <MessageSquare className="w-6 h-6 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400">No direct message threads yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsNewDMOpen(true)}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition"
                  >
                    Message a Member
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                  {dmThreads.map((thread) => {
                    const partner = getThreadPartner(thread);
                    const active = activeThreadId === thread.id;
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition ${
                          active
                            ? 'bg-white/10 text-white'
                            : 'text-zinc-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <UserAvatar
                          src={partner.avatar}
                          name={partner.name}
                          sizeClass="w-9 h-9 text-xs"
                          className="rounded-xl shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-white truncate">{partner.name}</p>
                            {thread.lastMessageAt && (
                              <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                                {new Date(thread.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {thread.lastMessage || 'Start the conversation'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Member Directory Quick Access */}
          {user && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{publicProfiles.length} Members</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNewDMOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Directory
              </button>
            </div>
          )}
        </aside>

        {/* Right Conversation Stage */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col h-[calc(100dvh-17rem)] min-h-[420px] lg:h-[620px]">
          {/* Conversation Header */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0b0c14]">
            {mode === 'chat' ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                  <h2 className="text-sm font-extrabold text-white truncate">
                    {currentChannelInfo.label}
                  </h2>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {currentChannelInfo.topic}
                </p>
              </div>
            ) : activeThread ? (
              (() => {
                const partner = getThreadPartner(activeThread);
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      src={partner.avatar}
                      name={partner.name}
                      sizeClass="w-9 h-9 text-xs"
                      className="rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="text-sm font-extrabold text-white truncate">{partner.name}</h2>
                      <p className="text-[11px] text-zinc-400">
                        {partner.role} · Private Direct Message
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>
                <h2 className="text-sm font-extrabold text-white">Direct Messages</h2>
                <p className="text-[11px] text-zinc-400">
                  Select a conversation or start a new message
                </p>
              </div>
            )}

            {mode === 'dms' && user && (
              <button
                type="button"
                onClick={() => setIsNewDMOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 transition shrink-0"
              >
                New Chat
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {mode === 'chat' ? (
              channelMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
                  <Hash className="w-8 h-8 text-zinc-700" />
                  <p className="text-sm font-semibold text-zinc-300">
                    No messages in #{currentChannelInfo.label} yet
                  </p>
                  <p className="text-xs text-zinc-500">
                    Say hello or ask a technical question to kick off the live channel.
                  </p>
                </div>
              ) : (
                channelMessages.map((msg) => {
                  const canDelete = isAdmin || (user && msg.senderId === user.uid);
                  const canDM = user && msg.senderId !== user.uid;
                  return (
                    <div
                      key={msg.id}
                      className="group flex items-start gap-3 p-2.5 -mx-2.5 rounded-2xl hover:bg-white/[0.025] transition"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (canDM) {
                            handleStartDM({
                              uid: msg.senderId,
                              displayName: msg.senderName,
                              photoURL: msg.senderAvatar,
                              role: msg.senderRole,
                            });
                          }
                        }}
                        disabled={!canDM}
                        className="shrink-0 focus:outline-none"
                        title={canDM ? `Message ${msg.senderName}` : msg.senderName}
                      >
                        <UserAvatar
                          src={msg.senderAvatar}
                          name={msg.senderName}
                          sizeClass="w-9 h-9 text-xs"
                          className="rounded-xl"
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-white">{msg.senderName}</span>
                          <span className="text-[11px] font-medium text-cyan-400">
                            {msg.senderRole}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {msg.replyToPreview && (
                          <div className="mt-1 mb-1 pl-2.5 border-l border-cyan-500/40 text-[11px] text-zinc-400 truncate">
                            Replying to: {msg.replyToPreview}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                          {msg.content}
                        </p>
                      </div>

                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1 transition shrink-0">
                        {user && (
                          <button
                            type="button"
                            onClick={() =>
                              setReplyTarget({
                                id: msg.id,
                                preview: `${msg.senderName}: ${msg.content.slice(0, 80)}`,
                              })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-white/5"
                            title="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDM && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStartDM({
                                uid: msg.senderId,
                                displayName: msg.senderName,
                                photoURL: msg.senderAvatar,
                                role: msg.senderRole,
                              })
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
                            title={`Direct message ${msg.senderName}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onOpenReport && user && msg.senderId !== user.uid && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenReport(
                                msg.id,
                                `Chat message by ${msg.senderName}`,
                                'chat'
                              )
                            }
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-white/5"
                            title="Report message"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteChannelMessage(activeChannel, msg.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : !user ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <Lock className="w-8 h-8 text-zinc-600" />
                <p className="text-sm font-bold text-white">Sign in for Private Direct Messages</p>
                <button
                  type="button"
                  onClick={openAuth}
                  className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition"
                >
                  Sign In with Google or Email
                </button>
              </div>
            ) : !activeThread ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-zinc-500">
                <Mail className="w-8 h-8 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-300">
                  Select a member to start messaging
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewDMOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition"
                >
                  Browse Member Directory
                </button>
              </div>
            ) : dmMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
                <Mail className="w-8 h-8 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-300">
                  Private thread started
                </p>
                <p className="text-xs text-zinc-500">
                  Send your first message below. Only you and the recipient can read this thread.
                </p>
              </div>
            ) : (
              dmMessages.map((msg) => {
                const isMine = msg.senderId === user.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`group relative max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                          : 'bg-white/[0.06] border border-white/10 text-zinc-100 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      {(isMine || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => deleteDMMessage(activeThread.id, msg.id)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 absolute -top-2 -right-2 p-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-rose-400 transition"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 px-1">
                      {msg.senderName} ·{' '}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#08090f]">
            {!user ? (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-zinc-400">
                  Sign in to participate in real-time chat and direct messages.
                </span>
                <button
                  type="button"
                  onClick={openAuth}
                  className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition shrink-0"
                >
                  Sign In
                </button>
              </div>
            ) : !isVerifiedUser ? (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className="text-xs text-amber-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Verify your email address to unlock sending messages.
                </span>
                <button
                  type="button"
                  onClick={openAuth}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-zinc-950 text-xs font-bold shrink-0"
                >
                  Verify Email
                </button>
              </div>
            ) : mode === 'dms' && !activeThread ? (
              <div className="text-center text-xs text-zinc-500 py-2">
                Choose or start a conversation from the left panel to send a direct message.
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-2">
                {replyTarget && mode === 'chat' && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] text-zinc-300">
                    <span className="truncate">Replying to: {replyTarget.preview}</span>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="p-0.5 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder={
                      mode === 'chat'
                        ? `Message #${currentChannelInfo.label} as ${profile?.displayName || 'Member'}...`
                        : 'Write a private message...'
                    }
                    maxLength={mode === 'chat' ? 1000 : 2000}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !composerText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold transition disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Member Directory / New DM Modal */}
      {isNewDMOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsNewDMOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0c14] text-zinc-200 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Start Direct Message</h3>
                <p className="text-[11px] text-zinc-400">
                  Select any community member from the public directory
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDMOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name or role..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-1.5">
              {filteredMembers.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">
                  No other members found yet. When members sign in, they appear here.
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => handleStartDM(member)}
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 transition text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={member.photoURL}
                        name={member.displayName}
                        sizeClass="w-9 h-9 text-xs"
                        className="rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {member.displayName}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {member.role}
                          {member.bio ? ` · ${member.bio}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 shrink-0">Message</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
