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
import { RoleBadge } from '../components/RoleBadge';

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
  { id: 'general', label: 'general-lounge', topic: 'Live community hangouts, introductions, and platform updates' },
  { id: 'minecraft-dev', label: 'minecraft-dev', topic: 'Fabric, Mixins, JVM tuning, and high-FPS client engineering' },
  { id: 'android-hub', label: 'android-hub', topic: 'Kotlin, Jetpack Compose, NDK, and mobile game launchers' },
  { id: 'help-desk', label: 'help-desk', topic: 'Quick installation troubleshooting and setup support' },
];

const QUICK_EMOJIS = ['🔥', '🚀', '⚡', '💎', '❤️', '👏', '🎮', '💯'];

export const ChatView: React.FC<ChatViewProps> = ({
  initialMode = 'chat',
  initialDmThreadId = null,
  openAuth,
  onOpenReport,
  onModeChange,
}) => {
  const { user, profile, isAdmin } = useAuth();
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

  useEffect(() => {
    if (mode !== 'chat') return;
    const unsub = subscribeChannelMessages(activeChannel, setChannelMessages);
    return () => unsub();
  }, [mode, activeChannel, subscribeChannelMessages]);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;
    if (!user) {
      openAuth();
      return;
    }

    setSending(true);
    try {
      if (mode === 'chat') {
        await sendChannelMessage(
          activeChannel,
          composerText.trim(),
          replyTarget ? { id: replyTarget.id, preview: replyTarget.preview } : undefined
        );
        setComposerText('');
        setReplyTarget(null);
      } else if (mode === 'dms' && activeThreadId) {
        await sendDMMessage(activeThreadId, composerText.trim());
        setComposerText('');
      }
    } catch {
      showToast('Failed to send message. Please check connection.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleStartDM = async (target: {
    uid: string;
    displayName: string;
    photoURL?: string;
    role?: string;
  }) => {
    if (!user) {
      openAuth();
      return;
    }
    if (target.uid === user.uid) {
      showToast("You can't start a direct message with yourself.", 'info');
      return;
    }
    try {
      const threadId = await startOrGetDMThread(target);
      setActiveThreadId(threadId);
      switchMode('dms');
      setIsNewDMOpen(false);
      showToast(`Conversation with ${target.displayName} opened.`, 'success');
    } catch {
      showToast('Could not start direct message.', 'error');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-up">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Real-Time Community Messaging
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {mode === 'chat' ? 'Live Community Lounge' : 'Private Direct Messages'}
          </h1>
          <p className="text-xs text-slate-600">
            {mode === 'chat'
              ? 'Instant topic channels synced live across all connected members.'
              : 'Private 1-on-1 conversations visible only to you and the recipient.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => switchMode('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              mode === 'chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Live Channels</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('dms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              mode === 'dms'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Messages</span>
            {dmThreads.length > 0 && (
              <span className="font-mono text-[10px] opacity-85">({dmThreads.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Messaging Container */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[640px]">
        {/* Left Navigation Column */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 p-3 sm:p-4 flex flex-col justify-between gap-3 sm:gap-6 bg-slate-50/70">
          {mode === 'chat' ? (
            <div className="space-y-2.5 sm:space-y-4">
              <div className="hidden lg:flex items-center justify-between px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Channels
                </span>
                <span className="text-[11px] font-mono text-slate-400">{CHANNELS.length}</span>
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
                      className={`lg:w-full min-h-[42px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/20'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white border border-transparent'
                      }`}
                    >
                      <Hash className={`w-4 h-4 shrink-0 ${active ? 'text-sky-200' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <span className="text-xs truncate block">{ch.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Direct Messages
                </span>
                {user && (
                  <button
                    type="button"
                    onClick={() => setIsNewDMOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-[11px] font-bold transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New DM</span>
                  </button>
                )}
              </div>

              {!user ? (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">
                    Sign in to view or start private direct messages.
                  </p>
                  <button
                    type="button"
                    onClick={openAuth}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Sign In
                  </button>
                </div>
              ) : dmThreads.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                  <MessageSquare className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">No direct message threads yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsNewDMOpen(true)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
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
                            ? 'bg-blue-50 border border-blue-200 text-slate-950'
                            : 'text-slate-700 hover:bg-white border border-transparent'
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
                            <p className="text-xs font-bold text-slate-950 truncate">{partner.name}</p>
                            {thread.lastMessageAt && (
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {new Date(thread.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <RoleBadge role={partner.role} size="xs" />
                            <p className="text-[11px] text-slate-500 truncate">
                              {thread.lastMessage || 'Open conversation'}
                            </p>
                          </div>
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
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>{publicProfiles.length} Members Online</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNewDMOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                Directory
              </button>
            </div>
          )}
        </aside>

        {/* Right Conversation Stage */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col h-[calc(100dvh-17rem)] min-h-[440px] lg:h-[640px] bg-white">
          {/* Conversation Header */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
            {mode === 'chat' ? (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600 shrink-0" />
                  <h2 className="font-display text-sm font-extrabold text-slate-950 truncate">
                    #{currentChannelInfo.label}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
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
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-sm font-extrabold text-slate-950 truncate">
                          {partner.name}
                        </h2>
                        <RoleBadge role={partner.role} size="xs" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Private End-to-End Direct Message
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>
                <h2 className="font-display text-sm font-extrabold text-slate-950">Direct Messages</h2>
                <p className="text-[11px] text-slate-500">
                  Select a member to start a private conversation
                </p>
              </div>
            )}

            {mode === 'dms' && user && (
              <button
                type="button"
                onClick={() => setIsNewDMOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition shrink-0"
              >
                + New Chat
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#fbfdff] to-white">
            {mode === 'chat' ? (
              channelMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                  <Hash className="w-8 h-8 text-blue-300" />
                  <p className="text-sm font-bold text-slate-900">
                    No messages in #{currentChannelInfo.label} yet
                  </p>
                  <p className="text-xs text-slate-500">
                    Be the first to say hello or ask a question in this channel!
                  </p>
                </div>
              ) : (
                channelMessages.map((msg) => {
                  const isMine = user && msg.senderId === user.uid;
                  const canDelete = isAdmin || isMine;
                  const canDM = user && !isMine;
                  return (
                    <div
                      key={msg.id}
                      className={`group flex items-start gap-3 p-3 rounded-2xl transition border ${
                        isMine
                          ? 'bg-blue-50/40 border-blue-100/80 hover:bg-blue-50/70'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
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
                          className="rounded-xl shadow-2xs"
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-slate-950">{msg.senderName}</span>
                          <RoleBadge role={msg.senderRole} size="xs" />
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {msg.replyToPreview && (
                          <div className="mt-1 mb-1.5 pl-2.5 border-l-2 border-blue-400 text-[11px] text-slate-500 truncate bg-slate-50/60 py-0.5 rounded-r">
                            Replying to: {msg.replyToPreview}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words mt-1">
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
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
                              });
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition"
                            title="Report message"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteChannelMessage(activeChannel, msg.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
                <Lock className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-950">Sign in for Private Direct Messages</p>
                <button
                  type="button"
                  onClick={openAuth}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Sign In to Obsidiuss Hub
                </button>
              </div>
            ) : !activeThread ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
                <Mail className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-800">
                  Select a member to start messaging
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewDMOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                >
                  Browse Member Directory
                </button>
              </div>
            ) : dmMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
                <Mail className="w-8 h-8 text-blue-300" />
                <p className="text-sm font-bold text-slate-900">Private Thread Started</p>
                <p className="text-xs text-slate-500">
                  Send your first message below. Only you and the recipient can read this conversation.
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
                      className={`group relative max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMine
                          ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-br-sm'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      {(isMine || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => deleteDMMessage(activeThread.id, msg.id)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-rose-600 transition"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 px-1">
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
          <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white">
            {!user ? (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-600">
                  Sign in to participate in real-time chat and direct messages.
                </span>
                <button
                  type="button"
                  onClick={openAuth}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shrink-0"
                >
                  Sign In
                </button>
              </div>
            ) : mode === 'dms' && !activeThread ? (
              <div className="text-center text-xs text-slate-500 py-2">
                Choose or start a conversation from the left panel to send a direct message.
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-2">
                {/* Reply Indicator */}
                {replyTarget && mode === 'chat' && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 animate-fade-up">
                    <span className="truncate">Replying to: {replyTarget.preview}</span>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="p-0.5 text-blue-600 hover:text-blue-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Emoji Reaction Strip */}
                <div className="flex items-center gap-1.5 pb-1 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 pr-1">Quick:</span>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setComposerText((prev) => prev + emoji)}
                      className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs transition active:scale-95 shadow-2xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

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
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
                  />
                  <button
                    type="submit"
                    disabled={sending || !composerText.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition disabled:opacity-40 shrink-0 active:scale-98"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
          onClick={() => setIsNewDMOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white text-slate-800 overflow-hidden shadow-2xl animate-modal-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-950">Start Direct Message</h3>
                <p className="text-[11px] text-slate-500">
                  Select a verified member to chat privately
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDMOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name or role..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {publicProfiles.length <= 1
                    ? 'No other members have joined yet. Share Obsidiuss Hub with friends!'
                    : 'No members matched your search.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => handleStartDM(member)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 text-left transition"
                  >
                    <UserAvatar
                      src={member.photoURL}
                      name={member.displayName}
                      sizeClass="w-9 h-9 text-xs"
                      className="rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {member.displayName}
                        </p>
                        <RoleBadge role={member.role} size="xs" />
                      </div>
                      {member.bio && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {member.bio}
                        </p>
                      )}
                    </div>
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
