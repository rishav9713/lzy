/// <reference types="vite/client" />

declare const __SITE_URL__: string;
declare const __REPOSITORY__: string;

interface Window {
  __lzyReady?: boolean;
}

declare module 'virtual:lzy-pages' {
  import type { PageMeta, DocModule } from '@/content/types';
  export const pages: PageMeta[];
  export const loaders: Record<string, () => Promise<{ default: DocModule }>>;
}

declare module 'virtual:lzy-search' {
  import type { SearchDocument } from '@/content/types';
  const documents: SearchDocument[];
  export default documents;
}

declare module 'virtual:lzy-roadmap' {
  import type { Roadmap } from '@/content/types';
  const roadmap: Roadmap;
  export default roadmap;
}

declare module 'virtual:lzy-releases' {
  import type { Release, ChangelogEntry } from '@/content/types';
  export const releases: Release[];
  export const unreleased: ChangelogEntry | null;
}
