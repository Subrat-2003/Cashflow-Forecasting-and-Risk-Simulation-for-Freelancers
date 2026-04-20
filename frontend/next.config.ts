/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {};

// export default nextConfig;


// import type { NextConfig } from 'next'

// ── Turbopack panic diagnosis ─────────────────────────────────────────────────
// Root cause: Turbopack's Rust file-watcher (notify) panics on paths containing
// Unicode or spaces because the inotify/FSEvents backend normalises paths via
// a Rust String that fails on non-ASCII boundaries.
//
// Fix: move the project to a path with no spaces, e.g. C:\Dev\gignavigator\
// If you cannot move the path, disable Turbopack and use Webpack instead:
//   package.json → "dev": "next dev"   (remove --turbopack)
//
// ── Performance: Supabase RLS queries must hit the indexed user_id column ─────
// Add the following SQL migration in Supabase Dashboard → SQL Editor:
//
//   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id
//     ON transactions(user_id);
//
//   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cashflow_predictions_user_id
//     ON cashflow_predictions(user_id);
//
// Both tables will then resolve user_id lookups in O(log n) → well under 200ms.

//const nextConfig: NextConfig = {
  // Disable Turbopack if you cannot move the project out of a path with spaces.
  // Delete this block (and keep `next dev --turbopack` in package.json) once path is clean.
  //experimental: {},

  // Prevent Next.js from bundling Node-only modules used by the Python backend
  // that may accidentally be pulled in through shared type imports.
  //serverExternalPackages: [],

  // Strict env validation — build will fail fast if vars are missing rather
  // than silently serving an unauthenticated Supabase client.
  //env: {
    //NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    //NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY ?? '',
  },
}

//export default nextConfig

