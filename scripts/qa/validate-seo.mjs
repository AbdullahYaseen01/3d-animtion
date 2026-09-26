/**
 * Runs the structured-data and on-page SEO assertions.
 * Usage: node scripts/qa/validate-seo.mjs
 */
import { spawnSync } from 'node:child_process'

const result = spawnSync('npx', ['vitest', 'run', 'tests/seo.test.ts', 'tests/seo-render.test.ts'], {
  stdio: 'inherit',
  shell: true,
})
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1)

const crawl = spawnSync(process.execPath, ['scripts/qa/crawl.mjs'], { stdio: 'inherit' })
process.exit(crawl.status ?? 1)
