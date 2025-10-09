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
import { useState } from 'react';

type Message = { id: string; from: string; subject: string; date?: string; snippet?: string; body?: string; htmlBody?: string; timestamp?: string | Date }
interface EmailDetailProps {
  email: { id: string; from: string; subject: string; date: string; snippet: string };
  thread?: { subject: string; messages: Message[] };
  onClose: () => void;
}

export default function EmailDetail({ email, thread, onClose }: EmailDetailProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

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

  // Normalize messages to a single shape
  const messages: Message[] = thread
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

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto p-4">
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
                <div
                  className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none"
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html: String(msg.htmlBody || msg.body || msg.snippet || '')
                      .replace(/<style[^>]*>.*?<\/style>/gi, '')
                      .replace(/<script[^>]*>.*?<\/script>/gi, '')
                  }}
                />
              </div>
            </div>
          ))}

          {/* Reply Section Box */}
          {showReply ? (
            <div className="bg-white rounded border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                    Reply
                  </h3>
                  <button
                    onClick={() => setShowReply(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Reply Text Area */}
              <div className="p-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full min-h-[150px] p-3 bg-background border border-border rounded resize-y text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                />
              </div>

              {/* Reply Actions */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all font-medium text-sm shadow-sm"
                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                  >
                    <PaperAirplaneIcon className="h-3.5 w-3.5" />
                    Send
                  </button>
                  <button className="p-2 hover:bg-muted rounded transition-colors" title="Attach">
                    <PaperClipIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded transition-colors" title="Image">
                    <PhotoIcon className="h-4 w-4 text-muted-foreground" />
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
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReply(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:shadow-md transition-all font-medium text-sm"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
                Reply
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-muted transition-colors font-medium text-sm"
                style={{ fontFamily: 'var(--font-geist-sans)' }}
              >
                <ArrowUturnRightIcon className="h-4 w-4" />
                Forward
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
