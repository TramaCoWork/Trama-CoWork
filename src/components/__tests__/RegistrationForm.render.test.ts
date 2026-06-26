import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * RegistrationForm.render.test.ts
 *
 * Verifies that the RegistrationForm.astro template contains the expected
 * optional referral-code field markup: label, icon, position, and absence
 * of validation constraints on the <input>.
 *
 * Because the test suite runs in Vitest's `node` environment (no jsdom),
 * this test reads the rendered `.astro` source and checks the template section
 * (the HTML between the frontmatter and the <script> block) for the expected
 * patterns.
 */

// Read the .astro file once per suite
const astroFilePath = resolve(__dirname, '../RegistrationForm.astro');
const astroContent = readFileSync(astroFilePath, 'utf-8');

/**
 * Extract the template (HTML) section: everything between the closing `---`
 * of the frontmatter and the first `<script>` tag.
 */
function extractTemplate(source: string): string {
  const fmEnd = source.indexOf('\n---\n', 3); // skip leading `---`
  if (fmEnd === -1) return source;
  const scriptStart = source.indexOf('\n<script', fmEnd + 5);
  if (scriptStart === -1) return source.slice(fmEnd + 5);
  return source.slice(fmEnd + 5, scriptStart);
}

const template = extractTemplate(astroContent);

describe('RegistrationForm — Scenario: Referral code field is rendered as an optional registration input', () => {
  // ── Field presence & position ─────────────────────────────────
  it('contiene el label "Código de referido (opcional)" dentro del formulario', () => {
    expect(template).toContain('Código de referido (opcional)');
  });

  it('tiene el input con id="referral-code"', () => {
    expect(template).toContain('id="referral-code"');
  });

  it('tiene name="referralCode" en el input', () => {
    expect(template).toContain('name="referralCode"');
  });

  it('el campo de referido aparece después del checkbox de términos', () => {
    const termsIndex = template.indexOf('id="terms"');
    const referralIndex = template.indexOf('id="referral-code"');
    expect(termsIndex).toBeGreaterThan(0);
    expect(referralIndex).toBeGreaterThan(termsIndex);
  });

  it('el campo de referido aparece antes del botón de submit', () => {
    const referralIndex = template.indexOf('id="referral-code"');
    const submitIndex = template.indexOf('type="submit"');
    expect(referralIndex).toBeGreaterThan(0);
    expect(submitIndex).toBeGreaterThan(referralIndex);
  });

  // ── Icon structure ────────────────────────────────────────────
  it('usa la clase input-icon-wrapper en el contenedor del campo', () => {
    // input-icon-wrapper appears on a <div> before id="referral-code"
    const referralIdx = template.indexOf('id="referral-code"');
    expect(referralIdx).toBeGreaterThan(0);
    const wrapperIdx = template.lastIndexOf('input-icon-wrapper', referralIdx);
    expect(wrapperIdx).toBeGreaterThan(0);
    // Confirm there is a closing </div> block after the input
    const afterInput = template.slice(referralIdx);
    expect(afterInput).toMatch(/<\/div>\s*<\/div>/);
  });

  it('usa el icono Material Symbols "share" en el campo de referido', () => {
    // The share icon <span> appears before the id="referral-code" input
    const referralIdx = template.indexOf('id="referral-code"');
    expect(referralIdx).toBeGreaterThan(0);
    const shareIdx = template.lastIndexOf('>share</span>', referralIdx);
    expect(shareIdx).toBeGreaterThan(0);
    // Confirm there is a material-symbols-outlined class near the share icon
    const beforeShare = template.slice(shareIdx - 80, shareIdx);
    expect(beforeShare).toContain('material-symbols-outlined');
  });

  // ── Absent validation attributes ──────────────────────────────
  it('el input de referido NO tiene atributo required', () => {
    const inputMatch = template.match(
      /<input[^>]*id="referral-code"[^>]*>/,
    );
    expect(inputMatch).not.toBeNull();
    expect(inputMatch![0]).not.toContain('required');
  });

  it('el input de referido NO tiene atributo placeholder', () => {
    const inputMatch = template.match(
      /<input[^>]*id="referral-code"[^>]*>/,
    );
    expect(inputMatch).not.toBeNull();
    expect(inputMatch![0]).not.toContain('placeholder');
  });

  it('el input de referido NO tiene minlength ni pattern', () => {
    const inputMatch = template.match(
      /<input[^>]*id="referral-code"[^>]*>/,
    );
    expect(inputMatch).not.toBeNull();
    expect(inputMatch![0]).not.toContain('minlength');
    expect(inputMatch![0]).not.toContain('pattern');
  });
});
