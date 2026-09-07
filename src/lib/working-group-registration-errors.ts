export interface RegistrationErrorIssue {
  selector: string | null;
  errorId: string | null;
  message: string;
}

const FIELD_ISSUES: Record<string, RegistrationErrorIssue> = {
  fullName: {
    selector: '#full-name',
    errorId: 'full-name-error',
    message: 'Full name must be between 2 and 100 characters.',
  },
  email: {
    selector: '#email',
    errorId: 'email-error',
    message: 'Enter a valid email address.',
  },
  organisation: {
    selector: '#organisation',
    errorId: 'organisation-error',
    message: 'Organisation must be between 2 and 150 characters.',
  },
  role: {
    selector: '#role',
    errorId: 'role-error',
    message: 'Role or area of expertise must be between 2 and 120 characters.',
  },
  workingGroups: {
    selector: 'input[name="workingGroups"]',
    errorId: 'working-groups-error',
    message: 'Select one or more working groups.',
  },
  contributions: {
    selector: 'input[name="contributions"]',
    errorId: 'contributions-error',
    message: 'Select at least one way you might contribute.',
  },
  relevantPerspective: {
    selector: '#relevant-perspective',
    errorId: 'relevant-perspective-error',
    message: 'The optional note must use 600 characters or fewer and cannot include HTML.',
  },
  acknowledgement: {
    selector: '#acknowledgement',
    errorId: 'acknowledgement-error',
    message: 'Confirm that you understand how this expression of interest will be used.',
  },
  privacyNoticeVersion: {
    selector: null,
    errorId: null,
    message: 'This page is out of date. Reload it, review the current privacy notice, then register again.',
  },
};

export const STALE_PRIVACY_NOTICE_ISSUE = FIELD_ISSUES.privacyNoticeVersion;

export function registrationErrorIssues(value: unknown): RegistrationErrorIssue[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const errors = (value as { errors?: unknown }).errors;
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return [];
  if (Object.hasOwn(errors, 'form')) return [];

  return Object.keys(errors)
    .map((key) => Object.hasOwn(FIELD_ISSUES, key) ? FIELD_ISSUES[key] : undefined)
    .filter((issue): issue is RegistrationErrorIssue => Boolean(issue));
}
