import { workingGroupContexts } from '@/data/working-group-campaign';

const WORKING_GROUPS = new Set(workingGroupContexts.map(({ value }) => value));

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_MARKUP = /[<>]/u;
const SUBMISSION_TIMEOUT_MS = 15_000;
interface SubscriptionPayload {
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  workingGroups: string[];
  consent: true;
  privacyNoticeVersion: string;
  source: 'dialog' | 'page';
  website: string;
  startedAt: number;
}

function accepted(value: unknown): value is { ok: true; state: 'received' } {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && (value as Record<string, unknown>).ok === true
    && (value as Record<string, unknown>).state === 'received';
}

function initialiseNewsletterForms() {
  document.querySelectorAll<HTMLFormElement>('[data-newsletter-form]').forEach((form) => {
    if (form.dataset.newsletterBound === 'true') return;
    const region = form.closest('[data-newsletter-region]');
    const summary = form.querySelector('[data-newsletter-errors]');
    const summaryList = summary?.querySelector('ul');
    const status = form.querySelector('[data-newsletter-status]');
    const submit = form.querySelector('button[type="submit"]');
    const startedAt = form.querySelector('[data-newsletter-started-at]');
    const success = region?.querySelector('[data-newsletter-success]');
    if (!(region instanceof HTMLElement)
      || !(summary instanceof HTMLElement)
      || !(summaryList instanceof HTMLUListElement)
      || !(status instanceof HTMLElement)
      || !(submit instanceof HTMLButtonElement)
      || !(startedAt instanceof HTMLInputElement)
      || !(success instanceof HTMLElement)) return;

    startedAt.value = String(Date.now());
    form.dataset.newsletterBound = 'true';

    function errorNode(name: string) {
      return form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    }

    function clearErrors() {
      form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((node) => { node.textContent = ''; });
      form.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((node) => node.removeAttribute('aria-invalid'));
      summary.hidden = true;
      summaryList.replaceChildren();
    }

    function addError(control: Element | null, name: string, message: string) {
      const target = errorNode(name);
      if (target) target.textContent = message;
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

    function textValue(name: string, minimum: number, maximum: number, message: string) {
      const control = form.elements.namedItem(name);
      const value = control instanceof HTMLInputElement ? control.value.trim() : '';
      if (value.length < minimum || value.length > maximum || CONTROL_CHARACTERS.test(value) || HTML_MARKUP.test(value)) {
        addError(control instanceof HTMLInputElement ? control : null, name, message);
      }
      return value;
    }

    function validate(): SubscriptionPayload | null {
      clearErrors();
      const fullName = textValue('fullName', 2, 100, 'Enter your full name.');
      const emailControl = form.elements.namedItem('email');
      const email = emailControl instanceof HTMLInputElement ? emailControl.value.trim() : '';
      if (!(emailControl instanceof HTMLInputElement) || !emailControl.checkValidity() || email.length > 254) {
        addError(emailControl instanceof HTMLInputElement ? emailControl : null, 'email', 'Enter a valid email address.');
      }
      const organisation = textValue('organisation', 2, 150, 'Enter your organisation.');
      const role = textValue('role', 2, 120, 'Enter your role or area of expertise.');
      const groupControls = [...form.querySelectorAll<HTMLInputElement>('input[name="workingGroups"]')];
      const workingGroups = groupControls.filter(({ checked }) => checked).map(({ value }) => value);
      if (workingGroups.length === 0 || workingGroups.some((value) => !WORKING_GROUPS.has(value))) {
        groupControls.forEach((control) => control.setAttribute('aria-invalid', 'true'));
        addError(groupControls[0] ?? null, 'workingGroups', 'Select at least one working group.');
      }
      const consent = form.elements.namedItem('consent');
      if (!(consent instanceof HTMLInputElement) || !consent.checked) {
        addError(consent instanceof HTMLInputElement ? consent : null, 'consent', 'Tick the box to agree to receive email updates.');
      }

      if (summaryList.children.length > 0) {
        summary.hidden = false;
        summary.focus();
        return null;
      }

      const sourceControl = form.elements.namedItem('source');
      const source = sourceControl instanceof HTMLInputElement ? sourceControl.value : '';
      const beganAt = Number(startedAt.value);
      const privacyNoticeVersion = form.dataset.privacyNoticeVersion ?? '';
      if ((source !== 'dialog' && source !== 'page')
        || !Number.isSafeInteger(beganAt)
        || !privacyNoticeVersion) return null;
      return {
        fullName,
        email,
        organisation,
        role,
        workingGroups,
        consent: true,
        privacyNoticeVersion,
        source,
        website: (form.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '',
        startedAt: beganAt,
      };
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = validate();
      if (!payload) return;

      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Sending your request…';
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);
      try {
        const response = await fetch('/api/newsletter-subscription', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (response.status !== 201 || !accepted(body)) throw new Error('Unexpected subscription response');
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (error) {
        status.textContent = error instanceof DOMException && error.name === 'AbortError'
          ? 'The request timed out. Please try again.'
          : 'We could not save your subscription. Try again in a moment, or email smartdata@openpropdata.org.uk.';
        submit.disabled = false;
      } finally {
        window.clearTimeout(timeout);
        form.removeAttribute('aria-busy');
      }
    });
  });
}

document.addEventListener('astro:page-load', initialiseNewsletterForms);
initialiseNewsletterForms();
