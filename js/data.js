// Navigation items
const NAV = [
  { id: 'home', icon: '&#8962;', label: 'Home' },
  { id: 'report', icon: '&#9998;', label: 'Report' },
  { id: 'chat-what', icon: '&#63;', label: 'Guidance' },
  { id: 'forums', icon: '&#9993;', label: 'Forums' },
  { id: 'support', icon: '&#9829;', label: 'Support' }
];

// Forum posts data
const FORUM_POSTS = [
  {
    id: 0,
    initials: 'MR',
    bg: '#d4c5f0',
    tc: '#3c2580',
    title: 'Reporting a hate crime? Advice needed.',
    user: 'Mike R.',
    time: '2h ago',
    comments: 45,
    likes: 102,
    body: 'I experienced a hate crime incident two weeks ago and I\'m not sure how to proceed with reporting. Any advice on the best way to document and report this?',
    replies: [
      { initials: 'SR', user: 'Sarah R.', time: '1h ago', text: 'Document everything with dates and times. This is crucial for any formal complaint.' },
      { initials: 'JK', user: 'James K.', time: '45m ago', text: 'Have you contacted local law enforcement or the EEOC? Both have resources.' },
      { initials: 'MR', user: 'Mike R.', time: '30m ago', text: 'Thanks everyone. I did file a police report last week.' }
    ]
  },
  {
    id: 1,
    initials: 'JT',
    bg: '#fde8c8',
    tc: '#854F0B',
    title: 'Subtle forms of microaggressions in academic settings',
    user: 'Jasmine T.',
    time: '2h ago',
    comments: 31,
    likes: 78,
    body: 'I\'ve been experiencing constant microaggressions in my graduate program. Small comments, exclusion from group projects, and dismissive behavior. Is this something I should formally report?',
    replies: [
      { initials: 'AH', user: 'Alex H.', time: '1.5h ago', text: 'The cumulative effect of microaggressions can be just as damaging as overt discrimination.' },
      { initials: 'PC', user: 'Prof. Chen', time: '1h ago', text: 'This is unfortunately common. Consider speaking to your academic advisor or Title IX office.' },
      { initials: 'JT', user: 'Jasmine T.', time: '25m ago', text: 'I appreciate the support. Already reached out to our university ombudsperson.' }
    ]
  },
  {
    id: 2,
    initials: 'DL',
    bg: '#c8e0f0',
    tc: '#185FA5',
    title: 'Finding support: dealing with the psychological impact',
    user: 'David L.',
    time: '2h ago',
    comments: 22,
    likes: 65,
    body: 'The emotional toll of experiencing discrimination has been overwhelming. Has anyone found helpful ways to process this trauma and find support?',
    replies: [
      { initials: 'MH', user: 'Maya H.', time: '1.5h ago', text: 'Therapy has really helped me process my experience. Highly recommend finding a trauma-informed therapist.' },
      { initials: 'CB', user: 'Carlos B.', time: '1h ago', text: 'Same here. The mental health toll is real and valid.' },
      { initials: 'SL', user: 'Support Line', time: '30m ago', text: 'You can reach our confidential support line at 1-800-XXX-XXXX (24/7).' }
    ]
  },
  {
    id: 3,
    initials: 'EV',
    bg: '#f0e8c8',
    tc: '#633806',
    title: 'Historical perspective: the root of systemic racism',
    user: 'Dr. Elara V.',
    time: '2h ago',
    comments: 15,
    likes: 40,
    body: 'To better understand current discrimination, I\'ve been reading about its historical roots. This context has been illuminating for understanding systemic patterns.',
    replies: [
      { initials: 'TJ', user: 'Tanya J.', time: '1.5h ago', text: 'Understanding the historical context really changes how I see current events.' },
      { initials: 'RK', user: 'Robert K.', time: '1h ago', text: 'Great reading recommendation. This book was eye-opening.' },
      { initials: 'EV', user: 'Dr. Elara V.', time: '20m ago', text: 'Glad this sparked some thoughtful discussion. Knowledge is power.' }
    ]
  }
];

// Report form steps - Discrimination Incident Reporting
const REPORT_STEPS = [
  {
    q: '📋 Your report is completely anonymous and confidential. No identifiers will be recorded.',
    type: 'info'
  },
  {
    q: 'When did this incident occur?',
    type: 'radio',
    opts: ['Today/Right now', 'This week', 'This month', 'More than a month ago']
  },
  {
    q: 'What type of discrimination did you experience?',
    type: 'select',
    placeholder: 'Select category',
    opts: ['Race/Color', 'Gender/Gender Identity', 'Religion', 'Age', 'Disability', 'National Origin', 'Sexual Orientation', 'Pregnancy', 'Other', 'Unsure']
  },
  {
    q: 'Where did this occur?',
    type: 'select',
    placeholder: 'Select location type',
    opts: ['Workplace', 'School/University', 'Housing', 'Public Accommodation', 'Law Enforcement', 'Healthcare', 'Other']
  },
  {
    q: 'Briefly describe what happened (optional)',
    type: 'textarea'
  },
  {
    q: 'Are there any witnesses or evidence? (optional)',
    type: 'textarea'
  }
];

// Guidance prompts (What should I do?)
const WHAT_PROMPTS = [
  {
    bot: "That pattern can indicate retaliation, which is protected conduct under most anti-discrimination laws. I'd suggest: (1) Document the date, meeting name, and who attended. (2) Send a follow-up email asking to be included in future meetings — this creates a paper trail. (3) If it continues, you can raise it with HR under your company's anti-retaliation policy."
  },
  {
    bot: "Repeated comments about your accent may constitute national-origin harassment. You have options: (1) If comfortable, calmly tell the colleague the comments are unwelcome. (2) Document each incident with dates and exact words. (3) Report to HR — you don't have to confront them directly. You're protected from retaliation for making a good-faith complaint."
  },
  {
    bot: "This could be discriminatory if protected characteristics played a role. Key steps: (1) Request written feedback on why you weren't selected. (2) Compare your qualifications to whoever was promoted. (3) Check if there's a pattern — were others in your group also passed over? Document everything and consider consulting your HR policy or an employment attorney."
  }
];

// Identification prompts (Identify an experience) - Will use Ollama/Gemma if available
const IDENTIFY_PROMPTS = [
  {
    bot: "I'm here to help you understand if what you experienced may be discrimination. Tell me what happened and I'll ask clarifying questions to better understand the situation."
  }
];

// Guidance prompts (What should I do?) - Will use Ollama/Gemma if available
const WHAT_PROMPTS = [
  {
    bot: "I'm here to help you understand your options and next steps. Tell me about your situation and I'll provide guidance on how to document the incident and what actions you can take."
  }
];

// System prompt for Ollama/Gemma
const OLLAMA_SYSTEM_PROMPT = `You are a knowledgeable assistant helping people understand discrimination and their rights. You provide:
1. Clear explanations of what constitutes discrimination under US law
2. Information about protected characteristics (race, color, religion, sex, national origin, age 40+, disability, genetic information)
3. Guidance on documenting incidents with dates, witnesses, and specific details
4. Information about reporting options (HR, EEOC, state agencies, etc.)
5. Support resources and next steps
6. Emphasis on confidentiality and non-retaliation protections

Always be empathetic, non-judgmental, and encourage formal reporting when appropriate. Keep responses concise (2-3 sentences) for mobile display. Focus on actionable advice.`;
