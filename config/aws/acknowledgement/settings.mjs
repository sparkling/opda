import { acknowledgementPin } from '../hubspot-participation/acknowledgement.mjs';

// Applicant acknowledgement v1, created and byte-verified on Postmark server
// 20188829 on 2026-09-15 without sending mail. The worker refuses to send if the
// live template's numeric ID, alias, subject or content fingerprint drift from this pin.
export const ACKNOWLEDGEMENT_PIN = acknowledgementPin({
  serverId: 20188829,
  templateId: 47773906,
  fingerprint: '1a79a126b5621a16537adfa5685bf56ac9d82ff8e8c4752710b90eee83151544',
});
