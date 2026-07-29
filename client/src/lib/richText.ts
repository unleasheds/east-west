/**
 * Rich-text handling for package descriptions.
 *
 * Descriptions are authored in the admin panel as HTML. Older records were
 * written as Markdown-ish plain text (`**bold**`), and were rendered literally
 * — asterisks and all — so both shapes are supported here and normalised to
 * safe HTML at render time. No migration is needed: `toRenderableHtml` detects
 * which shape a record is in.
 */

/** Tags an admin may produce with the editor toolbar. Everything else is dropped. */
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H2', 'H3', 'H4',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'SPAN', 'DIV',
]);

/** Only links carry attributes, and only a vetted href. */
const ALLOWED_ATTRS: Record<string, string[]> = { A: ['href', 'target', 'rel'] };

/** `javascript:` and `data:` URLs are the classic vectors for stored XSS. */
function safeHref(value: string): string | null {
  const url = value.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  return null;
}

/**
 * Strips everything outside the allowlist.
 *
 * Package copy is admin-authored, but it is served to every visitor — a single
 * pasted `<script>` or `onerror` attribute would become site-wide stored XSS,
 * so the content is sanitised on the way in *and* on the way out.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return stripTags(html);

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Keep the text, drop the element — losing a paragraph's words to an
        // unsupported wrapper would silently destroy content.
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }

      const allowed = ALLOWED_ATTRS[child.tagName] ?? [];
      for (const attr of Array.from(child.attributes)) {
        if (!allowed.includes(attr.name.toLowerCase())) {
          child.removeAttribute(attr.name);
        }
      }

      if (child.tagName === 'A') {
        const href = safeHref(child.getAttribute('href') ?? '');
        if (!href) {
          child.replaceWith(...Array.from(child.childNodes));
          continue;
        }
        child.setAttribute('href', href);
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer nofollow');
      }

      walk(child);
    }
  };

  walk(root);
  return root.innerHTML;
}

/** Escapes text so it can be embedded in HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Converts the legacy Markdown-ish format to HTML: `**bold**`, `*italic*`,
 * `- bullets` and blank-line paragraphs.
 */
export function markdownishToHtml(text: string): string {
  const blocks = escapeHtml(text).split(/\n{2,}/);

  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return '';

      const inline = (s: string) =>
        s
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

      if (lines.every((l) => /^[-•]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-•]\s+/, ''))}</li>`).join('')}</ul>`;
      }

      return `<p>${lines.map(inline).join('<br />')}</p>`;
    })
    .filter(Boolean)
    .join('');
}

/** True when a value already looks like editor-produced HTML. */
function looksLikeHtml(value: string): boolean {
  return /<(p|div|ul|ol|li|h[234]|strong|em|u|br|a|blockquote)\b/i.test(value);
}

/** Normalises a stored description into sanitised, renderable HTML. */
export function toRenderableHtml(value?: string): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  return sanitizeHtml(looksLikeHtml(raw) ? raw : markdownishToHtml(raw));
}

/** Removes all markup — used where only plain text is valid. */
export function stripTags(value?: string): string {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
