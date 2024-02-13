import { defu } from 'defu'
import gitignore from 'eslint-config-flat-gitignore'
import type { FlatESLintConfig } from 'eslint-define-config'

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
}

function create(
  config: FlatESLintConfig,
  options: Required<ConfigOptions>,
): FlatESLintConfig {
  const { files } = options

  if (!config?.files)
    return { ...config, files }
  return config
}

export function config(
  options: ConfigOptions,
  ...configs: Array<FlatESLintConfig | FlatESLintConfig[]>
): FlatESLintConfig[] {
  const finalOptions = defu(
    options,
    {
      ignores: GLOB_EXCLUDE,
      ignoreFiles: DEFAULT_IGNORE_FILES,
      files: [DEFAULT_GLOB_SRC],
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

  return [globalIgnores, ...configs.map((c) => {
    if (Array.isArray(c))
      return create(defu({}, ...c), finalOptions)
    return create(c, finalOptions)
  })]
}
