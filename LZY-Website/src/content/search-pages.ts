/**
 * Pages written in React, described for the search index. Kept next to the
 * content they describe, and loaded only when search is opened.
 */
import { channels } from './downloads';
import { notYetPossible } from './examples';
import { useCases } from './home';

export function staticSearchPages() {
  return [
    {
      route: '/',
      title: 'LZY — home',
      text: 'LZY programming language. Complex logic, simple code. Read it aloud. Why LZY: case-insensitive, indentation no braces, one number type, strict about types. Errors that teach. Install. Roadmap.',
    },
    {
      route: '/download/',
      title: 'Download',
      text:
        'Download LZY. Latest release wheel and source archive, SHA-256 checksums, verify download, platforms Windows macOS Linux, Python versions. ' +
        channels.map((channel) => `${channel.name}: ${channel.detail}`).join(' '),
    },
    {
      route: '/examples/',
      title: 'Examples',
      text:
        'Example programs you can run: beginner, algorithms, applications, defensive security. ' +
        notYetPossible.map((item) => `${item.topic}: ${item.reason}`).join(' '),
    },
    {
      route: '/playground/',
      title: 'Playground',
      text: 'Browser playground coming soon. Write LZY with syntax highlighting, start from an example, copy or download it, run it locally with lzy or the REPL. Why it does not run code in the browser yet: real isolation.',
    },
    {
      route: '/use-cases/',
      title: 'Use cases',
      text: useCases
        .map((useCase) => `${useCase.title}. ${useCase.summary} ${useCase.detail}`)
        .join(' '),
    },
    {
      route: '/community/',
      title: 'Community',
      text: 'GitHub Discussions, issues, pull requests, private security reports. Ways to help: design arguments, confusing error messages, course levels, tests and examples. Code of Conduct. Contributors.',
    },
    {
      route: '/roadmap/',
      title: 'Roadmap',
      text: 'Roadmap and timeline: language foundation, core language stable, error handling, formatter lzyfmt, linter lzylint, modules and standard library, files JSON HTTP applications, developer experience editor language server playground, bytecode virtual machine, packages, feature freeze, 1.0 stable. Explicitly not planned.',
    },
    {
      route: '/releases/',
      title: 'Releases',
      text: 'Every release, what was added, changed, fixed and secured, with downloads and checksums. Changelog. Semantic versioning.',
    },
    {
      route: '/docs/',
      title: 'Documentation',
      text: 'Documentation index: getting started, the course, language guide, tools, reference, development.',
    },
    {
      route: '/sitemap/',
      title: 'Sitemap',
      text: 'Every page on the website.',
    },
  ];
}
