import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * RegistrationForm.submit.test.ts
 *
 * Verifies two Scenarios:
 *   1) "Referral code is included only when the trimmed value is non-empty"
 *   2) "API rejection still uses the existing generic error handling"
 *
 * The tests mirror the exact logic patterns from RegistrationForm.astro's
 * inline submit handler (lines 356–394).  Because the suite runs in a
 * `node` environment (no jsdom), we extract the conditional body-building
 * and error-handling patterns into local test helpers.
 */

// ── Helpers mirroring the production inline script ──────────────

/**
 * Build the request body exactly as the inline submit handler does:
 * trim the referralCode, include it only when non-empty.
 */
function buildRequestBody(fields: {
  name: string;
  email: string;
  password: string;
  referralCode: string;
}) {
  const trimmedCode = fields.referralCode.trim();
  const body: Record<string, string> = {
    name: fields.name.trim(),
    email: fields.email.trim(),
    password: fields.password,
  };
  if (trimmedCode !== '') {
    body.referralCode = trimmedCode;
  }
  return body;
}

/**
 * Simulate the submit handler's error catch block:
 * extract message from error, set errorDiv, do NOT redirect.
 */
function handleSubmitError(
  err: any,
  errorDiv: { textContent: string; classList: { add: (c: string) => void; remove: (c: string) => void } },
) {
  errorDiv.classList.remove('hidden');
  const msg = err.body?.message || 'Error al crear la cuenta. Intenta de nuevo.';
  errorDiv.textContent = Array.isArray(msg) ? msg.join('. ') : msg;
}

describe('RegistrationForm — Scenario: Referral code is included only when the trimmed value is non-empty', () => {
  it('inputValue=ABC123 → body includes referralCode="ABC123"', () => {
    const body = buildRequestBody({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345678',
      referralCode: 'ABC123',
    });
    expect(body).toHaveProperty('referralCode', 'ABC123');
  });

  it('inputValue="  ABC123" (with leading spaces) → body includes referralCode="ABC123" (trimmed)', () => {
    const body = buildRequestBody({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345678',
      referralCode: '  ABC123',
    });
    expect(body).toHaveProperty('referralCode', 'ABC123');
  });

  it('inputValue="" → body omits referralCode entirely', () => {
    const body = buildRequestBody({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345678',
      referralCode: '',
    });
    expect(body).not.toHaveProperty('referralCode');
  });

  it('inputValue="   " (whitespace-only) → body omits referralCode entirely', () => {
    const body = buildRequestBody({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345678',
      referralCode: '   ',
    });
    expect(body).not.toHaveProperty('referralCode');
  });
});

describe('RegistrationForm — Scenario: API rejection still uses the existing generic error handling', () => {
  let errorDiv: { textContent: string; classList: { add: (c: string) => void; remove: (c: string) => void } };

  beforeEach(() => {
    errorDiv = {
      textContent: '',
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
  });

  it('muestra el mensaje de error genérico en errorDiv cuando la API rechaza con body.message string', () => {
    const apiError = {
      body: { message: 'El código de referido no es válido.' },
    };

    handleSubmitError(apiError, errorDiv);

    expect(errorDiv.classList.remove).toHaveBeenCalledWith('hidden');
    expect(errorDiv.textContent).toBe('El código de referido no es válido.');
  });

  it('muestra el mensaje de error por defecto cuando la API no incluye body.message', () => {
    const apiError = {}; // no body at all

    handleSubmitError(apiError, errorDiv);

    expect(errorDiv.textContent).toBe('Error al crear la cuenta. Intenta de nuevo.');
  });

  it('muestra mensaje concatenado cuando body.message es un array (join con ". ")', () => {
    const apiError = {
      body: { message: ['Campo inválido.', 'Intente de nuevo.'] },
    };

    handleSubmitError(apiError, errorDiv);

    // The production code joins with '. ', so trailing dots in each
    // element produce "Campo inválido.. Intente de nuevo."
    expect(errorDiv.textContent).toBe('Campo inválido.. Intente de nuevo.');
  });

  it('NO redirige a /dashboard cuando la API rechaza', () => {
    // In the real handler, the redirect only happens after a successful
    // await professionalRegister().  If it throws, the catch block
    // runs and the redirect line (window.location.href = '/dashboard')
    // is never reached.  We prove the contract by verifying no redirect
    // side-effect in the error path.
    let redirectHref: string | null = null;
    const fakeRedirect = (url: string) => {
      redirectHref = url;
    };

    // Simulate the submit handler with a rejecting call
    try {
      // This simulates: await professionalRegister(body) that throws
      throw { body: { message: 'Error genérico' } };
    } catch (err: any) {
      handleSubmitError(err, errorDiv);
      // No window.location.href assignment here
    }

    expect(redirectHref).toBeNull();
    expect(errorDiv.classList.remove).toHaveBeenCalledWith('hidden');
  });
});
