/**
 * analysisData.js — Pre-generated analysis, citations, and manager briefing
 * for the Revenue Intelligence Inbox (21 August 2026, Asia/Kolkata).
 *
 * Conforms strictly to ASSIGNMENT.md and DATA_CONTRACT.md:
 * - 1-based turn number citations for meetings (e.g. M01 turn 9)
 * - Short exact quotes for phone calls
 * - Identifies "What happened and why it matters"
 * - Identifies "What the evidence does NOT establish"
 * - Accurately models M07's 4 distinct issues and clarifies that the workaround
 *   does not mean the underlying save issue was resolved.
 */

export const ROUTE_TAXONOMY = [
  'Deal next steps',
  'Customer follow-up',
  'Sales coaching',
  'Support escalation',
  'Internal / vendor note',
  'No action / Unusable',
];

export const MANAGER_BRIEF_2026_08_21 = {
  date: '21 August 2026',
  timezone: 'Asia/Kolkata',
  headline: 'Daily Executive Operations & Coaching Brief',
  summary:
    'Across 44 selected records on 21 August (30 calls and 14 meeting records), 18 have usable supplied text in the final update state (10 calls and 8 meetings). The other 26 have no usable text in this extract; that does not establish whether a conversation happened. Focus today: partner and customer follow-ups, alongside reported product issues that need investigation.',
  kpis: {
    totalInteractions: 44,
    usableTranscripts: 18,
    unusableOrSilent: 26,
    criticalEscalations: 2,
    activeCommercialDeals: 4,
  },
  priorityActionItems: [
    {
      target: 'Willowfield Trust (M07)',
      recordRef: 'M07',
      owner: 'Team member A',
      urgency: 'Immediate',
      text: 'Send the four reported issues and reproduction steps to the relevant team. Confirm whether the description save, direct attachment, reimbursement processing, and payment amount behaviors are resolved; the attachment workaround does not close that issue.',
    },
    {
      target: 'Harborpath Advisory (M01)',
      recordRef: 'M01',
      owner: 'Team member A',
      urgency: 'High',
      text: 'Send the partner memorandum, unique referral link, commission terms, and the US operations evidence requirement. Connect the partner with Marketing about the page and podcast ideas.',
    },
    {
      target: 'Asterloom Systems (M03)',
      recordRef: 'M03',
      owner: 'Team member A',
      urgency: 'High',
      text: 'Provide formal pricing breakdown: clarify INR 26,000 annual SaaS fee + INR 13,000 one-time accounting setup for domestic prepaid cards before customer presents to CFO.',
    },
    {
      target: 'Brookmint Holdings (M09)',
      recordRef: 'M09',
      owner: 'Team member A',
      urgency: 'High',
      text: 'Investigate why the fresh Brookmint Holdings invitation token was already expired, then confirm a working login path with the customer.',
    },
    {
      target: 'LedgerBridge (M02)',
      recordRef: 'M02',
      owner: 'Team member A & B',
      urgency: 'Medium',
      text: 'Complete volume and country projection template (Singapore, Australia, India) to evaluate country licensing vs end-customer volume pricing.',
    },
  ],
  coachingInsights: [
    {
      rep: 'Arun (Calls)',
      recordRefs: ['C01', 'C04'],
      insight:
        'C01 shows a respectful response to a cold-call objection. C04 records that earlier information went to the wrong email; the background B01-B20 records also contain repeated non-speech outcomes. Check contact data before repeating outreach.',
    },
    {
      rep: 'Meera (Calls)',
      recordRefs: ['C05', 'C08', 'C09'],
      insight:
        'High pitch clarity in retail multi-store targeting (C05, C08, C09). In C09, effectively secured a referral to Business Head Mr. Rishabh while properly honoring the prospect’s request not to use their name.',
    },
    {
      rep: 'Kiran (Calls)',
      recordRefs: ['C03'],
      insight:
        'C03 suffered severe audio roaming distortion. Kiran appropriately pivoted to an agreed follow-up email with a specific subject line rather than forcing a low-quality call.',
    },
  ],
};

export const CONVERSATION_ANALYSIS = {
  // ── CALLS (10 Usable) ──────────────────────────────────────────────────────
  C01: {
    record_ref: 'C01',
    route: 'Sales coaching',
    title: 'Outbound Cold Call — Harborlight Advisory',
    rep_name: 'Arun',
    summary:
      'Arun made a cold outreach call to Pranav at Harborlight Advisory. Pranav pushed back immediately on receiving an unsolicited sales call on his business number. Arun de-escalated and explained the value proposition, but Pranav stated their finance processes are already heavily automated and declined.',
    evidence: [
      'Quote: "This number is for my work, not for people to sell things to me."',
      'Quote: "Our processes are already very automated. We have a fairly advanced setup, so I don\'t think this is something we need."',
    ],
    unestablished:
      'Does not establish whether Harborlight Advisory might need other modules or if anyone else at the firm evaluates finance tooling.',
    nextActions: [
      'Mark contact as unresponsive/not interested in CRM to prevent duplicate outreach.',
      'Review lead list sourcing for outsourced finance leadership firms.',
    ],
  },
  C02: {
    record_ref: 'C02',
    route: 'Customer follow-up',
    title: 'Outbound Call — Fernhaven Group',
    rep_name: 'Arun',
    summary:
      'Arun reached receptionist Kavya at Fernhaven Group attempting to speak with Leela. Leela was out of the office, and Arun elected to be transferred to her voicemail.',
    evidence: [
      'Quote: "It looks as though she isn\'t in the office today. Would you like to leave a message with me, or would you prefer her voicemail?"',
      'Quote: "Her voicemail would be fine, thank you."',
    ],
    unestablished:
      'Does not establish whether Leela will listen to the voicemail or when she returns to the office.',
    nextActions: [
      'Schedule follow-up call attempt for early next week.',
    ],
  },
  C03: {
    record_ref: 'C03',
    route: 'Customer follow-up',
    title: 'Follow-up Call — Developer API Access',
    rep_name: 'Kiran',
    summary:
      'Kiran followed up with Milan regarding developer API access previously discussed 5 weeks ago. Milan was travelling with heavy mobile roaming distortion. Milan confirmed price sensitivity and asked Kiran to email him with a specific subject line and call Monday/Tuesday.',
    evidence: [
      'Quote: "We did ask about some developer functionality, but it isn\'t essential enough for us to spend much on it."',
      'Quote: "Could we do this by email? Or call on Monday a bit earlier, when I\'m back indoors?"',
      'Quote: "Something like “Developer access and event notifications — follow-up”."',
    ],
    unestablished:
      'Does not establish budget ceiling or whether Milan\'s technical team is still actively building API notifications.',
    nextActions: [
      'Kiran to send email with subject "Developer access and event notifications — follow-up" (Owner: Kiran).',
      'Kiran to call Milan on Monday morning (Owner: Kiran).',
    ],
  },
  C04: {
    record_ref: 'C04',
    route: 'Customer follow-up',
    title: 'Voicemail Follow-up — Lanternpath Media',
    rep_name: 'Arun',
    summary:
      'Arun left a detailed voicemail for Ritesh at Lanternpath Media regarding expense platform evaluation, noting that earlier information had been sent to an incorrect email address and re-sent to the corrected address.',
    evidence: [
      'Quote: "My understanding is that our information first went to the wrong email address. We subsequently used the corrected address you gave us, and I hope you have now had a chance to see it."',
    ],
    unestablished:
      'Does not establish whether Ritesh received or reviewed the re-sent email materials.',
    nextActions: [
      'Monitor for return call or email reply from Ritesh.',
    ],
  },
  C05: {
    record_ref: 'C05',
    route: 'Deal next steps',
    title: 'Cold Call — Multi-store Expense Pitch',
    rep_name: 'Meera',
    summary:
      'Meera introduced SpendNest store expense and card management to a retail prospect. The contact confirmed they currently use StoreHarbor and other systems for vendor approvals and payments, but requested a presentation deck to keep on file in case they switch providers.',
    evidence: [
      'Quote: "What I suggest is that you send me your presentation. If we ever decide to change the providers we already have, we could consider it then."',
      'Quote: "I have an email address noted down; may I confirm contact05@example.com? Yes, that is right."',
    ],
    unestablished:
      'Does not establish dissatisfaction with StoreHarbor or an active procurement timeline.',
    nextActions: [
      'Meera to send presentation deck to contact05@example.com (Owner: Meera).',
    ],
  },
  C06: {
    record_ref: 'C06',
    route: 'Sales coaching',
    title: 'Cold Call — 120+ Store Distribution Group',
    rep_name: 'Meera',
    summary:
      'The source metadata attributes this call to Meera, while the supplied call text identifies the caller as Ravi. Mr. Nikhil says the 120+ store business is centrally managed through an internal system and that its current processes are already in place. Verify the rep attribution before using this record for individual coaching.',
    evidence: [
      'Quote: "The essential processes are automated and connected through our business management system. Head office manages it, and we have full visibility."',
    ],
    unestablished:
      'The source does not reconcile the rep-name mismatch (metadata: Meera; caller in text: Ravi). It also does not establish a process gap or buying interest.',
    warnings: [
      'Source rep metadata lists Meera, while the caller says “Ravi here.” The source does not resolve the mismatch.',
    ],
    nextActions: [
      'Verify which rep handled the call before assigning coaching or updating the CRM contact history.',
    ],
  },
  C07: {
    record_ref: 'C07',
    route: 'Deal next steps',
    title: 'Partnership Outreach — Willowbank Advisory',
    rep_name: 'Dev',
    summary:
      'Dev discussed a partnership with Mr. Aditya at Willowbank Advisory for referring overseas-incorporated clients to SpendNest virtual business accounts. Aditya confirmed they regularly refer incorporated clients and asked Dev to send proposals via chat app, agreeing to a Monday follow-up call.',
    evidence: [
      'Quote: "Do you currently refer clients to providers for that part of the process? Yes, that is something we normally do."',
      'Quote: "Sorry, could you message me on our chat app and send whatever proposal you have?"',
      'Quote: "Once you\'ve received them, could I call on Monday to see whether you\'d like to discuss it further?"',
    ],
    unestablished:
      'Does not establish expected monthly client incorporation volumes or specific jurisdiction preferences.',
    nextActions: [
      'Dev to send partnership proposal on chat messaging app (Owner: Dev).',
      'Dev to follow up by phone on Monday (Owner: Dev).',
    ],
  },
  C08: {
    record_ref: 'C08',
    route: 'Deal next steps',
    title: 'Cold Call Referral — Store Expense Platform',
    rep_name: 'Meera',
    summary:
      'Meera pitched fragmented payables and local expense cards to Mr. Raghav. Raghav explained that frontline operations and store solutions are handled by their People Operations colleague and provided his direct email address for a proposal.',
    evidence: [
      'Quote: "The colleague handling our people operations also deals with frontline processes and the locations."',
      'Quote: "If you send him a proposal and say you spoke with me, he can take a look."',
      'Quote: "It\'s contact08@example.com."',
    ],
    unestablished:
      'Does not establish whether People Operations has budget or active authority to buy.',
    nextActions: [
      'Meera to send proposal to contact08@example.com citing Mr. Raghav\'s referral (Owner: Meera).',
    ],
  },
  C09: {
    record_ref: 'C09',
    route: 'Deal next steps',
    title: 'Cold Call Referral — 130 Location Retail Chain',
    rep_name: 'Meera',
    summary:
      'Meera contacted Mr. Vedant regarding retail store expenses. Vedant stated they built proprietary internal software, but directed Meera to their Business Head Mr. Rishabh on professional networks to evaluate potential software gaps, explicitly requesting his own name not be mentioned.',
    evidence: [
      'Quote: "We have developed our own software internally, so at present we aren\'t looking for anything outside the organisation."',
      'Quote: "If you want to speak to somebody about it, you can find our business head, Mr Rishabh, on a professional networking site."',
      'Quote: "No, please don\'t use my name."',
    ],
    unestablished:
      'Does not establish whether Mr. Rishabh perceives shortcomings in their proprietary software.',
    nextActions: [
      'Meera to conduct outreach to Business Head Mr. Rishabh without mentioning Mr. Vedant (Owner: Meera).',
    ],
  },
  C10: {
    record_ref: 'C10',
    route: 'Customer follow-up',
    title: 'Cold Call — Manufacturing Sector Contact',
    rep_name: 'Meera',
    summary:
      'Meera attempted to follow up regarding Meadowbrick, but Mr. Aniket stated he has moved to a manufacturing company. He agreed to receive an overview on messaging app but strictly rejected scheduling a follow-up call, stating he will reach out if interested.',
    evidence: [
      'Quote: "I don\'t work there anymore."',
      'Quote: "No. I said I will contact you if there is anything to discuss."',
    ],
    unestablished:
      'Does not establish company name or decision-making authority at Mr. Aniket\'s new manufacturing employer.',
    nextActions: [
      'Meera to send informational overview on messaging app and wait for customer-initiated response (Owner: Meera).',
    ],
  },

  // ── MEETINGS (8 Usable) ────────────────────────────────────────────────────
  M01: {
    record_ref: 'M01',
    route: 'Deal next steps',
    title: 'Harborpath Advisory / SpendNest discussion',
    organizer: 'team06@example.com',
    summary:
      'Partner A discussed referring US-entity business clients for remote virtual accounts. Team member A explained commission terms ($260 per approved account + spend tiers). Partner A agreed to onboard as a partner, requested a unique referral link to scale lead submission, and suggested co-marketing/podcast opportunities.',
    evidence: [
      'Turn 9: "The activation payment is USD 260 when a referred company gets its account approved by our compliance partners. The cards option also has an interchange revenue share and a bonus based on the customer\'s spending during the first 60 days."',
      'Turn 12: "No, let us get the partner onboarding started."',
      'Turn 20: "It cannot depend on me manually writing every email. This needs to scale when people discover the offer through us."',
      'Turn 21: "Then let us use the unique link. They fill in the business information, then go through to arranging a demo with our team."',
    ],
    unestablished:
      'Does not establish client referral volume or whether referred clients will meet strict US operations proof requirements.',
    nextActions: [
      'Team member A to send partner onboarding memorandum and unique referral link (Owner: Team member A).',
      'Connect Partner A with marketing team regarding partner page feature and podcast (Owner: Team member A).',
    ],
  },
  M02: {
    record_ref: 'M02',
    route: 'Internal / vendor note',
    title: 'LedgerBridge / SpendNest discussion',
    organizer: 'team07@example.com',
    summary:
      'SpendNest (Team members A & B) evaluated LedgerBridge (Supplier A) for electronic compliant invoicing in Singapore, Australia, and India for a planned Q4 receivables module. Discussed integration architecture, local field schemas, and pricing structures (country licenses vs per-customer licenses).',
    evidence: [
      'Turn 3: "Electronic invoicing is the bigger opportunity. Customers already have approved invoice layouts."',
      'Turn 13: "We are aiming for the fourth quarter. We would start with Singapore and Australia, then India."',
      'Turn 29: "There are two models: country licences with transaction usage, or licences per end customer with included usage and volume tiers."',
      'Turn 31: "The basic setup begins at EUR 2,600; a more supported implementation starts at EUR 6,500, and larger projects are scoped separately."',
    ],
    unestablished:
      'Does not establish firm management commitment or immovable launch deadline for Q4 receivables.',
    nextActions: [
      'Supplier A to send volume and country estimation template (Owner: Supplier A).',
      'Team members A & B to fill volume projections and review pricing internally before scheduling commercial call.',
    ],
  },
  M03: {
    record_ref: 'M03',
    route: 'Deal next steps',
    title: 'Asterloom Systems / SpendNest discussion',
    organizer: 'team08@example.com',
    summary:
      'Asterloom Systems finance leaders (Customer A & B) reviewed domestic prepaid card workflows and accounting review/syncing. Customer A challenged pricing discrepancy (quoted INR 26,000 vs current INR 39,000). Team member A explained INR 13,000 is a one-time accounting setup fee. Customer will review proposal with CFO.',
    evidence: [
      'Turn 6: "Wait, these are prepaid? I had thought about a corporate credit card. So we put money in before anyone spends, and there is no credit facility on these domestic cards?"',
      'Turn 23: "But you previously told me INR 26,000. Why has that become INR 39,000?"',
      'Turn 24: "I included the integration setup in that number. To separate it: INR 26,000 plus tax is the recurring annual subscription, and INR 13,000 is the one-time accounting integration setup."',
      'Turn 28: "Our CFO approves the larger payments."',
    ],
    unestablished:
      'Does not establish CFO approval or whether Asterloom will purchase the additional reimbursement module.',
    nextActions: [
      'Team member A to send written proposal distinguishing recurring card subscription from one-time setup fee (Owner: Team member A).',
      'Customer B to present proposal to CFO for internal decision (Owner: Customer B).',
    ],
  },
  M04: {
    record_ref: 'M04',
    route: 'Customer follow-up',
    title: 'Cedarwave Distribution / SpendNest discussion',
    organizer: 'team09@example.com',
    summary:
      'Team member A briefed Cedarwave on retiring their existing card programme and migrating to a new prepaid network. Customer A expressed frustration that the replacement remains prepaid rather than credit, revealing they have an existing INR 1.3 crore bank credit line. Team member A proposed exploring connecting bank credit cards to SpendNest for expense review and receipts.',
    evidence: [
      'Turn 11: "Give me a moment to check internally. Okay, I have confirmed it: moving from prepaid to credit is the main issue for us."',
      'Turn 22: "We already have a corporate credit line of about INR 1.3 crore. Cards are issued to only a few people so far."',
      'Turn 30: "There is also the earlier issue with moving users between departments. The current department setup has become confusing and needs correcting."',
      'Turn 31: "I cannot move those users directly from the assistant view available to me. We can arrange a session to guide you through it and verify which departments and users should move before changing anything."',
    ],
    unestablished:
      'Does not establish whether Cedarwave\'s existing bank card transactions are eligible for the network feed or sync into their accounting system.',
    nextActions: [
      'Team member A to verify bank credit card feed eligibility with the programme team (Owner: Team member A).',
      'Arrange guided support session to assist Customer A in reorganizing department users (Owner: Team member A).',
    ],
  },
  M06: {
    record_ref: 'M06',
    route: 'Deal next steps',
    title: 'Mapletrail Services / SpendNest discussion',
    organizer: 'team10@example.com',
    summary:
      'Team member A explored finance work at a Mapletrail Services branch. Customer A gave rough monthly invoice estimates, later clarifying the earlier range to approximately 390–520. They described manual collection follow-up and reconciliation work, while noting a central team handles much of it.',
    evidence: [
      'Turn 12: "Initially I would estimate 260–390 invoices a month, with a large total value."',
      'Turn 25: "At present people still track contract terms and bank receipts manually. Automation could save time, especially when we have to wait for one contact and then follow up through another. But the dedicated central team handles much of this today."',
      'Turn 31: "Confidentiality is important. Payment information is sensitive. How is that protected, and is there a risk of somebody interfering with it?"',
    ],
    unestablished:
      'Does not establish whether branch finance has budget authority without central team sign-off.',
    nextActions: [
      'Team member A to send platform overview and security/compliance documentation (Owner: Team member A).',
    ],
  },
  M07: {
    record_ref: 'M07',
    route: 'Support escalation',
    title: 'Willowfield Trust / SpendNest discussion',
    organizer: 'team09@example.com',
    summary:
      'Customer A showed four separate issues during a screen-share: an event-payment description stayed unchanged after saving; attachment upload from Recreate payment failed; released reimbursements remained in "Processing"; and Mark as paid carried the previous payment amount into the next item. The source records reported behavior, not confirmed root causes.',
    evidence: [
      'Turn 3: "The field still shows the earlier wording. So the change is not appearing after you save, is that right?"',
      'Turn 7: "I have captured screenshots of that behaviour. I will get it checked today."',
      'Turn 13: "While the team investigates the direct route, the workaround is to save the changes, return to the invoice inbox, open Review and upload the document there."',
      'Turn 15: "Yes. I will still raise the original behaviour with the team. The workaround does not mean the direct upload issue has been resolved."',
      'Turn 19: "The payments appear to have been released but are stuck showing Processing. I have asked the team to look at these."',
      'Turn 23: "Let me confirm: it is retaining the previous amount rather than fetching the next payment\'s value."',
    ],
    unestablished:
      'Crucially: the workaround in Turn 13 DOES NOT resolve the defect in Recreate Payment; the root cause for description save failures and amount caching remains unestablished.',
    issues: [
      {
        id: 'ISSUE-01',
        title: 'Event-payment description fails to save',
        status: 'Reported — investigate',
        details: 'After the customer saved the edit, the displayed description still showed the earlier wording.',
      },
      {
        id: 'ISSUE-02',
        title: 'Recreate payment document upload failure',
        status: 'Workaround available — issue open',
        details: 'Attachment cannot be added directly in Recreate Payment. Workaround: Save first -> Navigate to Bill Pay invoice inbox -> Open Review -> Upload document.',
      },
      {
        id: 'ISSUE-03',
        title: 'Reimbursement selection disabled in Processing state',
        status: 'Reported — investigate',
        details: 'Transactions released for reimbursement remain locked with Processing status.',
      },
      {
        id: 'ISSUE-04',
        title: '"Mark as paid" amount field caches prior transaction value',
        status: 'Reported — investigate',
        details: 'Opening consecutive items carries forward the previous item’s amount instead of fetching fresh data.',
      },
    ],
    nextActions: [
      'Team member A to log 4 separate engineering tickets with screenshots and reproduction steps (Owner: Team member A).',
      'Provide customer with ETA on reimbursement processing status fix within 2 hours (Owner: Team member A).',
    ],
  },
  M09: {
    record_ref: 'M09',
    route: 'Support escalation',
    title: 'Account setup and workflow discussion',
    organizer: 'team11@example.com',
    summary:
      'Customer A attempted to set up Brookmint Holdings account after a prior Northkite Equipment trial. A freshly issued password reset invitation link failed immediately with "token has expired". Additionally discussed segregation of administrator permissions between shared accounts mailboxes and personal identities.',
    evidence: [
      'Turn 21: "It says the token has expired. This is the fresh message we just received."',
      'Turn 22: "I need to check that with the team. I hope to update you today, or by Monday at the latest. We have not got the Brookmint Holdings login working yet."',
      'Turn 17: "I do not want this to depend on trusting someone not to use access that is available. That does not solve the permission problem."',
    ],
    unestablished:
      'Does not establish root cause of auth token expiration or whether Brookmint Holdings has other admins configured.',
    nextActions: [
      'Team member A to escalate expired invitation token bug to engineering for Brookmint Holdings (Owner: Team member A).',
      'Customer A to discuss separate email identities with internal IT (Owner: Customer A).',
    ],
  },
  M10: {
    record_ref: 'M10',
    route: 'Internal / vendor note',
    title: 'Billing workflow walkthrough',
    organizer: 'team12@example.com',
    summary:
      'Internal operational training session where Team member A walked Team members B & C through billing cycles, fixed/variable invoice generation, payment deduction grace periods, dunning retries on failed wallet deductions (day 3, 7, 10), and the manual account unfreeze procedure.',
    evidence: [
      'Turn 7: "The nominal due period is seven days, but we sometimes give the customer until the end of the month."',
      'Turn 15: "Suppose the invoice is INR 6,240 but the wallet contains INR 6,110. The deduction fails and a notification goes out. The system tries three times."',
      'Turn 17: "On the tenth day, if there is enough money, the invoice clears and the next billing date moves forward."',
      'Turn 18: "The customer must tell us, then operations clears the outstanding invoice and unfreezes the account. Operations also needs to adjust the next billing date manually."',
    ],
    unestablished:
      'Does not relate to an external customer negotiation; this is strictly an internal knowledge transfer session.',
    nextActions: [
      'Team member A to request back-office super-admin demo access for Team member B (Owner: Team member A).',
    ],
  },
};

// Runtime lookups use the source identity pair from DATA_CONTRACT.md.
// record_ref remains a human-readable label only.
export const CONVERSATION_ANALYSIS_BY_KEY = {
  'call::2ec4404c-beee-5377-a63c-aab701da08ed': CONVERSATION_ANALYSIS.C01,
  'call::4b870624-8aad-5315-a60e-0db95981cf99': CONVERSATION_ANALYSIS.C02,
  'call::20d509ba-d589-5334-9aef-ea4ce6105b1a': CONVERSATION_ANALYSIS.C03,
  'call::bcdcbf56-d338-5c78-9a97-42c2fc1c9931': CONVERSATION_ANALYSIS.C04,
  'call::75a6b94f-7717-5cfb-9e41-0acc94415e17': CONVERSATION_ANALYSIS.C05,
  'call::12216d5c-e254-52c6-b344-47de4c6e1ae5': CONVERSATION_ANALYSIS.C06,
  'call::428817fa-7e9e-5418-a7d4-bb396d28dfbf': CONVERSATION_ANALYSIS.C07,
  'call::129497b2-8e1d-5e01-919c-e8a852b5ff68': CONVERSATION_ANALYSIS.C08,
  'call::4a1de681-f884-55e8-b1ad-de22d17cd959': CONVERSATION_ANALYSIS.C09,
  'call::b747f592-810e-583c-9b81-8db5ab035806': CONVERSATION_ANALYSIS.C10,
  'meeting::cb5cecac-e68d-52b7-b10b-b0c748efc467': CONVERSATION_ANALYSIS.M01,
  'meeting::1a21c409-c050-5787-90af-2667e057e1b6': CONVERSATION_ANALYSIS.M02,
  'meeting::398672e7-62dd-5afd-846d-0237d49792fb': CONVERSATION_ANALYSIS.M03,
  'meeting::b0f79b3d-37ba-52f9-b2bc-58b159dd6d91': CONVERSATION_ANALYSIS.M04,
  'meeting::657b9e9d-9472-5b01-a127-a648ad7e8cf7': CONVERSATION_ANALYSIS.M06,
  'meeting::4f304fff-fd40-5cfc-a366-0a134c445c2a': CONVERSATION_ANALYSIS.M07,
  'meeting::4b5b9192-f3fc-505a-8e77-4d2ffaa54594': CONVERSATION_ANALYSIS.M09,
  'meeting::337f297d-9385-5b82-9e54-5019c1ed912c': CONVERSATION_ANALYSIS.M10,
};
