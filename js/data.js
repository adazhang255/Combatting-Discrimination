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
    initials: 'MR',
    bg: '#d4c5f0',
    tc: '#3c2580',
    title: 'Reporting a hate crime? Advice needed.',
    user: 'Mike R.',
    time: '2h ago',
    comments: 45,
    likes: 102
  },
  {
    initials: 'JT',
    bg: '#fde8c8',
    tc: '#854F0B',
    title: 'Subtle forms of microaggressions in academic settings',
    user: 'Jasmine T.',
    time: '2h ago',
    comments: 31,
    likes: 78
  },
  {
    initials: 'DL',
    bg: '#c8e0f0',
    tc: '#185FA5',
    title: 'Finding support: dealing with the psychological impact',
    user: 'David L.',
    time: '2h ago',
    comments: 22,
    likes: 65
  },
  {
    initials: 'EV',
    bg: '#f0e8c8',
    tc: '#633806',
    title: 'Historical perspective: the root of systemic racism',
    user: 'Dr. Elara V.',
    time: '2h ago',
    comments: 15,
    likes: 40
  }
];

// Report form steps
const REPORT_STEPS = [
  {
    q: 'Is this crime occurring right now?',
    type: 'radio',
    opts: ['Yes', 'No — choose date & time']
  },
  {
    q: 'What state was this in?',
    type: 'select',
    placeholder: 'Select a state'
  },
  {
    q: 'What city?',
    type: 'select',
    placeholder: 'Select a city'
  },
  {
    q: 'Do you have an exact address or nearest cross streets?',
    type: 'radio',
    opts: ['Yes', 'No']
  },
  {
    q: 'Describe what happened (optional — your report is confidential)',
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

// Identification prompts (Identify an experience)
const IDENTIFY_PROMPTS = [
  {
    bot: "It's hard to know without more details, but here are the key questions: Was the treatment less favorable than others in similar situations? Was a protected characteristic (race, gender, age, disability, religion, etc.) a likely factor? Was it a pattern or isolated? Even if uncertain, you have the right to report it. Would you like help identifying which category it might fall under?"
  },
  {
    bot: "What you're describing could be racial discrimination in a performance evaluation. This is one of the most documented forms of workplace bias. Key indicators: similar work quality, different outcomes, and racial pattern. I'd recommend: (1) Request a copy of your review in writing. (2) Note colleagues whose work was comparable and their ratings. (3) File a report with HR or the EEOC."
  }
];
