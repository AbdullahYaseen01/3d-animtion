import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Vercel runs /api as native Node ESM (package.json "type": "module"), which cannot resolve
 * extensionless or directory imports. Every relative import reachable from /api must name a .js file.
 */
describe('server import graph', () => {
  it('uses explicit .js relative imports that resolve to real files', () => {
    const seen = new Set<string>()
    const problems: string[] = []
    const queue = readdirSync('api').map((f) => path.resolve('api', f))
    while (queue.length) {
      const file = queue.pop()!
      if (seen.has(file)) continue
      seen.add(file)
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(/(?:import|export)\s+(type\s+)?[^'"]*?from\s+['"](\.[^'"]+)['"]/g)) {
        const [, typeOnly, spec] = m
        if (typeOnly) continue
        if (!spec.endsWith('.js')) {
          problems.push(`${path.relative('.', file)} -> ${spec}`)
          continue
        }
        const target = path.resolve(path.dirname(file), spec.replace(/\.js$/, '.ts'))
        if (!existsSync(target)) problems.push(`${path.relative('.', file)} -> ${spec} (missing)`)
        else queue.push(target)
      }
    }
    expect(problems).toEqual([])
    expect(seen.size).toBeGreaterThan(10)
  })
})
