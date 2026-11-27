type Risk = Readonly<{
  id: string;
  priority: 'High' | 'Medium';
  risk: string;
  requirement: string;
  evidence: string;
}>;

export const risks = [
  { id: 'PAGES-01', priority: 'High', risk: 'Direct links or assets fail on Pages.', requirement: 'Home, both cases, and Site QA load directly and on refresh. Assets resolve at root and under a path prefix. Unknown URLs return 404.', evidence: 'Playwright navigation and network assertions on both builds.' },
  { id: 'A11Y-01', priority: 'High', risk: 'Keyboard users lose access or focus.', requirement: 'The skip link and critical navigation work by keyboard, and focus is visible.', evidence: 'Playwright keyboard checks and axe scans on the home page and both cases.' },
  { id: 'MOTION-01', priority: 'High', risk: 'Motion obscures work or makes it inaccessible.', requirement: 'Cases appear in sequence on desktop. Reduced motion disables pinning, and case links work with JavaScript disabled.', evidence: 'Playwright scroll, media preference, and script-free checks.' },
  { id: 'RESP-01', priority: 'High', risk: 'Navigation or CTAs overflow on small screens.', requirement: 'Navigation fits at 699, 700, and 701 CSS pixels, and works in representative mobile browsers.', evidence: 'Playwright viewport boundary and mobile device checks.' },
  { id: 'NAV-01', priority: 'Medium', risk: 'Visitors cannot move between work and contact.', requirement: 'Both hero actions lead to their sections. Case navigation preserves browser Back.', evidence: 'Playwright recruiter journey across browser projects.' },
  { id: 'ASSET-01', priority: 'High', risk: 'A private résumé becomes public.', requirement: 'Only an approved public résumé can be linked and served.', evidence: 'Playwright checks for a download link, the legacy URL, and PDF files in the build.' },
] as const satisfies readonly Risk[];
