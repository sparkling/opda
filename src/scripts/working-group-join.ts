const WORKING_GROUPS = new Set([
  'finance-and-banking',
  'conveyancing',
  'estate-agency',
  'surveying-and-valuation',
  'property-data-services',
  'property-technology',
]);

const CONTRIBUTIONS = new Set([
  'share-source-material',
  'explain-domain-language-and-rules',
  'review-model-candidates',
  'test-schemas-and-integrations',
  'represent-commercial-interests',
  'represent-public-interests',
]);

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_MARKUP = /[<>]/u;
const SUBMISSION_TIMEOUT_MS = 15_000;

type TextInput = HTMLInputElement | HTMLTextAreaElement;

interface RegistrationPayload {
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  workingGroups: string[];
  contributions: string[];
  relevantPerspective?: string;
  acknowledgement: true;
  privacyNoticeVersion: '2026-08-13';
  website: string;
  startedAt: number;
}

interface AcceptedResponse {
  ok: true;
  state: 'received';
  message: string;
}

function isAcceptedResponse(value: unknown): value is AcceptedResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return body.ok === true && body.state === 'received' && typeof body.message === 'string';
}

function initWorkingGroupForm(): void {
  const form = document.querySelector<HTMLFormElement>('#working-group-interest-form');
  if (!form || form.dataset.initialised === 'true') return;

  const startedAt = form.querySelector<HTMLInputElement>('#started-at');
  const perspective = form.querySelector<HTMLTextAreaElement>('#relevant-perspective');
  const perspectiveCount = form.querySelector<HTMLElement>('#perspective-count');
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('#form-status');
  const summary = form.querySelector<HTMLElement>('#form-errors');
  const summaryList = summary?.querySelector<HTMLUListElement>('ul');
  const success = document.querySelector<HTMLElement>('#registration-success');
  const availability = document.querySelector<HTMLElement>('#form-availability');

  if (!startedAt || !submitButton || !status || !summary || !summaryList || !success) return;
  form.dataset.initialised = 'true';
  startedAt.value = String(Date.now());
  submitButton.disabled = false;
  if (availability) availability.hidden = true;

  function selected(name: 'workingGroups' | 'contributions'): string[] {
    return [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)]
      .map((input) => input.value);
  }

  function updateCharacterCount(): void {
    if (perspective && perspectiveCount) {
      perspectiveCount.textContent = `${perspective.value.length} of 600 characters`;
    }
  }

  function clearErrors(): void {
    form.querySelectorAll<HTMLElement>('.wg-field-error').forEach((node) => {
      node.textContent = '';
    });
    form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((node) => {
      node.removeAttribute('aria-invalid');
    });
    summary.hidden = true;
    summaryList.replaceChildren();
  }

  function addError(control: Element | null, errorId: string, message: string): void {
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    control?.setAttribute('aria-invalid', 'true');

    const item = document.createElement('li');
    if (control instanceof HTMLElement && control.id) {
      const link = document.createElement('a');
      link.href = `#${control.id}`;
      link.textContent = message;
      item.append(link);
    } else {
      item.textContent = message;
    }
    summaryList.append(item);
  }

  function validateText(
    selector: string,
    errorId: string,
    label: string,
    minLength: number,
    maxLength: number,
  ): string {
    const control = form.querySelector<TextInput>(selector);
    const value = control?.value.trim() ?? '';
    if (value.length < minLength || value.length > maxLength) {
      addError(control, errorId, `${label} must be between ${minLength} and ${maxLength} characters.`);
    } else if (CONTROL_CHARACTERS.test(value) || HTML_MARKUP.test(value)) {
      addError(control, errorId, `${label} contains characters that cannot be accepted.`);
    }
    return value;
  }

  function validate(): RegistrationPayload | null {
    clearErrors();

    const fullName = validateText('#full-name', 'full-name-error', 'Full name', 2, 100);
    const emailControl = form.querySelector<HTMLInputElement>('#email');
    const email = emailControl?.value.trim() ?? '';
    if (!email || email.length > 254 || !emailControl?.checkValidity()) {
      addError(emailControl, 'email-error', 'Enter a valid email address.');
    }
    const organisation = validateText('#organisation', 'organisation-error', 'Organisation', 2, 150);
    const role = validateText('#role', 'role-error', 'Role or area of expertise', 2, 120);

    const workingGroups = selected('workingGroups');
    const workingGroupControls = [...form.querySelectorAll<HTMLInputElement>('input[name="workingGroups"]')];
    if (workingGroups.length === 0 || workingGroups.some((value) => !WORKING_GROUPS.has(value))) {
      workingGroupControls.forEach((control) => control.setAttribute('aria-invalid', 'true'));
      addError(workingGroupControls[0] ?? null, 'working-groups-error', 'Select one or more working groups.');
    }

    const contributions = selected('contributions');
    const contributionControls = [...form.querySelectorAll<HTMLInputElement>('input[name="contributions"]')];
    if (contributions.length === 0 || contributions.some((value) => !CONTRIBUTIONS.has(value))) {
      contributionControls.forEach((control) => control.setAttribute('aria-invalid', 'true'));
      addError(contributionControls[0] ?? null, 'contributions-error', 'Select at least one way you might contribute.');
    }

    const relevantPerspective = perspective?.value.trim() ?? '';
    if (
      relevantPerspective.length > 600 ||
      CONTROL_CHARACTERS.test(relevantPerspective) ||
      HTML_MARKUP.test(relevantPerspective)
    ) {
      addError(perspective, 'relevant-perspective-error', 'The optional note contains characters that cannot be accepted.');
    }

    const acknowledgement = form.querySelector<HTMLInputElement>('#acknowledgement');
    if (!acknowledgement?.checked) {
      addError(acknowledgement, 'acknowledgement-error', 'Confirm that you understand how this expression of interest will be used.');
    }

    const beganAt = Number(startedAt?.value);
    const website = form.querySelector<HTMLInputElement>('#website')?.value ?? '';
    const privacyNoticeVersion = form.dataset.privacyNoticeVersion;

    if (summaryList.children.length > 0) {
      summary.hidden = false;
      summary.focus();
      return null;
    }

    if (!Number.isInteger(beganAt) || privacyNoticeVersion !== '2026-08-13') return null;

    const payload: RegistrationPayload = {
      fullName,
      email,
      organisation,
      role,
      workingGroups,
      contributions,
      acknowledgement: true,
      privacyNoticeVersion: '2026-08-13',
      website,
      startedAt: beganAt,
    };
    if (relevantPerspective) payload.relevantPerspective = relevantPerspective;
    return payload;
  }

  perspective?.addEventListener('input', updateCharacterCount);
  updateCharacterCount();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = validate();
    if (!payload) return;

    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your registration…';
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);
    let accepted = false;

    try {
      const response = await fetch('/api/working-group-interest', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const contentType = response.headers.get('content-type') ?? '';
      if (response.status !== 201 || !/^application\/json(?:\s*;|$)/iu.test(contentType)) {
        throw new Error('Unexpected registration response');
      }
      const body: unknown = await response.json();
      if (!isAcceptedResponse(body)) throw new Error('Invalid registration response');

      accepted = true;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      status.textContent = timedOut
        ? 'The registration request timed out. Please try again.'
        : 'We could not submit your registration. Please try again. If the problem continues, email smartdata@openpropdata.org.uk.';
    } finally {
      window.clearTimeout(timeoutId);
      form.removeAttribute('aria-busy');
      if (!accepted) submitButton.disabled = false;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkingGroupForm, { once: true });
} else {
  initWorkingGroupForm();
}
document.addEventListener('astro:page-load', initWorkingGroupForm);
