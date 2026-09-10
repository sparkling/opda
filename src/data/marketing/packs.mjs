import { marketingDomains } from './domains.mjs';

export const MARKETING_VERSION = '2026-09-10';
export const MARKETING_OWNER = 'OPDA engagement';
export const MARKETING_SOURCES = Object.freeze(['ADR-0069', 'ADR-0071', 'ADR-0078', 'ADR-0086']);
export const SIGNUP_URL = 'https://opda.org.uk/join';
const framework = 'Smart Property Data Trust Framework';
const reassurance = 'You do not need data-modelling expertise. Your professional experience and judgement can help shape the work.';
const contribution = 'Contributors can explain the language and rules used in their work, bring authorised examples, review draft definitions and challenge assumptions.';
const nextStep = 'Registering is an expression of interest. OPDA reviews each submission and confirms the next steps. It does not automatically give membership or access.';
const reviewNote = 'Registration expresses interest, subject to OPDA review, not automatic membership or access.';

const email = (subject, preheader, headline, paragraphs, ctaLabel = 'Explore the working groups') => ({
  subject, preheader, headline, paragraphs, ctaLabel,
});

function packFor(domain) {
  const signupUrl = domain.id === 'general' ? SIGNUP_URL : `${SIGNUP_URL}?context=${domain.id}`;
  const introduction = `The Open Property Data Association (OPDA) is inviting ${domain.audience} to help develop the ${framework}. The working groups are developing shared definitions for property information so that people can understand and exchange it more clearly.`;
  const partnerCopy = `What would make property information more useful in your work?\n\nWe are sharing an opportunity from the Open Property Data Association (OPDA) for ${domain.audience} to help develop the ${framework}.\n\n${domain.contribution}\n\n${reassurance}\n\n${reviewNote}\n\nExplore the working groups and register your interest: ${signupUrl}`;
  const opdaCopy = `Your experience can help shape better property information.\n\nAt the Open Property Data Association (OPDA), we are inviting ${domain.audience} to contribute to the ${framework}.\n\n${domain.contribution}\n\n${reassurance}\n\n${reviewNote}\n\nExplore the working groups and register your interest: ${signupUrl}`;
  const posts = (voice) => [
    { id: 'invitation', title: 'The invitation', copy: voice === 'opda' ? opdaCopy : partnerCopy },
    { id: 'real-work', title: 'A question from real work', copy: `${domain.problem}\n\n${domain.example}\n\n${voice === 'opda' ? 'At the Open Property Data Association (OPDA), our working groups need' : 'The Open Property Data Association (OPDA) is inviting'} professional experience to help make these distinctions clear. ${domain.contribution}\n\n${reviewNote}\n\nRegister your interest: ${signupUrl}` },
    { id: 'participation', title: 'What you can contribute', copy: `You do not need to be a data modeller to help improve property information.\n\n${contribution}\n\n${voice === 'opda' ? 'At the Open Property Data Association (OPDA), we want' : 'The Open Property Data Association (OPDA) wants'} the definitions to reflect real work, including difficult cases.\n\n${nextStep}\n\nFind your working group: ${signupUrl}` },
  ];
  return Object.freeze({
    ...domain,
    version: MARKETING_VERSION, owner: MARKETING_OWNER, sourceDecisions: MARKETING_SOURCES,
    signupUrl,
    hero: { source: `/images/join/set-3/${domain.image}-light.webp`, alt: `An editorial illustration of ${domain.id === 'general' ? 'people bringing their experience to a shared property project' : domain.label.toLowerCase() + ' work'}.` },
    email: {
      member: email(
        `Help shape property information${domain.id === 'general' ? '' : ` for ${domain.label.toLowerCase()}`}`,
        'An invitation to bring your professional experience to OPDA’s working groups.',
        'Your experience can help shape the work',
        ['We are sharing an opportunity for our members to contribute their experience to the future of property information.', introduction, domain.problem, domain.contribution, reassurance, nextStep],
        'Find your working group and register interest',
      ),
      opda: email(
        'Could you share this invitation with your members?',
        'Ready-to-use email, LinkedIn and presentation material for your network.',
        'Help bring your members’ experience into the work',
        [`I am writing on behalf of the Open Property Data Association (OPDA) about the development of the ${framework}.`, `We would welcome contributions from ${domain.audience}. ${domain.problem}`, domain.contribution, `Could you share the invitation with your members through an email, newsletter or LinkedIn post? A campaign pack with a member email, social posts and a short presentation is available at https://opda.org.uk/marketing/packs/${domain.id}. Please adapt the material freely to suit your organisation and audience.`, 'You retain your relationship with your members. Please distribute through your own channels; we do not need your mailing list.', reassurance, nextStep],
        'See the participation opportunity',
      ),
      personal: email(
        'An opportunity to contribute your property experience',
        'I thought this OPDA working-group invitation might interest you.',
        'A contribution you might be interested in',
        ['I thought this opportunity might be relevant to your work.', introduction, domain.contribution, reassurance, nextStep],
        'Explore the opportunity',
      ),
    },
    linkedin: {
      opda: { copy: opdaCopy, hashtags: ['PropertyData', 'SPDTF'], posts: posts('opda') },
      partner: { copy: partnerCopy, hashtags: ['PropertyData', 'SPDTF'], posts: posts('partner') },
    },
    newsletter: {
      title: 'Bring your experience to OPDA’s working groups',
      short: `The Open Property Data Association (OPDA) is inviting ${domain.audience} to help develop shared definitions for property information through the ${framework}. No data-modelling expertise is required. ${reviewNote} Explore the working groups and register your interest: ${signupUrl}`,
      long: `${introduction}\n\n${domain.contribution}\n\n${reassurance}\n\n${nextStep}\n\nExplore the working groups: ${signupUrl}`,
    },
    onePager: {
      title: 'Your experience can improve property information',
      standfirst: introduction,
      sections: [
        { heading: 'Why it matters', paragraphs: [domain.problem] },
        { heading: 'Where your experience helps', paragraphs: [domain.contribution], bullets: ['Explain meanings, rules and exceptions.', 'Review draft definitions and proposals.', 'Bring examples you are authorised to share.'] },
        { heading: 'Who can contribute', paragraphs: [reassurance, 'Professional, commercial and public-interest perspectives all matter. Choose the group closest to your experience.'] },
        { heading: 'What happens next', paragraphs: [nextStep] },
      ],
      ctaLabel: 'Explore the working groups and register your interest',
    },
    deck: {
      title: 'Professional experience shapes better property information',
      subtitle: `${framework} · ${domain.label}`,
      slides: [
        { title: 'Property information that people can use', body: `An introduction to OPDA’s ${framework} working groups.`, image: `/images/join/set-3/${domain.image}-light.webp`, notes: 'Introduce OPDA using its full name. Explain that this is a programme in development and an invitation to contribute professional experience. This five-minute introduction is not a statement of adopted requirements.' },
        { title: 'A problem in everyday work', body: domain.problem, notes: `Ask whether this is familiar to the audience. Example: ${domain.example} These are illustrative situations, not evidence about a particular organisation.` },
        { title: 'The work in development', body: 'Working groups are developing shared definitions for property information. The aim is to make meaning clearer when people and organisations exchange information.', notes: 'Explain shared definitions in ordinary language. The work develops a specification and recommendations. OPDA is not asking participants to operate a linked-data application.' },
        { title: 'The contribution you can make', bullets: ['Explain the distinctions that matter in your work.', 'Bring authorised examples and difficult cases.', 'Review draft definitions and challenge assumptions.'], notes: domain.contribution },
        { title: 'Your professional judgement matters', body: reassurance, notes: 'Welcome experience from small organisations and public-interest representatives as well as large firms. Do not invent meeting schedules, time commitments, accreditation or endorsement.' },
        { title: 'Working groups and next steps', body: `Explore the groups and register your interest at ${signupUrl}\n\n${reviewNote}`, notes: nextStep },
      ],
    },
  });
}

export const marketingPacks = Object.freeze(marketingDomains.map(packFor));
export const getMarketingPack = (id) => marketingPacks.find((pack) => pack.id === id);

export const marketingFaq = Object.freeze([
  { question: 'Do I need technical or data-modelling knowledge?', answer: reassurance },
  { question: 'What can participants contribute?', answer: contribution },
  { question: 'Does registration commit someone to participate?', answer: 'Registration expresses interest. OPDA will explain the next steps and confirm the arrangements before asking someone to commit.' },
  { question: 'Can an organisation share this with its members?', answer: 'Yes. Choose the member-facing email or organisation LinkedIn version and add your own introduction. Use your existing communication channels and retain control of your mailing list.' },
  { question: 'Is the framework already an adopted standard?', answer: 'The Smart Property Data Trust Framework is in development. These materials invite contributions to that work and do not announce adopted requirements.' },
  { question: 'What source material should someone bring?', answer: 'Only material that they and their organisation are authorised to share. Examples and explanations can help without disclosing confidential records or personal information.' },
]);

export const employerBrief = Object.freeze({
  subject: 'Request to contribute to an OPDA working group',
  paragraphs: [
    'I would like to explore contributing to an Open Property Data Association (OPDA) working group developing the Smart Property Data Trust Framework.',
    'The work concerns shared definitions for property information. Participating would let me explain the needs and exceptions we encounter and review whether draft proposals make sense in practice.',
    'This could help us understand the direction of the work and bring our professional experience into the discussion. I would share only information we authorise and would not make commitments on behalf of our organisation.',
    'I would first register interest and obtain details from OPDA about the format, schedule and expectations. We could then agree whether and how participation fits my responsibilities.',
    `Further information: ${SIGNUP_URL}`,
  ],
});
