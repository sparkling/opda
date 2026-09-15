import { DOMAIN_TEMPLATE_CONTRACTS } from '../../approval-onboarding/domain-templates.mjs';
import { withdrawalNoticeContract } from '../../approval-onboarding/withdrawal-notice.mjs';
import { ACKNOWLEDGEMENT_CONTRACT, workingGroupName } from '../../../config/aws/hubspot-participation/acknowledgement.mjs';

const sample = (record) => Object.freeze({
  ...record,
  url: `/marketing/operational-emails/${record.id}`,
  preview: `/marketing/operational-emails/previews/${record.id}.html`,
});
const domains = Object.entries(DOMAIN_TEMPLATE_CONTRACTS);

/** A finite public sample catalogue, never a recipient list or send configuration. */
export const operationalEmails = Object.freeze([
  sample({
    id: 'working-group-application-received', kind: 'application-received', groupId: 'finance-and-banking',
    title: 'Application received',
    subject: ACKNOWLEDGEMENT_CONTRACT.subject.replaceAll('{{group_name}}', workingGroupName('finance-and-banking')),
    description: 'The acknowledgement sent as soon as a working-group application is received, one per requested group. It confirms receipt and review; it promises neither approval nor a timescale.',
  }),
  ...domains.flatMap(([groupId, contract]) => [
    sample({
      id: `${groupId}-invitation-company-folder`, kind: 'invitation', groupId, access: 'company-folder',
      title: `${contract.groupName} invitation · company-folder access`, subject: contract.subject,
      description: 'The invitation after this group is approved and private company-folder access has been granted.',
    }),
    sample({
      id: `${groupId}-invitation-teams-only`, kind: 'invitation', groupId, access: 'teams-only',
      title: `${contract.groupName} invitation · Teams-only access`, subject: contract.subject,
      description: 'The invitation when participation is approved but private company-folder upload access has not been granted.',
    }),
  ]),
  ...domains.map(([groupId, contract]) => sample({
    id: `${groupId}-approval-withdrawn`, kind: 'group-withdrawn', groupId,
    title: `${contract.groupName} approval withdrawn`,
    subject: withdrawalNoticeContract('group-withdrawn', groupId).subject,
    description: 'The notice after access granted through this group approval has been removed. Other approved groups are unaffected.',
  })),
  sample({
    id: 'website-login-disabled', kind: 'website-disabled',
    title: 'Website sign-in disabled', subject: withdrawalNoticeContract('website-disabled').subject,
    description: 'The separate notice when no approved working groups remain and website sign-in has been disabled.',
  }),
]);

export const operationalEmailSections = Object.freeze([
  { id: 'application-received', kind: 'application-received', title: 'Application received', description: 'Every applicant receives one acknowledgement per working group they applied for, whether their details were new to OPDA or matched an existing contact. One template names the group; nothing is promised beyond a review.' },
  { id: 'invitations', kind: 'invitation', title: 'Working-group invitations', description: 'Approval is individual to each domain. A participant receives a separate invitation for each approved group. Choose a sample for the access granted to that participant.' },
  { id: 'group-removal', kind: 'group-withdrawn', title: 'Working-group access removed', description: 'A separate notice identifies each group whose approval was withdrawn. It explains the loss of that group’s Teams and SharePoint access without implying that other approved groups have been removed.' },
  { id: 'website-access', kind: 'website-disabled', title: 'Website sign-in disabled', description: 'When the final working-group approval is withdrawn, a separate notice explains that website sign-in is disabled. This is distinct from an individual group-removal notice.' },
]);
