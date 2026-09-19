import roadmap from 'virtual:lzy-roadmap';
import { releases } from 'virtual:lzy-releases';

import type { RoadmapVersion } from '@/content/types';

export type MilestoneState = 'done' | 'next' | 'planned';

export interface Milestone {
  version: string;
  title: string;
  state: MilestoneState;
  /** Present when the version is in ROADMAP.md; absent for patch releases. */
  plan?: RoadmapVersion;
  releasedOn?: string | null;
}

function compare(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

/**
 * The roadmap's versions merged with the versions actually released. A
 * version counts as done only if it was released (it is in CHANGELOG.md), so
 * the timeline cannot run ahead of the project.
 */
export function milestones(): Milestone[] {
  const released = new Map(releases.map((release) => [release.version, release]));
  const all = new Map<string, Milestone>();

  for (const plan of roadmap.versions) {
    all.set(plan.version, {
      version: plan.version,
      title: plan.title,
      state: released.has(plan.version) ? 'done' : 'planned',
      plan,
      releasedOn: released.get(plan.version)?.date ?? null,
    });
  }
  for (const release of releases) {
    if (!all.has(release.version)) {
      all.set(release.version, {
        version: release.version,
        title: release.name || 'Release',
        state: 'done',
        releasedOn: release.date,
      });
    }
  }

  const ordered = [...all.values()].sort((a, b) => compare(a.version, b.version));
  const next = ordered.find((milestone) => milestone.state !== 'done');
  if (next) next.state = 'next';
  return ordered;
}

export { roadmap };
