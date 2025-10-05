'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getIdToken } from '@/lib/firebase';
import { api } from '@/lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ArrowPathIcon,
  FlagIcon,
  ArchiveBoxIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

export default function InboxMessages() {
  const { user, emails, setEmails, selectedEmail, setSelectedEmail, isLoading, setLoading, error, setError } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(api.emails(), {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      if (response.headers.get('X-Sync-Status') === 'started') {
        setIsSyncing(true);
        setTimeout(fetchMessages, 5000); // Re-fetch after 5 seconds
      }

      const data = await response.json();
      setEmails(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setEmails, setError]);

  const refreshMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(api.refreshEmails(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh messages');
      }

      const data = await response.json();
      setEmails(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setEmails, setError]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // If today, show time only
      if (messageDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }

      // If this year, show "Mon DD"
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }

      // Otherwise show "Mon DD, YYYY"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const extractEmail = (fromString: string) => {
    const match = fromString.match(/<(.+)>/);
    return match ? match[1] : fromString;
  };

  const extractName = (fromString: string) => {
    const match = fromString.match(/^([^<]+)</);
    return match ? match[1].trim().replace(/"/g, '') : extractEmail(fromString);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="nexus-card p-6 border-destructive max-w-md">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button
            onClick={fetchMessages}
            className="btn-nexus w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse-glow">Syncing your inbox for the first time...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Simplified Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white">
        <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
          Inbox
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({emails.length})
          </span>
        </h1>
        <button
          onClick={refreshMessages}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-geist-sans)' }}
        >
          <ArrowPathIcon className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {emails.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            <div className="text-center">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-sm">No messages</div>
            </div>
          </div>
        ) : (
          <div>
            {emails.map((message) => (
              <div
                key={message.id}
                className={`group px-4 py-2.5 border-b border-border cursor-pointer transition-colors ${message.isUnread
                    ? 'bg-white hover:bg-muted border-l-2 border-l-primary'
                    : 'bg-white hover:bg-muted border-l-2 border-l-transparent'
                  } ${selectedEmail?.id === message.id ? 'bg-muted' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox - smaller */}
                  <div className="flex-shrink-0 pt-0.5">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border border-border text-primary focus:ring-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Message content */}
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setSelectedEmail(message)}
                  >
                    {/* Sender and time */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`text-xs ${message.isUnread ? 'font-semibold' : 'font-normal'} text-foreground truncate`}
                        style={{ fontFamily: 'var(--font-geist-sans)' }}
                      >
                        {extractName(message.from)}
                      </span>
                      <span
                        className="text-xs text-muted-foreground flex-shrink-0"
                        style={{ fontFamily: 'var(--font-geist-sans)' }}
                      >
                        {formatDate(message.date)}
                      </span>
                    </div>

                    {/* Subject */}
                    <div
                      className={`text-xs ${message.isUnread ? 'font-medium' : 'font-normal'} text-foreground truncate mb-0.5`}
                      style={{ fontFamily: 'var(--font-geist-sans)' }}
                    >
                      {message.subject}
                    </div>

                    {/* Snippet */}
                    <div
                      className="text-xs text-muted-foreground truncate"
                      style={{ fontFamily: 'var(--font-geist-sans)' }}
                    >
                      {message.snippet}
                    </div>
                  </div>

                  {/* Actions - Headless UI */}
                  <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                    {/* Flag Button */}
                    <button
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-orange-500 transition-all p-1 rounded hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Toggle flag
                      }}
                      title="Flag"
                    >
                      <FlagIcon className="h-3.5 w-3.5" />
                    </button>

                    {/* More Actions Dropdown */}
                    <Menu as="div" className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <Menu.Button
                        className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <EllipsisVerticalIcon className="h-3.5 w-3.5" />
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right bg-white rounded border border-border shadow-lg focus:outline-none z-50">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Archive
                                  }}
                                  className={`${active ? 'bg-muted text-foreground' : 'text-foreground'
                                    } group flex items-center w-full px-3 py-2 text-xs`}
                                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                                >
                                  <ArchiveBoxIcon className="mr-2 h-3.5 w-3.5" />
                                  Archive
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Delete
                                  }}
                                  className={`${active ? 'bg-muted text-foreground' : 'text-foreground'
                                    } group flex items-center w-full px-3 py-2 text-xs`}
                                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                                >
                                  <TrashIcon className="mr-2 h-3.5 w-3.5" />
                                  Delete
                                </button>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Mark as unread
                                  }}
                                  className={`${active ? 'bg-muted text-foreground' : 'text-foreground'
                                    } group flex items-center w-full px-3 py-2 text-xs`}
                                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                                >
                                  <div className="mr-2 h-3.5 w-3.5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  </div>
                                  {message.isUnread ? 'Mark as read' : 'Mark as unread'}
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}