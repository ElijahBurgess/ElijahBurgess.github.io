export interface NavItem {
  label: string;
  href: string;
}

export interface HeroPillar {
  label: string;
  title: string;
  detail: string;
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

export interface BioAchievement {
  title: string;
  detail: string;
}

export const siteMeta = {
  name: 'Elijah Burgess',
  shortName: 'Eli Burgess',
  brand: 'Elijah Burgess Consulting',
  siteUrl: 'https://www.eliburgessconsulting.com',
  email: 'elib@eliburgessconsulting.com',
  linkedin: 'https://www.linkedin.com/in/elijah-burgess',
  github: 'https://github.com/ElijahBurgess',
  location: 'Madison, WI · Remote Nationwide',
  defaultTitle: 'Elijah Burgess — AI Consulting, Workflow Automation & 1-on-1 Coaching',
  defaultDescription:
    'Practical AI consulting, custom workflow automation, and 1-on-1 AI training and coaching for businesses and individuals in Madison, WI and remotely.',
};

export const navItems: NavItem[] = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Services', href: '/#services' },
  { label: 'Bio', href: '/#bio' },
];

export const heroContent: {
  roleTitle: string;
  availability: string;
  location: string;
  headline: string;
  subhead: string;
  primaryCta: { label: string; href: string; tier: string };
  secondaryCta: { label: string; href: string };
  pillars: HeroPillar[];
} = {
  roleTitle: 'AI & Workflow Consultant · Systems Builder',
  availability: 'Taking Business & Individual Clients',
  location: 'Madison, WI · Serving Clients Remotely & Locally',
  headline:
    'Practical AI consulting, custom automation, and hands-on workflow training.',
  subhead:
    'I partner with businesses, teams, and individuals to pinpoint where manual workflows break down—then build governed AI tools, clean automations, and durable habits that save hours every week without SaaS bloat.',
  primaryCta: {
    label: 'Book a Consult',
    href: '#contact',
    tier: 'Business AI Consulting',
  },
  secondaryCta: { label: 'Explore Live AI Projects', href: '#projects' },
  pillars: [
    {
      label: 'For Businesses & Teams',
      title: 'Custom AI & Ops Automation',
      detail:
        'Replace spreadsheet bottlenecks and repetitive admin with reliable Python, API, and governed LLM pipelines.',
    },
    {
      label: 'For Individuals',
      title: '1-on-1 AI Setup & Coaching',
      detail:
        'Adopt modern AI agents, set up private workflows around your real tasks, and build consistent execution.',
    },
    {
      label: 'How I Build',
      title: 'Governed, Practical & Owned',
      detail:
        'Human-in-the-loop guardrails, clear documentation, and full handoff—no vendor hype or lock-in.',
    },
  ],
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
      title: 'BoredGamer Arena (RL + Rust)',
      summary:
        'Multiplayer strategy arena powered by zero-copy Rust game engines, self-play reinforcement learning, IS-MCTS search, and ONNX neural bots over WebSockets.',
      stack: ['Rust · PyO3', 'ONNX RL', 'WebSockets'],
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
        'Dockerized OAuth 2.0 eBay valuation pipeline with hardware-compatibility rules, rolling price ceilings in SQLite WAL, and an interactive FastAPI explorer.',
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
        'Private FastMCP retrieval server unifying sub-10ms Zoekt code search across 59 repos with 80K+ DuckDB BM25 arXiv papers and BLAST+ genomics.',
      stack: ['FastMCP', 'DuckDB BM25', 'Zoekt'],
      href: '/projects/research-hub',
      featured: false,
      statusEndpoint: '/api/research/status',
    },
    {
      slug: 'coaching-payment-tracker',
      title: 'Operations & Billing Sync',
      summary:
        'Automated business operations daemon syncing Google Calendar client sessions directly to Square invoices, webhook reconciliation, and live ledgers.',
      stack: ['Python', 'Square API', 'Webhooks'],
      href: '/projects/coaching-payment-tracker',
      featured: false,
    },
    {
      slug: 'toddler-touch-screen-lock',
      title: 'Toddler Touch Screen Lock',
      summary:
        'Published offline Android utility using hardware-key unlock sequences and accessibility overlays to block accidental screen input.',
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
  heading: 'AI consulting & coaching for businesses and individuals',
  items: [
    {
      id: 'consulting',
      tierValue: 'Business AI Consulting',
      title: 'Business AI & Automation',
      audience: 'For small businesses, nonprofits & teams',
      summary:
        'Hands-on workflow audits followed by custom automations, API integrations, and governed AI tools that cut hours of manual admin.',
      outcomes: [
        'Billing, scheduling & document automation',
        'Governed AI extraction & QA pipelines',
        'Full code, SOPs & team training handoff',
      ],
    },
    {
      id: 'advisory',
      tierValue: 'Individual AI Training',
      title: 'Personal AI Setup & Training',
      audience: 'For individuals, founders & researchers',
      summary:
        '1-on-1 pair-building to set up modern AI agents, custom dashboards, and private local or cloud workflows tailored to your daily work.',
      outcomes: [
        'Live pair-building on your actual tasks',
        'Claude, Gemini & agentic workflow setup',
        'Practical tools you own without bloat',
      ],
    },
    {
      id: 'coaching',
      tierValue: '1-on-1 Coaching',
      title: '1-on-1 Execution Coaching',
      audience: 'For professionals, builders & leaders',
      summary:
        'Focused 1-on-1 coaching combining Motivational Interviewing with structured workflow design to clear bottlenecks and sustain momentum.',
      outcomes: [
        'Structured 8- or 16-session roadmaps',
        'Durable focus, planning & execution habits',
        'Tools designed for long-term self-reliance',
      ],
    },
  ],
};

export const bioContent: {
  sectionLabel: string;
  heading: string;
  bioBoxLabel: string;
  bioBoxTitle: string;
  paragraph: string;
  facts: BioFact[];
  achievementsLabel: string;
  achievementsTitle: string;
  achievements: BioAchievement[];
} = {
  sectionLabel: '03 / Bio & Track Record',
  heading: 'Software delivery grounded in real-world operations',
  bioBoxLabel: 'About Eli',
  bioBoxTitle: 'AI builder, operator & coach',
  paragraph:
    'I’m Eli Burgess, an independent AI consultant, software builder, and coach based in Madison, Wisconsin. Over seven years running my own practice alongside custom engineering, I’ve specialized in sitting down with business owners, researchers, and individuals to find where manual workflows break down—and building governed Python, React, Rust, and AI tools that fix the bottleneck. I hold an M.S. in Management & Leadership (WGU) and serve as Board Co-Treasurer for a Madison nonprofit.',
  facts: [
    {
      label: 'Engineering Stack',
      value: 'Python, TypeScript, React, Rust (Tauri / PyO3), SQL, FastAPI, Linux',
    },
    {
      label: 'AI & Governance',
      value: 'Claude, Gemini, FastMCP, Maker-Checker QA & Human-in-the-Loop',
    },
    {
      label: 'Leadership & Education',
      value: 'M.S. Management & Leadership (WGU) · ADKAR Change Adoption',
    },
    {
      label: 'Client Track Record',
      value: '7+ years · 150+ clients coached & trained across 15+ countries',
    },
  ],
  achievementsLabel: 'Recent Builds',
  achievementsTitle: 'Selected AI & software highlights',
  achievements: [
    {
      title: 'FinDash & Maker-Checker AI Auditing',
      detail:
        'Built an 8-endpoint Plaid financial analytics suite paired with segregated Maker-Checker AI verification to audit contract and fee-waiver terms.',
    },
    {
      title: 'Research Lab QA & Sub-10ms MCP Hub',
      detail:
        'Shipped automated viral genomics QA + PCRDash for a UW–Madison researcher, plus a FastMCP server indexing 59 code repos and 80K+ arXiv papers.',
    },
    {
      title: 'Rust + ONNX Reinforcement Learning',
      detail:
        'Engineered zero-copy Rust game engines, self-play RL pipelines, and ONNX neural bots serving live multiplayer games at arena.eliburgessconsulting.com.',
    },
    {
      title: 'Zero-Trust Agent Cluster & DashManager',
      detail:
        'Architected a firewall-isolated 24/7 Proxmox/OPNsense AI agent cluster monitored by a lightweight 25 MB Rust/Tauri desktop command deck.',
    },
    {
      title: 'Published Mobile, Web & Ops Software',
      detail:
        'Shipped Google Play (Kotlin) and Chrome Web Store apps (NightMap, TouchGuard), adaptive eBay valuation, and automated Calendar-to-Square billing.',
    },
  ],
};

export const contactContent = {
  sectionLabel: '04 / Contact',
  heading: 'Tell me what you want to automate or build',
  subhead:
    'Whether you want to eliminate manual admin in your business or get 1-on-1 help adopting AI workflows for yourself, send a short note. I read every inquiry personally and reply within one business day.',
  roleHighlights: [
    {
      label: 'Who I Work With',
      value: 'Small & Midsize Businesses · Nonprofits · Research Teams · Individuals',
    },
    {
      label: 'Engagement Formats',
      value: 'Custom Workflow Builds · AI Readiness Audits · 1-on-1 Training & Coaching',
    },
  ],
  topics: [
    'Business AI Consulting',
    'Individual AI Training',
    '1-on-1 Coaching',
    'General Inquiry',
  ],
};
