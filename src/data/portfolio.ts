type CaseSection = Readonly<{ title: string; body: string }>;

type CaseStudy = Readonly<{
  slug: string;
  kind: 'trading' | 'voice';
  company: string;
  role: string;
  dates: string;
  location: string;
  title: string;
  summary: string;
  tools: readonly string[];
  sections: readonly CaseSection[];
}>;

export const profile = {
  name: 'Denis Peralta',
  role: 'QA Engineer',
  location: 'Asunción, Paraguay',
  intro: 'I test web applications with Playwright, run functional and exploratory tests, and help improve voice assistants in Spanish and Portuguese.',
  linkedin: 'https://www.linkedin.com/in/denis-peralta/',
  repository: 'https://github.com/denisperalta/denisperalta.github.io',
} as const;

export const caseStudies = [
  {
    slug: 'trading-platform',
    kind: 'trading',
    company: 'Tieto',
    role: 'Automation QA',
    dates: 'Aug 2024–Present',
    location: 'Asunción, Paraguay',
    title: 'Testing a trading platform for financial advisors',
    summary: 'I designed and ran manual and automated functional tests for Leotrade, RBC’s trading platform for financial advisors.',
    tools: ['Playwright', 'Functional testing', 'Scrum'],
    sections: [
      {
        title: 'Responsibility',
        body: 'I created, organized, developed, and executed manual and automated functional tests for Leotrade. I used Playwright for the automated tests.',
      },
      {
        title: 'Risk and requirements',
        body: 'The functional risk I worked on was a gap between a user story’s intended behavior and the delivered feature. I collaborated with business analysts to understand application requirements and refine user stories in Scrum.',
      },
      {
        title: 'Testing method',
        body: 'I used the requirements and refined stories to inform what the functional tests covered. I worked across manual execution and Playwright automation so I could check delivered behavior in both ways.',
      },
      {
        title: 'Contribution',
        body: 'I demonstrated completed stories to stakeholders and ran separate technical demos with developers and business analysts to review implementation details.',
      },
    ],
  },
  {
    slug: 'bilingual-voice-assistant',
    kind: 'voice',
    company: 'Samsung',
    role: 'Software Tester / QA Tester',
    dates: 'Jun 2022–Jul 2024',
    location: 'Campinas, São Paulo',
    title: 'Quality for a bilingual voice assistant',
    summary: 'I tested Bixby in Spanish and Portuguese and used Python to analyze usage data for quality control.',
    tools: ['Voice QA', 'Python', 'Spanish / Portuguese'],
    sections: [
      {
        title: 'Responsibility',
        body: 'I created, organized, and ran functional and non-functional tests for Bixby in Spanish and Portuguese. That work included both manual and automated testing.',
      },
      {
        title: 'Risk and coverage',
        body: 'A voice assistant can respond differently to the same intent across languages. My remit covered both Spanish and Portuguese, as well as functional and non-functional behavior.',
      },
      {
        title: 'Testing method',
        body: 'I combined manual and automated execution with Python analysis of assistant usage data for quality control and improvements.',
      },
      {
        title: 'Contribution',
        body: 'I identified and proposed improvements to existing systems and took part in large-scale data training and validation for AI projects.',
      },
    ],
  },
] as const satisfies readonly CaseStudy[];

type FreelanceWork = Readonly<{
  company: string;
  role: string;
  dates: string;
  location: string;
  summary: string;
  url?: string;
}>;

export const freelance: readonly FreelanceWork[] = [
  {
    company: 'Evidência Logistica',
    role: 'Freelance Front-end Developer',
    dates: 'Nov 2022–Apr 2023',
    location: 'Remote',
    summary: 'I built the React interface for an automated reporting system and iterated on features based on client feedback.',
  },
  {
    company: 'Biofina',
    role: 'Freelance Full-stack Developer',
    dates: 'Apr–May 2023',
    location: 'Remote',
    summary: 'I built a React storefront and connected the product catalog to a CMS. I also worked on SEO and social media optimization.',
    url: 'https://master--incandescent-hummingbird-94d7da.netlify.app/',
  },
];

export const capabilities = [
  { title: 'Test design & execution', details: 'Test plans and cases, functional and exploratory testing, regression, defect reporting, BDD with Cucumber and Gherkin.' },
  { title: 'End-to-end automation', details: 'Playwright, Cypress, Selenium.' },
  { title: 'API & performance', details: 'Postman, Insomnia, JMeter.' },
  { title: 'CI & environments', details: 'GitHub Actions, Docker.' },
  { title: 'Data & web development', details: 'Python, JavaScript, React, Node.js, SQL and NoSQL.' },
  { title: 'Languages', details: 'Spanish and Portuguese (native), English (advanced C2).' },
] as const;

export const credentials = [
  { title: 'Certified Tester Foundation Level', issuer: 'BSTQB', year: '2024' },
  { title: 'Computer Engineer', issuer: 'Uninorte', year: '2014–2020' },
  { title: 'English proficiency, C2', issuer: 'EF SET', year: '2022' },
  { title: 'Recognition Award', issuer: 'Samsung', year: '2022' },
] as const;

export const voiceExamples = [
  { phrase: 'Pon un temporizador de cinco minutos.', language: 'Spanish', code: 'es', expected: 'Starts a five-minute timer.', observed: 'Starts a five-minute timer.' },
  { phrase: 'Defina um alarme para as sete da manhã.', language: 'Portuguese', code: 'pt', expected: 'Sets an alarm for 7:00 a.m.', observed: 'Asks for an alarm time again.' },
] as const;
