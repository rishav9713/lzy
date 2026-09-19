/**
 * Facts about getting LZY that are not in the release notes themselves.
 */

/**
 * Known problems with a release, shown next to it on the download and
 * releases pages. From CHANGELOG.md: 0.0.2 exists because 0.0.1 could crash.
 */
export const releaseAdvisories: Record<string, string> = {
  '0.0.1':
    'Do not use this release on Windows with Python 3.9 or 3.10: a deep expression can crash the interpreter process. 0.0.2 fixes it and changes nothing else.',
};

export interface Channel {
  name: string;
  status: 'available' | 'not-yet';
  detail: string;
}

/** Every way someone might expect to get LZY, and whether it exists. */
export const channels: Channel[] = [
  {
    name: 'GitHub Releases',
    status: 'available',
    detail: 'A wheel and a source archive for every version, with SHA-256 checksums.',
  },
  {
    name: 'From source',
    status: 'available',
    detail: 'Clone the repository and install it with pip, or run it with python -m lzy.',
  },
  {
    name: 'PyPI (pip install lzy-lang)',
    status: 'not-yet',
    detail:
      'LZY is not published on PyPI. A package with a similar name there is not this project.',
  },
  {
    name: 'Homebrew, winget, apt and other package managers',
    status: 'not-yet',
    detail: 'Not available.',
  },
  {
    name: 'Docker image',
    status: 'not-yet',
    detail: 'Not available. LZY needs only Python, so any Python image can install the wheel.',
  },
  {
    name: 'Standalone executable',
    status: 'not-yet',
    detail: 'Not available. LZY runs on the Python interpreter you already have.',
  },
];
