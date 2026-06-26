import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const modalFilePath = resolve(__dirname, '../ReferralModal.astro');
const modalContent = readFileSync(modalFilePath, 'utf-8');

describe('ReferralModal', () => {
  it('includes modal lifecycle hooks and global open entrypoint', () => {
    expect(modalContent).toContain('id="referral-modal-overlay"');
    expect(modalContent).toContain('document.body.style.overflow = \u0027hidden\u0027;');
    expect(modalContent).toContain('document.body.style.overflow = \u0027\u0027;');
    expect(modalContent).toContain('if (event.key === \u0027Escape\u0027 && !overlay.classList.contains(\u0027hidden\u0027))');
    expect(modalContent).toContain('if (event.target === overlay) {');
    expect(modalContent).toContain('(window as unknown as ReferralModalWindow).openReferralModal = openModal;');
  });

  it('resets unsaved edits on close and restores focus to manage button', () => {
    expect(modalContent).toContain('savedCode = currentCode ?? \u0027\u0027;');
    expect(modalContent).toContain('resetInputToSavedCode();');
    expect(modalContent).toContain('restoreFocusElement = document.getElementById(\u0027referral-manage-button\u0027) as HTMLElement | null;');
    expect(modalContent).toContain('restoreFocusElement?.focus();');
  });

  it('validates min/max/no-whitespace before API call and clears errors on input', () => {
    expect(modalContent).toContain('const MIN_REFERRAL_CODE_LENGTH = 5;');
    expect(modalContent).toContain('const MAX_REFERRAL_CODE_LENGTH = 15;');
    expect(modalContent).toContain('&&!/\\s/.test(value);'.replace('&&!', '&& !'));
    expect(modalContent).toContain('showError(VALIDATION_ERROR_TEXT);');
    expect(modalContent).toContain('input.addEventListener(\u0027input\u0027, () => {');
    expect(modalContent).toContain('clearError();');
  });

  it('keeps 409 message inline and uses generic fallback for other errors', () => {
    expect(modalContent).toContain('const CONFLICT_ERROR_TEXT = \u0027Ese código de referido ya está en uso\u0027;');
    expect(modalContent).toContain('if (error instanceof Error && error.message === CONFLICT_ERROR_TEXT) {');
    expect(modalContent).toContain('showError(error.message);');
    expect(modalContent).toContain('showError(GENERIC_SAVE_ERROR_TEXT);');
  });
});
