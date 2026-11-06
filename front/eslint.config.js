import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // presentation と application から supabase-js を直接 import することを禁止する。
  // Supabase を呼ってよいのは infrastructure 層だけ（docs/api.md §1.1）。
  {
    files: ['src/presentation/**/*.{ts,tsx}', 'src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@supabase/supabase-js', message: 'Supabase は infrastructure 層からのみ使用してください（docs/api.md §1.1）。' }],
          patterns: [{ group: ['@supabase/*'], message: 'Supabase は infrastructure 層からのみ使用してください（docs/api.md §1.1）。' }],
        },
      ],
    },
  },
])
