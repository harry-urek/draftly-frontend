'use client';

import { useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import 'quill/dist/quill.snow.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

// Minimal type to avoid any
type QuillType = {
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
  on: (ev: string, cb: () => void) => void;
};
type QuillOptions = { theme?: string; placeholder?: string; modules?: { toolbar?: unknown } };
let QuillCtor: { new (el: Element, opts: QuillOptions): QuillType } | undefined;

const toolbar = [
  [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ header: 1 }, { header: 2 }],
  [{ align: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'src', 'alt'],
  });
}

export default function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);

  const sanitized = useMemo(() => sanitizeHtml(value || ''), [value]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!QuillCtor) {
        const mod = await import('quill');
        QuillCtor = (mod.default || (mod as unknown)) as {
          new (el: Element, opts: unknown): QuillType;
        };
      }
      if (cancelled) return;
      if (!editorRef.current) return;
      if (quillRef.current) return;

      const quill = new QuillCtor(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: { toolbar },
      });
      quillRef.current = quill;

      // Set initial content
      if (sanitized) {
        quill.clipboard.dangerouslyPasteHTML(sanitized);
      }

      quill.on('text-change', () => {
        const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
        onChange(html);
      });
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [placeholder, onChange, sanitized]);

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    const quill = quillRef.current;
    if (quill && typeof sanitized === 'string') {
      const current = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
      if (current !== sanitized) {
        quill.clipboard.dangerouslyPasteHTML(sanitized);
      }
    }
  }, [sanitized]);

  return (
    <div ref={containerRef} className={className}>
      <div ref={editorRef} />
    </div>
  );
}

export function plainTextToHtml(text: string): string {
  // Escape basic entities then convert newlines to <br/>
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return `<p>${escaped.replace(/\n/g, '<br/>')}</p>`;
}

export function isHtmlEmpty(html: string): boolean {
  const stripped = sanitizeHtml(html)
    .replace(/<br\s*\/?>(\s|&nbsp;)*/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return stripped.length === 0;
}
