'use client';

import {
  StarIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import RichTextEditor, { sanitizeHtml, isHtmlEmpty, plainTextToHtml } from './RichTextEditor';

type Message = { id: string; from: string; subject: string; date?: string; snippet?: string; body?: string; htmlBody?: string; timestamp?: string | Date }
interface EmailDetailProps {
  email: { id: string; from: string; subject: string; date: string; snippet: string };
  thread?: { id: string; subject: string; messages: Message[] };
  onClose: () => void;
}

export default function EmailDetail({ email, thread, onClose }: EmailDetailProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitView, setSplitView] = useState(true);
  const updateThread = useAppStore((state) => state.updateThread);
  const suggested = useAppStore((state) =>
    thread?.id ? state.suggestedReplies[thread.id] : undefined
  );
  const setSuggestedReply = useAppStore((state) => state.setSuggestedReply);

  const extractEmail = (fromString: string) => {
    const match = fromString.match(/<(.+)>/);
    return match ? match[1] : fromString;
  };

  const extractName = (fromString: string) => {
    const match = fromString.match(/^([^<]+)</);
    return match ? match[1].trim().replace(/"/g, '') : extractEmail(fromString);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Normalize and deduplicate messages
  const messages: Message[] = useMemo(() => {
    const base: Message[] = thread
      ? thread.messages
      : [
          {
            id: email.id,
            from: email.from,
            subject: email.subject,
            snippet: email.snippet,
            timestamp: email.date,
          },
        ];
    const seen = new Set<string>();
    const deduped = base.filter((m) => {
      const key = `${m.id}::${m.from}::${m.subject}::${m.timestamp || m.date || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped.sort((a, b) => {
      const aDate = new Date((a.timestamp || a.date || '') as string).getTime();
      const bDate = new Date((b.timestamp || b.date || '') as string).getTime();
      return aDate - bDate;
    });
  }, [thread, email]);

  const handleSendReply = async () => {
    if (!thread?.id) {
      setSendError('Thread data is still loading. Please try again shortly.');
      return;
    }

    if (!replyText || isHtmlEmpty(replyText)) {
      setSendError('Reply body is required.');
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);

      // Ensure HTML is sanitized before sending; backend expects HTML and sends Content-Type: text/html
      const bodyHtml = sanitizeHtml(replyText) || plainTextToHtml(replyText);
      const response = await api.post(api.replyToThread(thread.id), { body: bodyHtml });

      const updatedThread = response?.data;
      if (updatedThread) {
        updateThread(updatedThread);
      }

      setReplyText('');
      setShowReply(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send reply. Please try again.';
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  };

  // Prefetch suggested reply in the background when viewing a thread
  useEffect(() => {
    if (!thread?.id) return;
    if (suggested?.content) return;
    let cancelled = false;
    let tries = 0;

    const prefetch = async () => {
      try {
        const res = await api.get(api.suggested(thread.id));
        if (cancelled) return true;
        if (res?.data?.content) {
          setSuggestedReply(thread.id, res.data);
          return true;
        }
        // Kick off generation if not started
        void api.post(api.suggest(), { threadId: thread.id }).catch(() => {});
      } catch {
        // ignore
      }
      return false;
    };

    const loop = async () => {
      while (!cancelled && tries < 5) {
        const ok = await prefetch();
        if (ok) return;
        tries += 1;
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    void loop();
    return () => {
      cancelled = true;
    };
  }, [thread?.id, suggested?.content, setSuggestedReply]);

  // When opening the reply box, prefill with suggested content if available or fetch it
  useEffect(() => {
    if (!showReply || !thread?.id) return;
    let cancelled = false;
    let attempts = 0;

    const tryFetch = async () => {
      if (!thread?.id) return;
      try {
        const res = await api.get(api.suggested(thread.id));
        if (cancelled) return;
        if (res?.data?.content) {
          setSuggestedReply(thread.id, res.data);
          setReplyText((prev) => (prev ? prev : plainTextToHtml(res.data.content)));
          setIsGenerating(false);
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    const run = async () => {
      // if store already has a suggestion, use it
      if (suggested?.content) {
        setReplyText((prev) => (prev ? prev : plainTextToHtml(suggested.content)));
        setIsGenerating(false);
        return;
      }

      setIsGenerating(true);
      // kick off generation (idempotent server-side)
      void api.post(api.suggest(), { threadId: thread.id }).catch(() => {});

      // short poll for up to ~10 seconds
      while (!cancelled && attempts < 5) {
        const ok = await tryFetch();
        if (ok) return;
        attempts += 1;
        await new Promise((r) => setTimeout(r, 2000));
      }
      setIsGenerating(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [showReply, thread?.id, suggested?.content, setSuggestedReply]);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Minimal Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-white" style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs hover:bg-muted rounded transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          Back
        </button>

        <div className="flex-1"></div>

        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground" title="Archive">
          <ArchiveBoxIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive" title="Delete">
          <TrashIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-orange-500" title="Flag">
          <StarIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground" title="More">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Content area: split view with thread on left and reply composer on right */}
      <div className="flex-1 overflow-hidden bg-background">
        <div className={`h-full ${splitView ? 'grid grid-cols-1 lg:grid-cols-2' : ''}`}>
          {/* Left pane: thread content and previous replies */}
          <div className="overflow-y-auto p-4">
          {/* Subject */}
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-foreground px-3 py-2" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              {thread?.subject || email.subject}
            </h1>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded border border-border shadow-sm mb-4">
              {/* Sender Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {getInitials(extractName(msg.from))}
                  </div>
                  {/* Sender Info */}
                  <div className="flex-1 min-w-0" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-foreground text-sm">{extractName(msg.from)}</div>
                        <div className="text-xs text-muted-foreground">{extractEmail(msg.from)}</div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(((msg.timestamp as string) || (msg.date as string) || '') as string)}
                      </span>
                    </div>
                  </div>
                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary"
                      onClick={() => setShowReply(true)}
                      title="Reply"
                    >
                      <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary" title="Forward">
                      <ArrowUturnRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Email Body */}
              <div className="p-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                <div className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {(() => {
                    const raw = (msg.htmlBody || msg.body || msg.snippet || '') as string;
                    const sanitized = DOMPurify.sanitize(raw, {
                      USE_PROFILES: { html: true },
                      FORBID_TAGS: ['script', 'style'],
                    });
                    return parse(sanitized);
                  })()}
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Right pane: Revamped reply area with rich text editor */}
          <div className="border-l border-border h-full flex flex-col bg-white">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                  Compose reply
                </h3>
                {isGenerating && (
                  <span className="text-xs text-muted-foreground">Generating AI draft…</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSplitView((v) => !v)}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-muted"
                >
                  {splitView ? 'Single pane' : 'Split view'}
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Toolbar actions above editor */}
            <div className="p-2 border-b border-border flex items-center gap-2">
              {suggested?.content ? (
                <button
                  onClick={() => setReplyText((prev) => (prev ? prev : plainTextToHtml(suggested.content)))}
                  className="text-xs px-2 py-1 border border-primary/30 text-primary rounded hover:bg-primary/5"
                  title="Insert AI draft"
                >
                  Use AI draft
                </button>
              ) : null}
              <button className="p-1.5 hover:bg-muted rounded" title="Attach">
                <PaperClipIcon className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded" title="Image">
                <PhotoIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {showReply ? (
                <RichTextEditor
                  value={replyText}
                  onChange={setReplyText}
                  placeholder="Write your reply…"
                  className="min-h-[260px]"
                />
              ) : (
                <div className="flex items-center gap-3 p-2">
                  <button
                    onClick={() => setShowReply(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:shadow-md transition-all font-medium text-sm"
                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4" />
                    Reply
                  </button>
                  {!suggested?.content && (
                    <span className="text-xs text-muted-foreground">Generating AI draft…</span>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all font-medium text-sm shadow-sm"
                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                  onClick={handleSendReply}
                  disabled={isSending || isGenerating || isHtmlEmpty(replyText) || !thread?.id}
                >
                  <PaperAirplaneIcon className={`h-3.5 w-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                  {isSending ? 'Sending…' : isGenerating ? 'Please wait…' : 'Send'}
                </button>
              </div>
              <button
                onClick={() => setShowReply(false)}
                className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                Discard
              </button>
            </div>

            {sendError && (
              <div className="px-4 pb-4 text-xs text-destructive" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                {sendError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
