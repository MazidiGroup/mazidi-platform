/**
 * @mazidi/auth — runtime-neutral root.
 *
 * IMPORTANT: this barrel must NEVER re-export server, client or middleware
 * modules. Next.js compiles one module graph per runtime; a barrel that mixes
 * `next/headers` (server-only) with `"use client"` code poisons whichever
 * graph imports it. Import the entry that matches your runtime:
 *
 *   Server Components / Route Handlers →  @mazidi/auth/server
 *   Client Components                  →  @mazidi/auth/client
 *   Edge middleware                    →  @mazidi/auth/middleware
 */
export { ssoCookieOptions } from "./cookies";
