import { Link } from 'react-router';

import { PageHeader } from '@/components/PageHeader';
import { documentPages } from '@/content/docs';
import { sidebar } from '@/content/navigation';
import { allExamples } from '@/content/examples';
import { usePageHead } from '@/lib/head';
import { exampleTitle } from '@/lib/search';

const site = [
  { label: 'Home', to: '/' },
  { label: 'Documentation', to: '/docs/' },
  { label: 'Download', to: '/download/' },
  { label: 'Examples', to: '/examples/' },
  { label: 'Playground', to: '/playground/' },
  { label: 'Use cases', to: '/use-cases/' },
  { label: 'Roadmap', to: '/roadmap/' },
  { label: 'Releases', to: '/releases/' },
  { label: 'Community', to: '/community/' },
  { label: 'Search', to: '/search/' },
];

export default function Sitemap() {
  usePageHead({
    title: 'Sitemap',
    description: 'Every page on the LZY website, in one list.',
    route: '/sitemap/',
  });

  const inSidebar = new Set(sidebar.flatMap((section) => section.items.map((item) => item.to)));
  const project = documentPages.filter((page) => !inSidebar.has(page.route));

  const groups = [
    { title: 'Website', items: site },
    ...sidebar.map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({ label: item.label, to: item.to })),
    })),
    {
      title: 'Project',
      items: project.map((page) => ({ label: page.title, to: page.route })),
    },
    {
      title: 'Examples',
      items: allExamples.map((example) => ({
        label: exampleTitle(example.slug),
        to: `/examples/${example.slug}/`,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader eyebrow="Sitemap" title="Every page" />
      <div className="mt-12 columns-1 gap-10 sm:columns-2 lg:columns-3">
        {groups.map((group) => (
          <section
            key={group.title}
            className="mb-10 break-inside-avoid"
            aria-labelledby={`map-${group.title}`}
          >
            <h2 id={`map-${group.title}`} className="font-display text-lg font-semibold text-fg">
              {group.title}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-fg-muted hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
