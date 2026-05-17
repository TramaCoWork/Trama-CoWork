import { marked } from 'marked';

const ALLOWED_TAGS = [
  'p',
  'a',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'blockquote',
  'img',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class'];

marked.setOptions({
  breaks: true,
  gfm: true,
});

function sanitizeHtml(html: string): string {
  // DOMParser solo existe en browser; en tests Node usamos fallback regex simple.
  if (typeof DOMParser === 'undefined') {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?([a-z0-9-]+)(?:\s[^>]*)?>/gi, (tag, tagName: string) => {
        return ALLOWED_TAGS.includes(tagName.toLowerCase()) ? tag : '';
      })
      .replace(/\shref=(['"])\s*(?!https?:)[^'"]*\1/gi, '')
      .replace(/\ssrc=(['"])\s*(?!https?:)[^'"]*\1/gi, '');
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const elements = Array.from(parsed.body.querySelectorAll('*'));

  elements.forEach(element => {
    const tagName = element.tagName.toLowerCase();
    if (!ALLOWED_TAGS.includes(tagName)) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach(attribute => {
      const attrName = attribute.name.toLowerCase();
      if (!ALLOWED_ATTR.includes(attrName)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (attrName !== 'href' && attrName !== 'src') {
        return;
      }

      try {
        const protocol = new URL(attribute.value).protocol;
        if (protocol !== 'http:' && protocol !== 'https:') {
          element.removeAttribute(attribute.name);
        }
      } catch {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return parsed.body.innerHTML;
}

export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(html);
}

/* Trazabilidad: editado por Programmer en 2026-05-15 14:00:00 */
