const taskImage = (id, alt) => Object.freeze({
  source: `/images/marketing/2026-09/tasks/${id}-light.webp`,
  darkSource: `/images/marketing/2026-09/tasks/${id}-dark.webp`,
  alt,
  width: 1200,
  height: 300,
});

export const marketingTasks = Object.freeze([
  { id: 'share-with-members', title: 'Share with your members', eyebrow: 'For organisations and networks', description: 'A complete member email, newsletter insert and campaign pack for your own channels.', action: 'Choose a member-sharing pack', image: taskImage('share-with-members', 'A print-studio campaign kit radiating through envelopes and member portraits to show an organisation sharing through its own channels.') },
  { id: 'invite-someone', title: 'Invite someone', eyebrow: 'For OPDA and individual supporters', description: 'Ask an organisation to share the opportunity, or invite a colleague personally.', action: 'Find the right invitation', image: taskImage('invite-someone', 'An ink-drawn sequence of a thoughtful note passing from one colleague to another and then into a small professional conversation.') },
  { id: 'linkedin', title: 'Post on LinkedIn', eyebrow: 'For OPDA and your organisation', description: 'Distinct campaign sequences with relevant artwork and copy ready to adapt.', action: 'Explore the LinkedIn campaigns', image: taskImage('linkedin', 'An editorial triptych showing an invitation, a concrete property-information example and practitioners contributing to a shared model.') },
  { id: 'presentations', title: 'Give a presentation', eyebrow: 'For meetings and events', description: 'A short introduction with speaker notes, a one-page overview and sector examples.', action: 'Get presentation materials', image: taskImage('presentations', 'A paper-craft presentation kit in use around a meeting table, with the audience turning from the slides into discussion.') },
  { id: 'employer-support', title: 'Get support to participate', eyebrow: 'For prospective contributors', description: 'Explain the value to your organisation and explore participation with your manager.', action: 'Use the employer briefing', image: taskImage('employer-support', 'Two colleagues use a coloured-pencil plan to discuss experience, time, authorised examples and boundaries for participation.') },
  { id: 'brand', title: 'Brand and approved messages', eyebrow: 'For everyone sharing the work', description: 'Use the official identity and keep the invitation clear, accurate and accessible.', action: 'Read the sharing guidance', image: taskImage('brand', 'A precision printmaking bench with separate light and dark identity plates, colour swatches, guides and a blank partner card.') },
]);
