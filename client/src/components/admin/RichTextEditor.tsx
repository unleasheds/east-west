import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading2, Heading3, Link2, Quote, Eraser,
} from 'lucide-react';
import { sanitizeHtml, toRenderableHtml } from '../../lib/richText';

/**
 * Word-style rich text editor for package copy.
 *
 * Built on `contentEditable` plus `document.execCommand`. That API is formally
 * deprecated but is still implemented by every current browser, and it keeps
 * this dependency-free — a ProseMirror/TipTap stack would add well over 100 kB
 * to a bundle that only the admin panel needs.
 *
 * Output is sanitised on every change, so what reaches the API is already
 * limited to the allowlisted tags.
 */

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  rows?: number;
}

type Command = {
  label: string;
  Icon: React.ElementType;
  run: () => void;
  /** `queryCommandState` name, when the button reflects an on/off state. */
  state?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the description…',
  dir = 'ltr',
  rows = 8,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Only write into the DOM when the incoming value genuinely differs from what
  // is on screen. Assigning innerHTML on every keystroke would collapse the
  // caret to the start of the field after each character.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = toRenderableHtml(value);
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    onChange(sanitizeHtml(el.innerHTML));
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
    refreshState();
  }

  function refreshState() {
    const names = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
    const next: Record<string, boolean> = {};
    for (const name of names) {
      try {
        next[name] = document.queryCommandState(name);
      } catch {
        next[name] = false;
      }
    }
    setActive(next);
  }

  function addLink() {
    const url = window.prompt('Link URL');
    if (!url) return;
    exec('createLink', url);
  }

  const commands: Command[] = [
    { label: 'Bold',           Icon: Bold,        run: () => exec('bold'),                         state: 'bold' },
    { label: 'Italic',         Icon: Italic,      run: () => exec('italic'),                       state: 'italic' },
    { label: 'Underline',      Icon: Underline,   run: () => exec('underline'),                    state: 'underline' },
    { label: 'Heading',        Icon: Heading2,    run: () => exec('formatBlock', 'H2')             },
    { label: 'Subheading',     Icon: Heading3,    run: () => exec('formatBlock', 'H3')             },
    { label: 'Bulleted list',  Icon: List,        run: () => exec('insertUnorderedList'),          state: 'insertUnorderedList' },
    { label: 'Numbered list',  Icon: ListOrdered, run: () => exec('insertOrderedList'),            state: 'insertOrderedList' },
    { label: 'Quote',          Icon: Quote,       run: () => exec('formatBlock', 'BLOCKQUOTE')     },
    { label: 'Link',           Icon: Link2,       run: addLink                                     },
    { label: 'Clear formatting', Icon: Eraser,    run: () => exec('removeFormat')                  },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border focus-within:border-brand">
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-soft/50 p-1.5">
        {commands.map(({ label, Icon, run, state }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={state ? !!active[state] : undefined}
            // `onMouseDown` rather than `onClick`: the default mousedown would
            // blur the editor and destroy the selection before the command runs.
            onMouseDown={(e) => {
              e.preventDefault();
              run();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              state && active[state]
                ? 'bg-brand text-white'
                : 'text-muted hover:bg-white hover:text-ink'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div
        ref={ref}
        dir={dir}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Description"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onKeyUp={refreshState}
        onMouseUp={refreshState}
        // Paste as plain text so copy from Word or a web page cannot smuggle in
        // font tags, colours or scripts.
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          emit();
        }}
        style={{ minHeight: `${rows * 1.6}rem` }}
        className="rich-text-editor max-h-[28rem] overflow-y-auto bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none"
      />
    </div>
  );
}
