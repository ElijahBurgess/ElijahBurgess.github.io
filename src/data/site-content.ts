export interface NavItem {
  label: string;
  href: string;
}

export interface ProjectEntry {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  href: string;
  liveUrl?: string;
  liveLabel?: string;
  featured: boolean;
  statusEndpoint?: string;
}

export interface ServiceEntry {
  id: string;
  tierValue: string;
  title: string;
  audience: string;
  summary: string;
  outcomes: string[];
}

export interface BioFact {
  label: string;
  value: string;
}

export const siteMeta = {
  name: 'Elijah Burgess',
  shortName: 'Eli Burgess',
  brand: 'Elijah Burgess Consulting',
  siteUrl: 'https://www.eliburgessconsulting.com',
  email: 'elib@eliburgessconsulting.com',
  github: 'https://github.com/ElijahBurgess',
  location: 'Madison, WI · Remote',
  defaultTitle: 'Elijah Burgess — Applied AI Systems, Consulting & Coaching',
  defaultDescription:
    'Applied AI systems, workflow automation consulting, and 1-on-1 coaching by Elijah Burgess in Madison, WI and remotely.',
};

export const navItems: NavItem[] = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Services', href: '/#services' },
  { label: 'Bio', href: '/#bio' },
];

export const heroContent = {
  kicker: 'Madison, WI · Remote',
  headline: 'Applied AI systems, workflow automation, and 1-on-1 coaching.',
  subhead:
    'I build practical software that eliminates repetitive admin work—and partner directly with founders, teams, and individuals to turn good intentions into durable daily execution.',
  primaryCta: { label: 'Get in Touch', href: '#contact' },
  secondaryCta: { label: 'Explore AI Projects', href: '#projects' },
};

export const projectsContent: {
  sectionLabel: string;
  heading: string;
  items: ProjectEntry[];
} = {
  sectionLabel: '01 / AI Projects',
  heading: 'Live systems & shipped software',
  items: [
    {
      slug: 'boredgamer-arena',
      title: 'BoredGamer Arena',
      summary:
        'Multiplayer Kingdomino and Partnership Pinochle platform built with zero-copy Rust game engines, self-play reinforcement learning, and ONNX neural bots.',
      stack: ['Rust · PyO3', 'ONNX', 'WebSockets'],
      href: '/projects/boredgamer-arena',
      liveUrl: 'https://arena.eliburgessconsulting.com',
      liveLabel: 'Play Live Demo',
      featured: true,
      statusEndpoint: '/api/arena/status',
    },
    {
      slug: 'deal-hunter',
      title: 'Automated Deal Hunter',
      summary:
        'Continuous eBay hardware valuation pipeline with MSRP margin scoring, spec normalization, and an interactive browser deal explorer.',
      stack: ['Python', 'SQLite WAL', 'FastAPI'],
      href: '/projects/deal-hunter',
      liveUrl: '/projects/deal-hunter#explorer',
      liveLabel: 'Open Deal Explorer',
      featured: true,
      statusEndpoint: '/api/deal-hunter/summary',
    },
    {
      slug: 'research-hub',
      title: 'Local-First AI Research Hub',
      summary:
        'Private MCP knowledge server unifying sub-10ms Zoekt code search, offline documentation, and DuckDB genomic and arXiv indexes.',
      stack: ['MCP', 'DuckDB', 'Zoekt'],
      href: '/projects/research-hub',
      featured: false,
    },
    {
      slug: 'coaching-payment-tracker',
      title: 'Coaching Sync & Billing Pipeline',
      summary:
        'Automated operations service syncing Google Calendar sessions directly to Square invoices and real-time client ledgers.',
      stack: ['Python', 'Square API', 'SQLite'],
      href: '/projects/coaching-payment-tracker',
      featured: false,
    },
    {
      slug: 'toddler-touch-screen-lock',
      title: 'Toddler Touch Screen Lock',
      summary:
        'Published offline Android app using hardware-key unlock sequences and accessibility overlays to prevent accidental screen taps.',
      stack: ['Kotlin', 'Android', 'Google Play'],
      href: '/projects/toddler-touch-screen-lock',
      liveUrl:
        'https://play.google.com/store/apps/details?id=com.burgessmeditation.touchguard',
      liveLabel: 'Google Play',
      featured: false,
    },
  ],
};

export const servicesContent: {
  sectionLabel: string;
  heading: string;
  items: ServiceEntry[];
} = {
  sectionLabel: '02 / Services',
  heading: 'Consulting & coaching built for self-sufficiency',
  items: [
    {
      id: 'consulting',
      tierValue: 'AI & Workflow Consulting',
      title: 'AI & Workflow Consulting',
      audience: 'For small businesses & operators',
      summary:
        'Custom automations, private local-first AI tools, and clean internal pipelines that cut hours of manual admin without locking your data into bloated SaaS tiers.',
      outcomes: [
        'Scheduling, billing & intake automation',
        'Private local or cloud AI workflows',
        'Full code & documentation handoff',
      ],
    },
    {
      id: 'coaching',
      tierValue: '1-on-1 Coaching',
      title: '1-on-1 Coaching',
      audience: 'For founders, builders & professionals',
      summary:
        'Focused, pragmatic sessions combining Motivational Interviewing with structured habit design to break bottlenecks, build consistency, and untangle digital distractions.',
      outcomes: [
        'Focused 8- or 16-session roadmaps',
        'Durable work, study & focus habits',
        'Practical tools you own long term',
      ],
    },
    {
      id: 'advisory',
      tierValue: 'AI Training & Advisory',
      title: 'Agentic Workflow Training',
      audience: 'For individuals & technical teams',
      summary:
        'Hands-on pair-building and architecture scoping to adopt modern coding agents, research pipelines, and AI workflows without vendor hype.',
      outcomes: [
        'Live pair-building on your real tasks',
        'Multi-agent & prompt architecture',
        'Clear build-vs-buy technical scoping',
      ],
    },
  ],
};

export const bioContent: {
  sectionLabel: string;
  heading: string;
  paragraphs: string[];
  facts: BioFact[];
} = {
  sectionLabel: '03 / Bio',
  heading: 'Systems engineering grounded in human behavior.',
  paragraphs: [
    'I’m Eli Burgess—an AI systems builder, consultant, and coach based in Madison, Wisconsin.',
    'Before building multi-agent software and self-hosted Linux infrastructure, I spent over 3,000 hours coaching more than 150 clients one-on-one—including two years as a Master-Tier Coach at Healthy Gamer, where I trained in Motivational Interviewing, worked with clients ranging from university students to tech executives, and mentored incoming cohorts of coaches.',
    'I hold an M.S. in Management and Leadership from Western Governors University, degrees in Psychology and French with an Economics minor from Western Washington University, and I’m completing my MSW at UW–Madison alongside a decade-long meditation practice (150+ days in silent retreat). Whether I’m automating a business workflow or working one-on-one with a client, my goal is the same: strip away noise and build something practical that holds up in daily life.',
  ],
  facts: [
    { label: 'Coaching Experience', value: '3,000+ 1-on-1 hours · 150+ clients' },
    {
      label: 'Education',
      value: 'M.S. Management & Leadership · MSW Candidate (UW–Madison)',
    },
    {
      label: 'Technical Stack',
      value: 'Python, Rust, TypeScript, SQLite / DuckDB, Linux',
    },
    { label: 'Location & Languages', value: 'Madison, WI & Remote · English & French' },
  ],
};

export const contactContent = {
  sectionLabel: '04 / Contact',
  heading: 'Start a conversation',
  subhead:
    'Share briefly what you are building or working through. I read every inquiry personally and respond within one business day.',
  topics: [
    'AI & Workflow Consulting',
    '1-on-1 Coaching',
    'AI Training & Advisory',
    'General',
  ],
};
