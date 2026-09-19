/**
 * Structured data read out of ROADMAP.md, CHANGELOG.md and the release notes.
 *
 * The roadmap timeline and the releases page are drawn from these, so that
 * the website can never announce a version, a date or a checksum that the
 * repository does not.
 */
import type { Token, Tokens } from 'marked';

type Fragments = {
  inline: (markdown: string) => string;
  block: (markdown: string) => string;
  lexer: (markdown: string) => Token[];
};

export interface LeadItem {
  lead: string;
  html: string;
}

export interface RoadmapVersion {
  version: string;
  title: string;
  id: string;
  markedDone: boolean;
  goal: string;
  shipsWhen: string;
  notes: string[];
  items: LeadItem[];
  checklist: Array<{ html: string; done: boolean }>;
}

export interface Roadmap {
  intro: string[];
  principles: LeadItem[];
  versions: RoadmapVersion[];
  notPlanned: LeadItem[];
}

const VERSION_HEADING = /^(\d+\.\d+\.\d+)\s+[—-]\s+(.+?)(\s+✅.*)?$/;

/** Split "**Lead.** the rest" into its two parts. */
function splitLead(markdown: string, fragments: Fragments): LeadItem {
  const match = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(markdown.trim());
  if (!match) return { lead: '', html: fragments.inline(markdown.trim()) };
  return { lead: fragments.inline(match[1]!), html: fragments.inline(match[2]!.trim()) };
}

export function parseRoadmap(source: string, fragments: Fragments): Roadmap {
  const roadmap: Roadmap = { intro: [], principles: [], versions: [], notPlanned: [] };
  let section: 'intro' | 'principles' | 'version' | 'not-planned' | 'other' = 'intro';
  let version: RoadmapVersion | null = null;

  for (const token of fragments.lexer(source)) {
    if (token.type === 'heading' && token.depth === 1) continue;

    if (token.type === 'heading' && token.depth === 2) {
      const heading = token.text.trim();
      const match = VERSION_HEADING.exec(heading);
      if (match) {
        version = {
          version: match[1]!,
          title: match[2]!.replace(/\*/g, '').trim(),
          id: `v${match[1]!.replace(/\./g, '-')}`,
          markedDone: Boolean(match[3]),
          goal: '',
          shipsWhen: '',
          notes: [],
          items: [],
          checklist: [],
        };
        roadmap.versions.push(version);
        section = 'version';
      } else if (/^principles$/i.test(heading)) {
        section = 'principles';
      } else if (/not planned/i.test(heading)) {
        section = 'not-planned';
      } else {
        section = 'other';
      }
      continue;
    }

    if (token.type === 'paragraph') {
      const text = token.text.trim();
      if (section === 'intro') roadmap.intro.push(fragments.inline(text));
      else if (section === 'principles') {
        // Only "**Rule.** explanation" paragraphs are principles; the
        // sentence introducing them is not.
        const principle = splitLead(text, fragments);
        if (principle.lead) roadmap.principles.push(principle);
      } else if (section === 'version' && version) {
        const goal = /^\*\*The goal:\*\*\s*([\s\S]*)$/.exec(text);
        const ships = /^\*\*Ships when:\*\*\s*([\s\S]*)$/.exec(text);
        if (goal) version.goal = fragments.inline(goal[1]!);
        else if (ships) version.shipsWhen = fragments.inline(ships[1]!);
        else version.notes.push(fragments.inline(text));
      }
      continue;
    }

    if (token.type === 'list') {
      for (const item of (token as Tokens.List).items) {
        const text = item.text.replace(/^\[[ xX]\]\s*/, '').trim();
        if (section === 'version' && version) {
          if (item.task)
            version.checklist.push({ html: fragments.inline(text), done: !!item.checked });
          else version.items.push(splitLead(text, fragments));
        } else if (section === 'not-planned') {
          roadmap.notPlanned.push(splitLead(text, fragments));
        }
      }
    }
  }
  return roadmap;
}

export interface ChangeGroup {
  name: string;
  blocks: string[];
  count: number;
}

export interface ChangelogEntry {
  version: string;
  date: string | null;
  summary: string[];
  groups: ChangeGroup[];
}

export function parseChangelog(source: string, fragments: Fragments): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let entry: ChangelogEntry | null = null;
  let group: ChangeGroup | null = null;

  for (const token of fragments.lexer(source)) {
    if (token.type === 'heading' && token.depth === 2) {
      const match = /^\[(.+?)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/.exec(token.text.trim());
      entry = match
        ? { version: match[1]!, date: match[2] ?? null, summary: [], groups: [] }
        : null;
      if (entry) entries.push(entry);
      group = null;
      continue;
    }
    if (!entry) continue;

    if (token.type === 'heading' && token.depth === 3) {
      group = { name: token.text.trim(), blocks: [], count: 0 };
      entry.groups.push(group);
      continue;
    }
    if (token.type === 'space' || token.type === 'def') continue;

    if (!group) {
      if (token.type === 'paragraph') entry.summary.push(fragments.inline(token.text));
      continue;
    }
    if (token.type === 'list') group.count += (token as Tokens.List).items.length;
    group.blocks.push(fragments.block(token.raw));
  }
  return entries;
}

export interface ReleaseAsset {
  file: string;
  sha256: string;
}

export interface ReleaseNotes {
  version: string;
  name: string;
  assets: ReleaseAsset[];
}

export function parseReleaseNotes(version: string, source: string): ReleaseNotes {
  const title = /^#\s+(.+)$/m.exec(source)?.[1] ?? `LZY ${version}`;
  const name =
    title
      .split(/\s+[—-]\s+/)
      .slice(1)
      .join(' — ') || title;
  const assets: ReleaseAsset[] = [];
  for (const match of source.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|/gm)) {
    assets.push({ file: match[1]!, sha256: match[2]! });
  }
  return { version, name, assets };
}

/** Compare two dotted version numbers, newest first. */
export function compareVersionsDescending(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (right[index] ?? 0) - (left[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}
