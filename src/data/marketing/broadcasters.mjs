/** Who is sharing the material, distinct from the audience they want to reach.
 * These are curated routes into canonical material, not duplicate campaign assets. */
export const marketingBroadcasters = Object.freeze([
  {
    id: 'opda',
    title: 'OPDA representatives',
    description: 'For authorised OPDA representatives contacting organisations, presenting the work or publishing from OPDA’s own account.',
    guidance: 'Use the OPDA voice when you are authorised to speak for OPDA. When contacting a professional body or interest group, offer a finished member-sharing pack and let that organisation choose whether and how to share it.',
    boundary: 'Only authorised representatives should speak on behalf of OPDA. A request to share does not establish a partnership or endorsement.',
    materials: [
      { title: 'Ask an organisation to share', audience: 'Email outreach', description: 'A rich invitation for Maria and other OPDA representatives to send to their organisational contacts.', url: '/marketing/invite-someone#organisation-invite', action: 'Open the OPDA invitation' },
      { title: 'Publish from the OPDA account', audience: 'LinkedIn', description: 'Use OPDA’s own three-post campaign, with artwork and an infographic ready to upload.', url: '/marketing/linkedin#general-linkedin-opda', action: 'Open the OPDA campaign' },
      { title: 'Brief a network or meeting', audience: 'Presentation', description: 'Introduce the opportunity with a short editable deck, speaker notes and a one-page overview.', url: '/marketing/presentations', action: 'Get presentation materials' },
    ],
  },
  {
    id: 'organisations',
    title: 'Organisations and interest groups',
    description: 'For professional bodies, industry networks, employers and community organisations sharing through their own channels.',
    guidance: 'Choose the field your members or colleagues know best. Use your organisation’s voice, introduction and signature. The member invitation, newsletter editions and organisation LinkedIn campaign already explain the opportunity to that audience.',
    boundary: 'Keep your mailing list in your own systems. Sharing material does not register anyone, commit your organisation or imply an OPDA partnership.',
    materials: [
      { title: 'Email your members', audience: 'Member invitation', description: 'Find a ready member-facing invitation with examples from the relevant property field.', url: '/marketing/share-with-members', action: 'Choose a member-sharing pack' },
      { title: 'Include a newsletter item', audience: 'Newsletter', description: 'Use the short notice or longer introduction, both supplied as rich HTML with embedded images.', url: '/marketing/packs/general#newsletter', action: 'View the newsletter editions' },
      { title: 'Post from your organisation', audience: 'LinkedIn', description: 'Share a three-post sequence in your own organisation’s voice without implying endorsement.', url: '/marketing/linkedin#general-linkedin-partner', action: 'Open the organisation campaign' },
    ],
  },
  {
    id: 'individuals',
    title: 'Individual supporters',
    description: 'For people inviting a colleague, introducing the opportunity in their community or asking their employer for support.',
    guidance: 'Explain why you thought of the person you are contacting and what their experience could contribute. Sign with your own name. If you need employer support to participate, use the separate briefing for that conversation.',
    boundary: 'Share the opportunity as yourself. Do not imply that you represent OPDA or your employer without the relevant authority.',
    materials: [
      { title: 'Invite a colleague', audience: 'Personal invitation', description: 'A rich personal email you can adapt with a sentence about why their experience matters.', url: '/marketing/invite-someone#personal-invite', action: 'Open the personal invitation' },
      { title: 'Ask for employer support', audience: 'Participation', description: 'Explain the opportunity and discuss scope, time and authorised examples with your manager.', url: '/marketing/employer-support', action: 'Use the employer briefing' },
      { title: 'Introduce the work to a group', audience: 'Presentation', description: 'Use the short deck and one-page overview for a meeting or community conversation.', url: '/marketing/presentations', action: 'Get presentation materials' },
    ],
  },
]);
