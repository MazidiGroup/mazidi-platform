/**
 * Minimal ambient typing for `process.env` so @mazidi/config compiles inside
 * browser-only consumers (e.g. @mazidi/ui) that deliberately have no
 * @types/node.
 *
 * Merge-safe by construction: the namespace members and the `var` declaration
 * are textually identical to @types/node's, so in consumers that DO have node
 * types (apps, @mazidi/api, @mazidi/auth) these declarations merge instead of
 * conflicting. Do not add Node APIs here — `process.env` is all config needs,
 * and the literal `process.env.NEXT_PUBLIC_*` access pattern is required for
 * Next.js build-time inlining into client bundles.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}
declare var process: NodeJS.Process;
