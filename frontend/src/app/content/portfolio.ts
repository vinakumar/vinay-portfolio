export interface ProjectLink {
  readonly label: string;
  readonly url: `https://${string}`;
}

export interface Project {
  readonly slug: string;
  readonly number: string;
  readonly title: string;
  readonly category: string;
  readonly employer: string;
  readonly period: string;
  readonly role: string;
  readonly summary: string;
  readonly context: string;
  readonly contributions: readonly string[];
  readonly focus: string;
  readonly technologies: readonly string[];
  readonly links: readonly ProjectLink[];
  readonly motif: 'platform' | 'network' | 'payments' | 'workflow';
}

export interface Experience {
  readonly employer: string;
  readonly role: string;
  readonly start: string;
  readonly end: string;
  readonly startLabel: string;
  readonly endLabel: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly technologies: readonly string[];
}

export const profile = {
  name: 'Vinay Kumar',
  role: 'Senior Software Engineer',
  location: 'Gurugram, India',
  email: 'vinaychauhan.22@outlook.com',
  linkedIn: 'https://www.linkedin.com/in/vinay-kumar-980395172/',
  description:
    'Senior Software Engineer working across .NET, APIs, distributed systems, and cloud applications. Explore the professional work and experience of Vinay Kumar.',
} as const;

export const emailHref = `mailto:${profile.email}`;
export const resumeRequestHref = `${emailHref}?subject=${encodeURIComponent('Request for your resume')}`;

export const projects: readonly Project[] = [
  {
    slug: 'enterprise-asset-management',
    number: '01',
    title: 'Enterprise asset management',
    category: 'Backend engineering',
    employer: 'Giesecke+Devrient',
    period: 'Feb 2026 - Present',
    role: 'Senior Software Engineer',
    summary:
      'Secure APIs, asynchronous messaging, and the practical work of supporting production.',
    context:
      'Backend development for an enterprise asset management system in the banking domain. This work brings together API development, secure access, asynchronous integration, and production support.',
    contributions: [
      'Developing a .NET 8 Web API backend and implementing JWT authentication with role-based access control and token-validation middleware.',
      'Integrating Azure Service Bus for asynchronous communication between backend services.',
      'Writing unit and integration tests with xUnit and Moq for core API endpoints.',
      'Deploying services on Azure App Services and Azure Functions, and working directly with clients to diagnose and resolve production issues.',
    ],
    focus:
      'Making backend changes with attention to secure access, test coverage, and the behavior of services in production.',
    technologies: [
      'C#',
      '.NET 8',
      'Web API',
      'JWT',
      'Azure Service Bus',
      'Azure App Services',
      'Azure Functions',
      'xUnit',
      'Moq',
    ],
    links: [],
    motif: 'platform',
  },
  {
    slug: 'ticketing-and-identity',
    number: '02',
    title: 'Ticketing and identity services',
    category: 'Distributed systems',
    employer: 'Ticketmaster',
    period: 'Jun 2024 - Feb 2026',
    role: 'Senior Engineer I',
    summary: 'Identity, event-driven services, and observability for a ticketing platform.',
    context:
      'Backend work across single sign-on, ticket management, and user account modules. The role also covered performance investigation, automated delivery, code review, and mentoring.',
    contributions: [
      'Developed REST APIs and .NET services for distributed, cloud-based systems, including ticket and user account modules.',
      'Implemented single sign-on with Duende IdentityServer and integrated compliance APIs.',
      'Used Kafka for event-driven data flows, and improved data access through SQL query tuning, LINQ, and async/await patterns.',
      'Integrated OpenTelemetry, Grafana, and Splunk; used K6 for performance testing and GitLab pipelines for automated testing and code scanning.',
      'Reviewed code and mentored junior engineers on .NET practices, debugging, and code quality.',
    ],
    focus:
      'Connecting identity, service integration, and production visibility while keeping changes reviewable and delivery repeatable.',
    technologies: [
      'C#',
      '.NET 8',
      'SQL Server',
      'Duende IdentityServer',
      'Kafka',
      'AWS',
      'Docker',
      'React',
      'OpenTelemetry',
      'Grafana',
      'Splunk',
      'K6',
      'GitLab CI/CD',
    ],
    links: [],
    motif: 'network',
  },
  {
    slug: 'utility-payments',
    number: '03',
    title: 'Utility payments and notifications',
    category: 'Application integration',
    employer: 'Smart Energy Water',
    period: 'Sep 2022 - Jun 2024',
    role: 'Product Engineer',
    summary:
      'Payment integrations, transaction workflows, and webhook-based notification tracking.',
    context:
      'A collection of related utility application assignments, covering payment modules, vendor integration, and notification workflows. These contributions span more than one application, rather than a single combined system.',
    contributions: [
      'Developed a payment module with a payment-provider integration and a notification system with webhook-based tracking.',
      'Managed transaction processing and vendor integrations in .NET and ASP.NET Web Forms applications.',
      'Implemented payment gateway integrations, automated schedulers, and prepaid and non-energy payment modules on a separate assignment.',
      'Used JWT authentication, reusable components, and Clean Code and SOLID principles in full-stack application development.',
    ],
    focus:
      'Working across application boundaries: connecting payment providers, following transaction workflows, and maintaining useful notification feedback.',
    technologies: [
      'C#',
      '.NET Core',
      'ASP.NET Web Forms',
      'Angular',
      'JavaScript',
      'jQuery',
      'SQL Server',
      'Azure',
      'JWT',
    ],
    links: [],
    motif: 'payments',
  },
  {
    slug: 'documents-and-automation',
    number: '04',
    title: 'Enterprise documents and automation',
    category: 'Full-stack development',
    employer: 'Capgemini',
    period: 'Jan 2020 - Sep 2022',
    role: 'Software Engineer',
    summary:
      'Document management, full-stack applications, and automation of repetitive workflows.',
    context:
      'Enterprise application development in a document management team, alongside workflow automation and production diagnosis. The work combined frontend/backend integration with data access and business process automation.',
    contributions: [
      'Developed document management modules for an enterprise content management application.',
      'Built full-stack applications with ASP.NET MVC, .NET Core, and SQL Server, including REST APIs for frontend/backend integration.',
      'Automated SAP workflows with UiPath bots to reduce repetitive manual work.',
      'Investigated production issues through root-cause analysis and collaborated with business teams on application delivery.',
    ],
    focus:
      'Understanding the underlying business workflow, connecting application layers, and removing repetitive steps through automation.',
    technologies: ['C#', '.NET', 'ASP.NET MVC', 'SQL Server', 'MongoDB', 'PostgreSQL', 'UiPath'],
    links: [],
    motif: 'workflow',
  },
];

export const experiences: readonly Experience[] = [
  {
    employer: 'Giesecke+Devrient',
    role: 'Senior Software Engineer',
    start: '2026-02',
    end: '',
    startLabel: 'Feb 2026',
    endLabel: 'Present',
    summary:
      'Building the backend of an enterprise asset management system, with a focus on secure APIs, asynchronous integration, and production support.',
    highlights: [
      'JWT authentication, role-based access, and API tests with xUnit and Moq.',
      'Azure messaging and cloud services, alongside direct client-facing production diagnosis.',
    ],
    technologies: ['.NET 8', 'Azure', 'Service Bus', 'xUnit'],
  },
  {
    employer: 'Ticketmaster',
    role: 'Senior Engineer I',
    start: '2024-06',
    end: '2026-02',
    startLabel: 'Jun 2024',
    endLabel: 'Feb 2026',
    summary:
      'Developed distributed backend services and worked across identity, ticket management, user accounts, and performance.',
    highlights: [
      'SSO with Duende IdentityServer, event-driven integration with Kafka, and SQL query tuning.',
      'Observability, automated delivery, code reviews, and mentoring junior engineers.',
    ],
    technologies: ['.NET', 'AWS', 'Kafka', 'OpenTelemetry'],
  },
  {
    employer: 'Smart Energy Water',
    role: 'Product Engineer',
    start: '2022-09',
    end: '2024-06',
    startLabel: 'Sep 2022',
    endLabel: 'Jun 2024',
    summary:
      'Developed enterprise web applications and utility payment workflows, connecting backend services with frontend experiences.',
    highlights: [
      'Payment gateway and vendor integrations, transaction processing, and webhook tracking.',
      'Reusable components, automated schedulers, and application security with JWT.',
    ],
    technologies: ['.NET Core', 'Angular', 'SQL Server', 'Azure'],
  },
  {
    employer: 'Capgemini',
    role: 'Software Engineer',
    start: '2020-01',
    end: '2022-09',
    startLabel: 'Jan 2020',
    endLabel: 'Sep 2022',
    summary:
      'Built full-stack applications and document management modules, and automated repetitive business workflows.',
    highlights: [
      'ASP.NET MVC and REST APIs for frontend/backend integration.',
      'UiPath workflow automation and production issue resolution through root-cause analysis.',
    ],
    technologies: ['ASP.NET MVC', 'REST APIs', 'SQL Server', 'UiPath'],
  },
];

export const skillGroups = [
  {
    title: 'Backend & APIs',
    description: 'Services and the contracts that connect them.',
    skills: ['C#', '.NET Core', 'ASP.NET MVC', 'Web API', 'Entity Framework Core', 'Dapper'],
  },
  {
    title: 'Data & messaging',
    description: 'Data access, integration, and asynchronous flows.',
    skills: ['SQL Server', 'PostgreSQL', 'MongoDB', 'LINQ', 'Kafka', 'Azure Service Bus'],
  },
  {
    title: 'Cloud & delivery',
    description: 'From a reviewed change to a running application.',
    skills: [
      'AWS',
      'Azure App Services',
      'Azure Functions',
      'Docker',
      'GitLab CI/CD',
      'Azure DevOps',
    ],
  },
  {
    title: 'Frontend',
    description: 'The application on the other side of the API.',
    skills: ['Angular 16/18', 'React', 'TypeScript', 'JavaScript', 'HTML & CSS', 'jQuery'],
  },
  {
    title: 'Quality & observability',
    description: 'Tests before release. Useful signals after it.',
    skills: ['xUnit', 'NUnit', 'Moq', 'K6', 'OpenTelemetry', 'Grafana', 'Splunk'],
  },
  {
    title: 'Engineering practice',
    description: 'Readable code and deliberate problem-solving.',
    skills: [
      'SOLID',
      'Design patterns',
      'Dependency injection',
      'JWT & SSO',
      'Root-cause analysis',
    ],
  },
] as const;

export const qualifications = [
  {
    degree: 'Master of Computer Applications',
    shortName: 'MCA',
    institution: 'Graphic Era University',
    year: '2025',
  },
  {
    degree: 'Bachelor of Computer Applications',
    shortName: 'BCA',
    institution: 'Graphic Era University',
    year: '2019',
  },
] as const;

export const certifications = [
  'Microsoft Azure Fundamentals (AZ-900)',
  'RPA Developer Foundation',
  'Agile Software Development',
  '.NET Full Stack Training - Capgemini',
] as const;

export function findProject(slug: string | null): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
