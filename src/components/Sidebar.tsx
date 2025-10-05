'use client';

import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  return (
    <div className="w-56 border-r border-border flex-shrink-0 bg-white overflow-y-auto">
      {/* New Message Button */}
      <div className="p-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all font-medium text-sm shadow-sm">
          <span style={{ fontFamily: 'var(--font-geist-sans)' }}>New message</span>
        </button>
      </div>

      {/* Folders Section */}
      <nav className="py-1" style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <a
          href="#"
          className="flex items-center justify-between px-4 py-2 bg-muted text-foreground font-medium text-sm border-l-2 border-l-primary"
        >
          <div className="flex items-center gap-2">
            <InboxIcon className="h-4 w-4 text-primary" />
            <span>Inbox</span>
          </div>
          <span className="text-xs font-semibold text-primary">25</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <DocumentTextIcon className="h-4 w-4" />
          <span>Drafts</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          <span>Sent</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArchiveBoxIcon className="h-4 w-4" />
          <span>Archive</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Trash</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <StarIcon className="h-4 w-4" />
          <span>Starred</span>
        </a>
      </nav>
    </div>
  );
}
