import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../markdown';

describe('renderMarkdown', () => {
  it('renderiza bold e italic', () => {
    const html = renderMarkdown('**bold** _italic_');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('permite links http/https y bloquea javascript', () => {
    const safe = renderMarkdown('[safe](https://example.com) [http](http://example.com)');
    expect(safe).toContain('href="https://example.com"');
    expect(safe).toContain('href="http://example.com"');

    const unsafe = renderMarkdown('[bad](javascript:alert(1))');
    expect(unsafe).not.toContain('javascript:');
    expect(unsafe).not.toContain('href=');
  });

  it('permite imagenes con URL y bloquea protocolos inseguros', () => {
    const safe = renderMarkdown('![ok](https://picsum.photos/200)');
    expect(safe).toContain('<img');
    expect(safe).toContain('src="https://picsum.photos/200"');

    const unsafe = renderMarkdown('![x](data:text/html;base64,abc)');
    expect(unsafe).not.toContain('src=');
  });

  it('elimina script tags', () => {
    const html = renderMarkdown('hola <script>alert(1)</script> mundo');
    expect(html).not.toContain('<script');
    expect(html).toContain('hola');
    expect(html).toContain('mundo');
  });

  it('elimina tags no permitidos', () => {
    const html = renderMarkdown('<iframe src="https://evil.com"></iframe><p>ok</p>');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('<p>ok</p>');
  });
});

/* Trazabilidad: creado por Programmer en 2026-05-15 15:15:00 */
