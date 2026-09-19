/**
 * The shapes of data produced at build time by `plugins/`. Kept here, with no
 * imports from the plugins themselves, so the browser bundle never pulls in
 * build-time code.
 */
import type { ContentLayout } from './registry';

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

export type Segment = { kind: 'html'; html: string } | { kind: 'component'; name: string };

export interface PageMeta {
  route: string;
  source: string;
  layout: ContentLayout;
  title: string;
  description: string;
  before?: string;
}

export interface DocModule {
  route: string;
  source: string;
  title: string;
  description: string;
  headings: Heading[];
  segments: Segment[];
}

export interface SearchSection {
  id: string;
  heading: string;
  text: string;
}

export interface SearchDocument {
  route: string;
  title: string;
  sections: SearchSection[];
}

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

export interface ReleaseAsset {
  file: string;
  sha256: string;
  url: string;
}

export interface Release extends ChangelogEntry {
  name: string;
  latest: boolean;
  notesRoute: string | null;
  githubUrl: string;
  assets: ReleaseAsset[];
}
