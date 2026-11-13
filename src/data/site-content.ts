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
  brand: 'Elijah Burgess — Applied AI & Systems Engineering',
  siteUrl: 'https://www.eliburgessconsulting.com',
  email: 'elib@eliburgessconsulting.com',
  github: 'https://github.com/ElijahBurgess',
  location: 'Madison, WI · Remote / Hybrid',
  defaultTitle: 'Elijah Burgess — Applied AI Engineer, Multi-Agent Systems & Consulting',
  defaultDescription:
    'Applied AI and software engineer building multi-agent orchestration pipelines, local-first MCP retrieval infrastructure, and workflow automation in Madison, WI and remotely.',
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
  roleTitle: 'Applied AI & Multi-Agent Systems Engineer',
  availability: 'Open to AI-Focused Roles & Select Consulting',
  location: 'Madison, WI · Remote / Hybrid',
  headline:
    'Building production AI agents, local-first retrieval systems, and practical automation.',
  subhead:
    'I design and ship multi-agent LLM pipelines, fast MCP knowledge servers, and full-stack software in Python, Rust, and TypeScript. Actively seeking AI-leaning engineering, applied AI, and forward-deployed solutions roles.',
  primaryCta: {
    label: 'Hire / Get in Touch',
    href: '#contact',
    tier: 'AI Role / Hiring',
  },
  secondaryCta: { label: 'View Live AI Systems', href: '#projects' },
  pillars: [
    {
      label: 'Agentic Architecture',
      title: 'Multi-Model & MCP Tooling',
      detail: 'Tiered LLM orchestration, FastMCP servers, browser agents & quota guardrails.',
    },
    {
      label: 'Production Stack',
      title: 'Python · Rust · TypeScript',
      detail: 'FastAPI, React, Tauri v2, PyO3, ONNX, DuckDB, SQLite WAL & Linux infra.',
    },
    {
      label: 'Role Focus',
      title: 'Applied AI & Solutions',
      detail: 'AI Engineer, Agentic Workflow Engineer & Forward-Deployed / Technical Roles.',
    },
  ],
};

export const projectsContent: {
  sectionLabel: string;
  heading: string;
  items: ProjectEntry[];
} = {
  sectionLabel: '01 / AI Projects',
  heading: 'Shipped AI systems & live software',
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
        'Continuous hardware arbitrage valuation pipeline with spec normalization, rolling P20 price ceilings in SQLite WAL, and an interactive FastAPI deal explorer.',
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
        'Automated workflow daemon syncing Google Calendar events to Square invoices, webhook state reconciliation, and real-time client ledgers.',
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
  sectionLabel: '02 / Consulting & Coaching',
  heading: 'Available for contract builds, team advisory & coaching',
  items: [
    {
      id: 'consulting',
      tierValue: 'AI & Workflow Consulting',
      title: 'AI & Workflow Engineering',
      audience: 'For startups & operators',
      summary:
        'Custom multi-agent pipelines, private MCP integrations, and internal automations that eliminate manual admin without SaaS lock-in.',
      outcomes: [
        'LLM & multi-agent pipeline builds',
        'Private search, data & API automation',
        'Clean code & full ownership handoff',
      ],
    },
    {
      id: 'advisory',
      tierValue: 'AI Training & Advisory',
      title: 'Agentic Workflow Training',
      audience: 'For teams & builders',
      summary:
        'Hands-on pair-building and architecture scoping to help teams adopt modern coding agents, local toolchains, and reliable eval loops.',
      outcomes: [
        'Live pair-building on production repos',
        'Multi-agent & MCP workflow design',
        'Pragmatic build-vs-buy scoping',
      ],
    },
    {
      id: 'coaching',
      tierValue: '1-on-1 Coaching',
      title: '1-on-1 Execution Coaching',
      audience: 'For engineers & founders',
      summary:
        'Structured sessions combining Motivational Interviewing with practical workflow design to break bottlenecks and sustain deep focus.',
      outcomes: [
        'Focused 8- or 16-session roadmaps',
        'Sustainable execution & focus systems',
        'Tools tailored to how you actually work',
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
  sectionLabel: '03 / Bio & Achievements',
  heading: 'AI engineering backed by human-systems fluency',
  bioBoxLabel: 'Background',
  bioBoxTitle: 'Engineering & human systems',
  paragraph:
    'I’m Eli Burgess, an applied AI and software engineer in Madison, Wisconsin focused on multi-agent orchestration, fast local retrieval infrastructure, reinforcement learning engines, and practical workflow automation on Linux. Alongside hands-on engineering, I hold an M.S. in Management & Leadership, am completing my MSW at UW–Madison, and bring 3,000+ hours of 1-on-1 client and executive coaching—making me equally comfortable debugging Rust/Python systems and partnering directly with stakeholders to ship software people actually adopt.',
  facts: [
    {
      label: 'Languages & Frameworks',
      value: 'Python, Rust (PyO3), TypeScript, React, FastAPI, Tauri v2',
    },
    {
      label: 'AI & Data Systems',
      value: 'Multi-Agent LLMs, MCP, ONNX RL, DuckDB, Zoekt, SQLite',
    },
    {
      label: 'Education',
      value: 'M.S. Management & Leadership · MSW Candidate (UW–Madison)',
    },
    {
      label: 'Work & Location',
      value: 'Madison, WI · Open to Remote & Hybrid AI Roles',
    },
  ],
  achievementsLabel: 'Current Work',
  achievementsTitle: 'Selected AI & software achievements',
  achievements: [
    {
      title: 'Tiered Multi-Agent Orchestration',
      detail:
        'Built two-tier agent pipelines routing frontier reasoning models to fast coding/Playwright browser workers with automated PreToolUse model-quota guardrails.',
    },
    {
      title: 'Sub-10ms Local MCP Knowledge Hub',
      detail:
        'Engineered a FastMCP server uniting 65 Zoekt code shards (59 repos), offline docs, 80K+ DuckDB BM25 arXiv preprints, and BLAST+ genomics.',
    },
    {
      title: 'Rust + ONNX Reinforcement Learning',
      detail:
        'Built zero-copy Rust game simulations, self-play RL pipelines, and ONNX CPU inference bots deployed live at arena.eliburgessconsulting.com.',
    },
    {
      title: 'Automated Valuation & LLM Curation',
      detail:
        'Shipped continuous eBay hardware arbitrage scoring (SQLite WAL + FastAPI) and a 4-stage LLM structured-depth technical discovery funnel.',
    },
    {
      title: 'End-to-End Product & Leadership Execution',
      detail:
        'Shipped a 25 MB Tauri v2 desktop hub, self-hosted Proxmox/Cloudflare services, a Google Play Android app, and 3,000+ hours of 1-on-1 coaching.',
    },
  ],
};

export const contactContent = {
  sectionLabel: '04 / Hire & Contact',
  heading: 'Hiring for an AI-leaning role—or scoping a project?',
  subhead:
    'Reach out about full-time or contract AI engineering, applied AI, and technical solutions roles, or send a consulting/coaching note. I reply within one business day.',
  roleHighlights: [
    {
      label: 'Target Roles',
      value: 'Applied AI Engineer · Multi-Agent / Workflow Engineer · Forward-Deployed / Solutions',
    },
    {
      label: 'Availability',
      value: 'Full-Time, Contract & Select Consulting · Madison, WI or Remote',
    },
  ],
  topics: [
    'AI Role / Hiring',
    'AI & Workflow Consulting',
    'AI Training & Advisory',
    '1-on-1 Coaching',
  ],
};
