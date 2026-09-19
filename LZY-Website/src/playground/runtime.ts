/**
 * Where a browser playground would run LZY.
 *
 * There is no runtime yet, on purpose. SECURITY.md says the playground will
 * be built only once LZY code runs in real isolation, with the two open
 * hardening items (memory and run time) addressed first, because it is the
 * first place LZY would run code nobody has vetted.
 *
 * The page is built against this interface so a runtime can be plugged in
 * later without redesigning it. A likely shape: the real interpreter
 * compiled for the browser (for example with Pyodide, since LZY is pure
 * Python with no dependencies), running in a Web Worker that the page can
 * terminate when a program runs too long.
 */

export interface RunResult {
  /** Lines the program printed with `say`. */
  output: string[];
  /** The rendered LZY error, exactly as the command line would print it. */
  error: string | null;
  /** How long the program ran, in milliseconds. */
  durationMs: number;
}

export interface RunOptions {
  /** Answers for `ask`, one per call. */
  input: string[];
  /** Stop the program after this long. */
  timeoutMs: number;
}

export interface LzyRuntime {
  /** Whether programs can actually be run. */
  readonly available: boolean;
  /** Shown to the reader when `available` is false. */
  readonly unavailableReason: string;
  run(source: string, options: RunOptions): Promise<RunResult>;
}

/** The runtime used today: it runs nothing, and says why. */
export const unavailableRuntime: LzyRuntime = {
  available: false,
  unavailableReason:
    'Running LZY in the browser is not available yet. LZY will only run code on this site once it can do so in real isolation, as its security policy requires.',
  run() {
    return Promise.reject(new Error(this.unavailableReason));
  },
};

export function currentRuntime(): LzyRuntime {
  return unavailableRuntime;
}
