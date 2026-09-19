import { useEffect, useState } from 'react';

import { site } from '@/data/site';

export interface RepoStats {
  stars: number;
  forks: number;
  openIssues: number;
}

const CACHE_KEY = 'lzy-github-stats';
const CACHE_MS = 60 * 60 * 1000;

let pending: Promise<RepoStats | null> | null = null;

function fetchStats(): Promise<RepoStats | null> {
  pending ??= (async () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { at, stats } = JSON.parse(cached) as { at: number; stats: RepoStats };
        if (Date.now() - at < CACHE_MS) return stats;
      }
    } catch {
      // A broken cache is not worth failing over.
    }
    try {
      const response = await fetch(`https://api.github.com/repos/${site.owner}/${site.repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) return null;
      const data = (await response.json()) as {
        stargazers_count: number;
        forks_count: number;
        open_issues_count: number;
      };
      const stats = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
      };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stats }));
      } catch {
        // Storage may be unavailable; the numbers are still shown this time.
      }
      return stats;
    } catch {
      return null;
    }
  })();
  return pending;
}

/**
 * Live stars and forks from the GitHub API.
 *
 * This is decoration. It is fetched after the page is interactive, cached for
 * an hour, and if GitHub is unreachable or rate-limits the request, nothing
 * is shown and nothing else is affected.
 */
export function useGitHubRepo(): RepoStats | null {
  const [stats, setStats] = useState<RepoStats | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchStats().then((result) => {
      if (alive) setStats(result);
    });
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}
