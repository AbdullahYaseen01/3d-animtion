import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'qa-output', 'docs', 'node_modules', '.vercel'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Classic hook rules only: the compiler-oriented `refs` / `set-state-in-effect` rules flag the
      // intentional post-hydration localStorage reads and hooks that return refs alongside state.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['server/**/*.ts', 'api/**/*.ts', 'tests/**/*.ts', 'vite.config.ts', 'scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.node, ...globals.browser } },
  },
)
