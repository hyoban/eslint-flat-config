import { defu } from 'defu'
import gitignore from 'eslint-config-flat-gitignore'
import type { FlatESLintConfig } from 'eslint-define-config'
import globals from 'globals'

type ESLintFlatConfig = FlatESLintConfig & {
  name?: string
}

const DEFAULT_GLOB_SRC = '**/*.?([cm])[jt]s?(x)'

const GLOB_EXCLUDE = [
  '**/node_modules',
  '**/dist',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/bun.lockb',

  '**/output',
  '**/coverage',
  '**/temp',
  '**/.temp',
  '**/tmp',
  '**/.tmp',
  '**/.history',
  '**/.vitepress/cache',
  '**/.nuxt',
  '**/.next',
  '**/.vercel',
  '**/.changeset',
  '**/.idea',
  '**/.cache',
  '**/.output',
  '**/.vite-inspect',

  '**/CHANGELOG*.md',
  '**/*.min.*',
  '**/LICENSE*',
  '**/__snapshots__',
  '**/auto-import?(s).d.ts',
  '**/components.d.ts',
]

const DEFAULT_IGNORE_FILES = [
  '.gitignore',
  '.eslintignore',
]

export type ConfigOptions = {
  files?: string[]
  ignores?: string[]
  ignoreFiles?: string[]
  configName?: Record<Exclude<keyof PluginInfo, 'pluginName'>, boolean>
}

function pluginIs(config: ESLintFlatConfig, name: string): boolean {
  const pluginNames = Object.keys(config.plugins ?? {})
  if (
    (pluginNames.length === 1 && pluginNames[0] === name)
    || (pluginNames.length > 1 && pluginNames.every(n => n.startsWith(name)))
  )
    return true
  return false
}

type PluginInfo = {
  pluginName: string
  name: string
  description: string
  url: string
}

const pluginInfoList: PluginInfo[] = [
  {
    pluginName: '@stylistic',
    name: 'ESLint Stylistic',
    description: 'Stylistic Formatting for ESLint',
    url: 'https://eslint.style',
  },
  {
    pluginName: 'antfu',
    name: 'eslint-plugin-antfu',
    description: 'Anthony extended ESLint rules',
    url: 'https://github.com/antfu/eslint-plugin-antfu',
  },
  {
    pluginName: 'unicorn',
    name: 'eslint-plugin-unicorn',
    description: 'More than 100 powerful ESLint rules',
    url: 'https://github.com/sindresorhus/eslint-plugin-unicorn',
  },
  {
    pluginName: 'simple-import-sort',
    name: 'eslint-plugin-simple-import-sort',
    description: 'Easy autofixable import sorting',
    url: 'https://github.com/lydell/eslint-plugin-simple-import-sort',
  },
  {
    pluginName: '@typescript-eslint',
    name: 'typescript-eslint',
    description: 'The tooling that enables ESLint and Prettier to support TypeScript.',
    url: 'https://typescript-eslint.io',
  },
  {
    pluginName: '@eslint-react',
    name: 'ESLint React',
    description: 'A series of composable ESLint rules for libraries and frameworks that use React as a UI runtime.',
    url: 'https://eslint-react.xyz',
  },
  {
    pluginName: 'react-hooks',
    name: 'eslint-plugin-react-hooks',
    description: 'This ESLint plugin enforces the Rules of Hooks',
    url: 'https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks',
  },
  {
    pluginName: '@next/next',
    name: 'eslint-plugin-next',
    description: 'ESLint plugin for Next.js',
    url: 'https://nextjs.org/docs/app/building-your-application/configuring/eslint#eslint-plugin',
  },
]

function analyzeConfigName(
  config: ESLintFlatConfig,
  options: Required<ConfigOptions>,
): string {
  const ruleNames = Object.keys(config.rules ?? {})
  const { configName } = options

  if (ruleNames.every(name => /^[A-Za-z][A-Za-z-]+[A-Za-z]$/gm.test(name)))
    // return 'ESLint JavaScript Plugin (The beginnings of separating out JavaScript-specific functionality from ESLint.)(https://www.npmjs.com/package/@eslint/js)'
    return `ESLint JavaScript Plugin${configName.description ? ' (The beginnings of separating out JavaScript-specific functionality from ESLint.)' : ''}${configName.url ? '(https://www.npmjs.com/package/@eslint/js)' : ''}`

  for (const { pluginName, name, description, url } of pluginInfoList) {
    if (pluginIs(config, pluginName))
      return `${configName.name ? name : ''}${configName.description ? ` (${description})` : ''}${configName.url ? `(${url})` : ''}`
  }

  return ''
}

function create(
  config: ESLintFlatConfig,
  options: Required<ConfigOptions>,
): ESLintFlatConfig {
  const { files } = options
  return defu(
    config,
    config.files ? undefined : { files },
    config.name ? undefined : { name: analyzeConfigName(config, options) },
  )
}

export function config(
  options: ConfigOptions,
  ...configs: Array<ESLintFlatConfig | ESLintFlatConfig[]>
): ESLintFlatConfig[] {
  const finalOptions = defu(
    options,
    {
      ignores: GLOB_EXCLUDE,
      ignoreFiles: DEFAULT_IGNORE_FILES,
      files: [DEFAULT_GLOB_SRC],
      configName: {
        name: true,
        description: false,
        url: false,
      },
    },
  )
  const { ignores, ignoreFiles } = finalOptions

  const globalIgnores = defu(
    {
      ignores,
    },
    gitignore({
      files: ignoreFiles,
      strict: false,
    }),
  )

  return [
    globalIgnores,
    {
      files: finalOptions.files,
      languageOptions: {
        ecmaVersion: 2022,
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
          document: 'readonly',
          navigator: 'readonly',
          window: 'readonly',
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 2022,
          sourceType: 'module',
        },
        sourceType: 'module',
      },
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
    },
    ...configs.map((c) => {
      if (Array.isArray(c))
        return create(defu({}, ...c), finalOptions)
      return create(c, finalOptions)
    }),
  ]
}
