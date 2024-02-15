import js from '@eslint/js'
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import { defu } from 'defu'
import type { Linter } from 'eslint'
import globals from 'globals'

export type UnifiedFlatConfig = (FlatConfig.Config | Linter.FlatConfig) & { name?: string }

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

export type ConfigOptionsWithFlatConfig = ConfigOptions
  & Pick<FlatConfig.Config, 'rules' | 'languageOptions' | 'linterOptions' | 'settings'>

function pluginIs(config: UnifiedFlatConfig, name: string): boolean {
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
  {
    pluginName: 'tailwindcss',
    name: 'eslint-plugin-tailwindcss',
    description: 'ESLint plugin for Tailwind CSS usage',
    url: 'https://github.com/francoismassart/eslint-plugin-tailwindcss',
  },
]

function analyzeConfigName(
  config: UnifiedFlatConfig,
  options: Required<ConfigOptions>,
) {
  const { configName } = options

  for (const { pluginName, name, description, url } of pluginInfoList) {
    if (pluginIs(config, pluginName))
      return `${configName.name ? name : ''}${configName.description ? ` (${description})` : ''}${configName.url ? `(${url})` : ''}`
  }
}

function create(
  config: UnifiedFlatConfig,
  options: Required<ConfigOptions>,
): UnifiedFlatConfig {
  const { files } = options
  return defu<UnifiedFlatConfig, UnifiedFlatConfig[]>(
    config,
    config.files ? {} : { files },
    config.name ? {} : { name: analyzeConfigName(config, options) },
  )
}

const deprecatedJsRules = new Set([
  'no-extra-semi',
  'no-mixed-spaces-and-tabs',
])

export type Awaitable<T> = T | Promise<T>
export async function interopDefault<T>(m: Awaitable<T>): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  return (resolved as any).default || resolved
}

type MaybeArray<T> = T | T[]

type CreateUnifiedFlatConfig = () => MaybeArray<UnifiedFlatConfig> | undefined
type AsyncCreateUnifiedFlatConfig = () => Promise<MaybeArray<UnifiedFlatConfig> | undefined>

export async function config(
  options: ConfigOptionsWithFlatConfig,
  ...configs: Array<MaybeArray<UnifiedFlatConfig> | CreateUnifiedFlatConfig | AsyncCreateUnifiedFlatConfig >
): Promise<UnifiedFlatConfig[]> {
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
  const { ignores, ignoreFiles, configName, files: _files, ...rest } = finalOptions

  const gitignore = await interopDefault(import('eslint-config-flat-gitignore'))

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
    defu <UnifiedFlatConfig, UnifiedFlatConfig[] >(
      rest,
      {
        name: `ESLint JavaScript Plugin${configName.description ? ' (The beginnings of separating out JavaScript-specific functionality from ESLint.)' : ''}${configName.url ? '(https://www.npmjs.com/package/@eslint/js)' : ''}`,
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
        rules: Object.fromEntries(
          Object.entries(js.configs.recommended.rules)
            .filter(([rule]) => !deprecatedJsRules.has(rule)),
        ),
      },
    ),
    ...(
      (await Promise.all(configs.map(async (c) => {
        if (typeof c === 'function') {
          const resolved = await c()
          if (!resolved)
            return {}
          return mergeConfigs(resolved, finalOptions)
        }
        return mergeConfigs(c, finalOptions)
      // eslint-disable-next-line unicorn/no-await-expression-member
      }))).filter(element => nonNullable(element))
    ),
  ]
}

function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

function mergeConfigs(
  c: MaybeArray<UnifiedFlatConfig>,
  finalOptions: Required<ConfigOptions>,
): UnifiedFlatConfig {
  if (Array.isArray(c))
    return create(defu({}, ...c.reverse()), finalOptions)
  return create(c, finalOptions)
}
