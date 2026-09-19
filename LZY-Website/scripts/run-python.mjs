// Run a Python script with whichever interpreter this machine has.
//
// The website's data comes from the LZY interpreter, which is Python. macOS
// and most Linux distributions call it python3; Windows calls it python or
// py, and has a "python3" that only opens the Microsoft Store. PYTHON
// overrides the search, for a virtual environment or CI.
import { spawnSync } from 'node:child_process';

const [script, ...rest] = process.argv.slice(2);
if (!script) {
  console.error('usage: node scripts/run-python.mjs <script.py> [args...]');
  process.exit(2);
}

const candidates = process.env.PYTHON
  ? [process.env.PYTHON]
  : process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

// The Windows Store stub exits with 9009 without running anything.
const WINDOWS_NOT_FOUND = 9009;

for (const command of candidates) {
  const probe = spawnSync(command, ['-c', 'import sys; sys.exit(0)'], { stdio: 'ignore' });
  if (probe.error || probe.status === WINDOWS_NOT_FOUND || probe.status !== 0) continue;
  const result = spawnSync(command, [script, ...rest], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

console.error(
  'Could not find Python. LZY needs Python 3.9 or newer; set PYTHON to its path if it is installed.',
);
process.exit(1);
