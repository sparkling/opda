export const HANDOVER_DOCUMENTS = [
  { url: '/handover/getting-started', title: 'Getting started', summary: 'Establish ownership, understand the standards boundaries and set up a reproducible local environment.' },
  { url: '/handover/architecture', title: 'Architecture and repository', summary: 'Understand the public website, model tooling, participant services and maintained source locations.' },
  { url: '/handover/models-and-validation', title: 'Models and validation', summary: 'Change models at their maintained source and select the right validation evidence.' },
  { url: '/handover/release-and-recovery', title: 'Release and recovery', summary: 'Publish through CI, verify the live release and respond to operational incidents.' },
  { url: '/handover/operations-and-access', title: 'Operations and access', summary: 'Transfer account ownership, scheduled automation, Microsoft workspaces and evidence intake.' },
  { url: '/handover/content-and-notebooklm', title: 'Content and NotebookLM', summary: 'Maintain resources, marketing materials, notebooks, generated media and source provenance.' },
  { url: '/handover/acceptance-and-evidence', title: 'Acceptance and evidence', summary: 'Record acceptance, assign open actions and retain the evidence behind this handover.' },
];

export const HANDOVER_NAVIGATION_SECTION = {
  key: 'handover',
  title: 'Handover',
  summary: 'Maintainer responsibilities, procedures and acceptance evidence.',
  groups: [{ heading: 'Handover overview', url: '/handover', items: HANDOVER_DOCUMENTS }],
};
