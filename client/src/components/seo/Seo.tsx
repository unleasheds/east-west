import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { renderHeadTags, type PageMeta } from '../../lib/seo';

/**
 * Applies a page's SEO metadata to the live document head.
 *
 * On a first page load the edge server has already stamped these exact tags
 * into the HTML, so this is a no-op re-render. On client-side navigation, where
 * no HTML is fetched, this is the only thing that updates them — which matters
 * for the address-bar title, for shares triggered from inside the app, and for
 * crawlers that navigate the SPA by executing its router.
 *
 * Tags are marked with `data-seo` so a page transition replaces exactly the
 * previous page's tags and leaves the static ones (icons, manifest) untouched.
 */
export default function Seo(meta: PageMeta) {
  const location = useLocation();
  const path = meta.path ?? location.pathname;
  const serialised = JSON.stringify({ ...meta, path });

  useEffect(() => {
    const resolved: PageMeta = JSON.parse(serialised);
    const head = document.head;

    for (const stale of head.querySelectorAll('[data-seo]')) {
      stale.remove();
    }

    // renderHeadTags is the same function the edge server uses, so the markup
    // produced here is byte-for-byte what a crawler saw on the initial load.
    // A <template> is used because it is the only container whose parser
    // accepts head-only elements such as <title> and <meta>.
    const template = document.createElement('template');
    template.innerHTML = renderHeadTags(resolved);

    for (const node of Array.from(template.content.children)) {
      if (node.tagName === 'TITLE') {
        document.title = node.textContent ?? '';
        continue;
      }
      node.setAttribute('data-seo', '');
      head.appendChild(node);
    }
  }, [serialised]);

  return null;
}
