'use client';

import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';

type FolderKey = 'inbox' | 'drafts' | 'sent' | 'archive' | 'trash' | 'starred';
export default function Sidebar({ active = 'inbox', onSelect, onCompose }: { active?: FolderKey; onSelect?: (key: FolderKey) => void; onCompose?: () => void }) {
  const itemClass = (key: FolderKey) => (
    `flex items-center justify-between px-4 py-2 text-sm border-l-2 transition-colors ` +
    (active === key
      ? 'bg-muted text-foreground border-l-primary font-medium'
      : 'hover:bg-muted text-muted-foreground hover:text-foreground border-l-transparent')
  );

  const click = (key: FolderKey) => (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect?.(key);
  };

  return (
    <div className="w-56 border-r border-border flex-shrink-0 bg-white overflow-y-auto">
      {/* New Message Button */}
      <div className="p-3">
        <button onClick={onCompose} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all font-medium text-sm shadow-sm">
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>New message</span>
        </button>
      </div>

      {/* Folders Section */}
      <nav className="py-1" style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <button
          className={itemClass('inbox')}
          onClick={click('inbox')}
        >
          <div className="flex items-center gap-2">
            <InboxIcon className="h-4 w-4 text-primary" />
            <span>Inbox</span>
          </div>
          <span className="text-xs font-semibold text-primary">25</span>
        </button>

        <button
          className={itemClass('drafts')}
          onClick={click('drafts')}
        >
          <DocumentTextIcon className="h-4 w-4" />
          <span>Drafts</span>
        </button>

        <button
          className={itemClass('sent')}
          onClick={click('sent')}
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          <span>Sent</span>
        </button>

        <button
          className={itemClass('archive')}
          onClick={click('archive')}
        >
          <ArchiveBoxIcon className="h-4 w-4" />
          <span>Archive</span>
        </button>

        <button
          className={itemClass('trash')}
          onClick={click('trash')}
        >
          <TrashIcon className="h-4 w-4" />
          <span>Trash</span>
        </button>

        <button
          className={itemClass('starred')}
          onClick={click('starred')}
        >
          <StarIcon className="h-4 w-4" />
          <span>Starred</span>
        </button>
      </nav>
    </div>
  );
}
