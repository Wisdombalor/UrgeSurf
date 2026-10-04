export const TABS = [
  ['home', 'Home'],
  ['rec', 'Recovery'],
  ['com', 'Community'],
  ['sup', 'Support'],
]

export const ADMIN_TAB = ['admin', 'Admin']

// Hash routes for the admin area (works on static hosting, no rewrites).
// #/admin, #/admin/reports, #/admin/posts, #/admin/users, #/admin/history
export function parseAdminRoute(hash) {
  const m = (hash || '').match(/^#\/admin(?:\/(\w+))?/)
  return m ? m[1] || 'dashboard' : null
}

export function adminHash(sub) {
  return sub ? `#/admin/${sub}` : '#/admin'
}

// Google-account emails allowed into the admin area. Keep in sync with
// the allowlist in supabase/schema.sql and VITE_ADMIN_EMAILS.
export const ADMIN_EMAILS = (import.meta.env?.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.includes(String(email).trim().toLowerCase())
}

export const TRIGGERS = [
  'Stress',
  'Boredom',
  'Money',
  'Sports',
  'Social',
  'Gambling content',
  'Loneliness',
  'Anger',
  'Other',
]

export const INTERESTS_ALL = [
  'Football',
  'Music',
  'Comedy',
  'Cooking',
  'Fitness',
  'Gaming',
  'Tech',
  'Art',
  'Documentaries',
]

export const DEFAULT_INTERESTS = ['Football', 'Music', 'Comedy', 'Cooking', 'Fitness', 'Gaming']

export const DISTRACT_NEW = ['Learn something', 'Make something', 'Move your body', '5-minute challenge']

export const URGE_HELP_OPTIONS = [
  { title: 'Breathe for a minute', sub: 'A guided circle to slow things down', key: 'breathe' },
  { title: 'Distract me', sub: 'Pick something you like, or try something new', key: 'dist' },
  { title: 'Talk to the community', sub: 'Anonymous peers online now', key: 'com' },
  { title: 'Call someone I trust', sub: 'Your chosen person, one tap', key: 'call' },
  { title: 'Turn on my blocker', sub: 'Protection setup in a minute', key: 'sup' },
]

export const CR = {
  NG: [
    'Nigeria',
    [
      ['Emergency (police, fire, ambulance)', '112', '112'],
      ['SURPIN helpline (24h, toll free)', '08000787746', '080 0078 7746'],
      ['MANI (Mentally Aware Nigeria Initiative)', '08091116264', '0809 111 6264'],
      ['Asido Foundation psychological helpline', '+2349028080416', '+234 902 808 0416'],
    ],
    '',
  ],
  US: [
    'United States',
    [
      ['Emergency', '911', '911'],
      ['988 Suicide and Crisis Lifeline', '988', '988'],
    ],
    '',
  ],
  GB: [
    'United Kingdom',
    [
      ['Emergency', '999', '999'],
      ['Samaritans', '116123', '116 123'],
    ],
    '',
  ],
  CA: [
    'Canada',
    [
      ['Emergency', '911', '911'],
      ['Suicide Crisis Helpline', '988', '988'],
    ],
    "No verified national gambling line here. Ask your province's problem gambling service.",
  ],
  AU: [
    'Australia',
    [
      ['Emergency', '000', '000'],
      ['Lifeline', '131114', '13 11 14'],
    ],
    '',
  ],
  IN: [
    'India',
    [
      ['Emergency', '112', '112'],
      ['iCALL helpline', '+919152987821', '+91 91529 87821'],
      ['KIRAN mental health helpline', '18005990019', '1800 599 0019'],
    ],
    'No verified national gambling line here.',
  ],
}

export const GAMBLING_LINES = {
  NG: [
    ['Gamble Alert (24/7, toll free)', '+2347058890073', '+234 705 889 0073', ''],
    ['Gamble Alert (second line)', '+2347058890074', '+234 705 889 0074', ''],
  ],
  US: [
    [
      'National Problem Gambling Helpline (call or text)',
      '18006973738',
      '1-800-MY-RESET',
      'https://www.ncpgambling.org',
    ],
  ],
  GB: [
    [
      'National Gambling Helpline (GamCare, free)',
      '08088020133',
      '0808 8020 133',
      'https://www.begambleaware.org',
    ],
  ],
  AU: [
    ['Gambling Help Online', '1800858858', '1800 858 858', 'https://www.gamblinghelponline.org.au'],
  ],
}

export const BLOCKERS = [
  [
    'BetBlocker',
    'Free. Blocks gambling sites and apps.',
    'https://betblocker.org',
    [
      ['Create a free account', 'Go to betblocker.org and sign up with your email.'],
      ['Install the app', 'Download BetBlocker on every device you use: Android, iPhone or iPad, Mac or Windows.'],
      ['Sign in and add the device', 'Log in on each device and follow the prompts to start blocking.'],
      ['Allow permissions', 'Accept the VPN or profile request so it can block gambling sites and apps.'],
      ['Add an ally if offered', 'If there is an ally or partner option, choose someone you trust.'],
    ],
  ],
  [
    'Gamban',
    'Paid. Blocks gambling sites and apps across devices.',
    'https://gamban.com',
    [
      ['Choose a plan', 'Go to gamban.com and pick the plan that covers your devices.'],
      ['Create an account', 'Sign up, then download the installer for each device.'],
      ['Install and sign in', 'Run the installer and allow any permission it asks for.'],
      ['Leave it running', 'Do not uninstall it. Ask a trusted person to keep the password.'],
    ],
  ],
  [
    'Cold Turkey Blocker',
    'Free and paid. Computer blocker you can lock in.',
    'https://getcoldturkey.com',
    [
      ['Download it', 'Get the Windows or Mac version from getcoldturkey.com.'],
      ['Create a block', 'Open the app and add a new block.'],
      ['Add gambling sites', 'Add the betting and casino sites you use, plus any apps.'],
      ['Lock it on', 'Set it to run all the time and choose a locked mode so it cannot be switched off easily.'],
    ],
  ],
  [
    'Freedom',
    'Paid. Blocks sites and apps on a schedule.',
    'https://freedom.to',
    [
      ['Sign up', 'Create an account at freedom.to and install it on every device.'],
      ['Make a blocklist', 'Add gambling sites and apps to a new blocklist.'],
      ['Start or schedule it', 'Start a session now or set it to repeat every day.'],
      ['Turn on Locked Mode', 'This stops you ending a session early.'],
    ],
  ],
  [
    'GAMSTOP (UK only)',
    'Free. Self-exclusion from UK licensed gambling sites.',
    'https://www.gamstop.co.uk',
    [
      ['Register', 'Go to gamstop.co.uk and create an account.'],
      ['Verify your details', 'Enter your details so operators can match you.'],
      ['Choose how long', 'Pick an exclusion period. You cannot end it early.'],
      ['Confirm by email', 'It covers UK licensed sites and apps only.'],
    ],
  ],
]

export const SUPPORT_EMAIL = 'Wisdomudohwest@gmail.com'

// FormSubmit activation token — used in the AJAX endpoint so the naked
// email address is not exposed in the form action.
export const FORMSUBMIT_TOKEN = '007250d059cd86cffdb7f20b33f11e01'

export const COMMUNITY_RULES = [
  ['Be kind', 'No judgement, no shaming. Encourage recovery, even when someone slips.'],
  ['Stay anonymous-safe', 'Never share phone numbers, emails, addresses, or full names — yours or anyone’s.'],
  ['No gambling content', 'No tips, odds, site names, or links that could trigger someone.'],
  ['No hate or harassment', 'No abuse, threats, or discrimination of any kind.'],
  ['Keep it supportive', 'Share what happened and what helped. Reports are reviewed by a moderator.'],
]

export const STORY_TIME_FILTERS = [
  ['all', 'All time'],
  ['today', 'Today'],
  ['week', 'Past 7 days'],
  ['month', 'Past 30 days'],
]

export const STORY_SOBER_FILTERS = [
  ['any', 'Any streak'],
  ['new', '0–7 days'],
  ['building', '8–30 days'],
  ['strong', '31–90 days'],
  ['steady', '90+ days'],
]

export function soberBucket(days) {
  if (days == null) return null
  if (days <= 7) return 'new'
  if (days <= 30) return 'building'
  if (days <= 90) return 'strong'
  return 'steady'
}

export const WELCOME_QUOTES = [
  ['Ride the wave, don’t chase it.', 'Urges peak and pass like waves. Stay on the board.'],
  ['Day one takes courage.', 'You already did the hardest part — you showed up.'],
  ['Small steps, every day.', 'One protected choice at a time. This app will keep count with you.'],
  ['You are not alone here.', 'A quiet community and real tools, whenever an urge hits.'],
  ['Progress, not perfection.', 'A reset never erases the days before it. Keep going.'],
]

export const COUNTRIES = [
  ['AF', 'Afghanistan'], ['AL', 'Albania'], ['DZ', 'Algeria'], ['AD', 'Andorra'], ['AO', 'Angola'],
  ['AG', 'Antigua and Barbuda'], ['AR', 'Argentina'], ['AM', 'Armenia'], ['AU', 'Australia'], ['AT', 'Austria'],
  ['AZ', 'Azerbaijan'], ['BS', 'Bahamas'], ['BH', 'Bahrain'], ['BD', 'Bangladesh'], ['BB', 'Barbados'],
  ['BY', 'Belarus'], ['BE', 'Belgium'], ['BZ', 'Belize'], ['BJ', 'Benin'], ['BT', 'Bhutan'],
  ['BO', 'Bolivia'], ['BA', 'Bosnia and Herzegovina'], ['BW', 'Botswana'], ['BR', 'Brazil'], ['BN', 'Brunei'],
  ['BG', 'Bulgaria'], ['BF', 'Burkina Faso'], ['BI', 'Burundi'], ['CV', 'Cabo Verde'], ['KH', 'Cambodia'],
  ['CM', 'Cameroon'], ['CA', 'Canada'], ['CF', 'Central African Republic'], ['TD', 'Chad'], ['CL', 'Chile'],
  ['CN', 'China'], ['CO', 'Colombia'], ['KM', 'Comoros'], ['CG', 'Congo (Brazzaville)'], ['CD', 'Congo (DRC)'],
  ['CR', 'Costa Rica'], ['CI', "Côte d'Ivoire"], ['HR', 'Croatia'], ['CU', 'Cuba'], ['CY', 'Cyprus'],
  ['CZ', 'Czechia'], ['DK', 'Denmark'], ['DJ', 'Djibouti'], ['DM', 'Dominica'], ['DO', 'Dominican Republic'],
  ['EC', 'Ecuador'], ['EG', 'Egypt'], ['SV', 'El Salvador'], ['GQ', 'Equatorial Guinea'], ['ER', 'Eritrea'],
  ['EE', 'Estonia'], ['SZ', 'Eswatini'], ['ET', 'Ethiopia'], ['FJ', 'Fiji'], ['FI', 'Finland'],
  ['FR', 'France'], ['GA', 'Gabon'], ['GM', 'Gambia'], ['GE', 'Georgia'], ['DE', 'Germany'],
  ['GH', 'Ghana'], ['GR', 'Greece'], ['GD', 'Grenada'], ['GT', 'Guatemala'], ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau'], ['GY', 'Guyana'], ['HT', 'Haiti'], ['HN', 'Honduras'], ['HU', 'Hungary'],
  ['IS', 'Iceland'], ['IN', 'India'], ['ID', 'Indonesia'], ['IR', 'Iran'], ['IQ', 'Iraq'],
  ['IE', 'Ireland'], ['IL', 'Israel'], ['IT', 'Italy'], ['JM', 'Jamaica'], ['JP', 'Japan'],
  ['JO', 'Jordan'], ['KZ', 'Kazakhstan'], ['KE', 'Kenya'], ['KI', 'Kiribati'], ['KP', 'North Korea'],
  ['KR', 'South Korea'], ['XK', 'Kosovo'], ['KW', 'Kuwait'], ['KG', 'Kyrgyzstan'], ['LA', 'Laos'],
  ['LV', 'Latvia'], ['LB', 'Lebanon'], ['LS', 'Lesotho'], ['LR', 'Liberia'], ['LY', 'Libya'],
  ['LI', 'Liechtenstein'], ['LT', 'Lithuania'], ['LU', 'Luxembourg'], ['MG', 'Madagascar'], ['MW', 'Malawi'],
  ['MY', 'Malaysia'], ['MV', 'Maldives'], ['ML', 'Mali'], ['MT', 'Malta'], ['MH', 'Marshall Islands'],
  ['MR', 'Mauritania'], ['MU', 'Mauritius'], ['MX', 'Mexico'], ['FM', 'Micronesia'], ['MD', 'Moldova'],
  ['MC', 'Monaco'], ['MN', 'Mongolia'], ['ME', 'Montenegro'], ['MA', 'Morocco'], ['MZ', 'Mozambique'],
  ['MM', 'Myanmar'], ['NA', 'Namibia'], ['NR', 'Nauru'], ['NP', 'Nepal'], ['NL', 'Netherlands'],
  ['NZ', 'New Zealand'], ['NI', 'Nicaragua'], ['NE', 'Niger'], ['NG', 'Nigeria'], ['MK', 'North Macedonia'],
  ['NO', 'Norway'], ['OM', 'Oman'], ['PK', 'Pakistan'], ['PW', 'Palau'], ['PS', 'Palestine'],
  ['PA', 'Panama'], ['PG', 'Papua New Guinea'], ['PY', 'Paraguay'], ['PE', 'Peru'], ['PH', 'Philippines'],
  ['PL', 'Poland'], ['PT', 'Portugal'], ['QA', 'Qatar'], ['RO', 'Romania'], ['RU', 'Russia'],
  ['RW', 'Rwanda'], ['KN', 'Saint Kitts and Nevis'], ['LC', 'Saint Lucia'], ['VC', 'Saint Vincent and the Grenadines'],
  ['WS', 'Samoa'], ['SM', 'San Marino'], ['ST', 'Sao Tome and Principe'], ['SA', 'Saudi Arabia'], ['SN', 'Senegal'],
  ['RS', 'Serbia'], ['SC', 'Seychelles'], ['SL', 'Sierra Leone'], ['SG', 'Singapore'], ['SK', 'Slovakia'],
  ['SI', 'Slovenia'], ['SB', 'Solomon Islands'], ['SO', 'Somalia'], ['ZA', 'South Africa'], ['SS', 'South Sudan'],
  ['ES', 'Spain'], ['LK', 'Sri Lanka'], ['SD', 'Sudan'], ['SR', 'Suriname'], ['SE', 'Sweden'],
  ['CH', 'Switzerland'], ['SY', 'Syria'], ['TW', 'Taiwan'], ['TJ', 'Tajikistan'], ['TZ', 'Tanzania'],
  ['TH', 'Thailand'], ['TL', 'Timor-Leste'], ['TG', 'Togo'], ['TO', 'Tonga'], ['TT', 'Trinidad and Tobago'],
  ['TN', 'Tunisia'], ['TR', 'Turkey'], ['TM', 'Turkmenistan'], ['TV', 'Tuvalu'], ['UG', 'Uganda'],
  ['UA', 'Ukraine'], ['AE', 'United Arab Emirates'], ['GB', 'United Kingdom'], ['US', 'United States'], ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'], ['VU', 'Vanuatu'], ['VA', 'Vatican City'], ['VE', 'Venezuela'], ['VN', 'Vietnam'],
  ['YE', 'Yemen'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
]

export const COUNTRY_NAMES = Object.fromEntries(COUNTRIES)

export const CURRENCIES = [
  ['NGN', '₦', 'Nigerian naira'],
  ['USD', '$', 'US dollar'],
  ['EUR', '€', 'Euro'],
  ['GBP', '£', 'British pound'],
  ['CAD', '$', 'Canadian dollar'],
  ['AUD', '$', 'Australian dollar'],
  ['INR', '₹', 'Indian rupee'],
  ['ZAR', 'R', 'South African rand'],
  ['KES', 'KSh', 'Kenyan shilling'],
  ['GHS', '₵', 'Ghanaian cedi'],
]

export function currencySymbol(code) {
  const hit = CURRENCIES.find(([c]) => c === code)
  return hit ? hit[1] : code || ''
}

export const DEFAULT_DATA = {
  contacts: [],
  country: 'NG',
  active: {},
  stories: [],
  name: '',
  since: '',
  sinceTs: null,
  periods: [],
  urges: [],
  checkins: {},
  interests: [],
  gs: {},
  mine: [],
  savedTips: [],
  reports: [],
  req: null,
  avatar: '',
  onboarded: false,
  assessment: null,
  weeklySpend: '',
  currency: 'NGN',
}
