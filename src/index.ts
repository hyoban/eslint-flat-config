import js from '@eslint/js'
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import { defu } from 'defu'
import globals from 'globals'

import type { PluginInfo } from './consts'
import { DEFAULT_GLOB_SRC, DEFAULT_IGNORE_FILES, GLOB_EXCLUDE, pluginInfoList } from './consts'
import type { MaybeArray } from './utils'
import { interopDefault, nonNullable } from './utils'

export type UnifiedFlatConfig = FlatConfig.Config & { name?: string }

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
  if (!config.name) {
    const analyzedName = analyzeConfigName(config, options)
    if (analyzedName)
      config.name = analyzedName
  }
  return defu<UnifiedFlatConfig, UnifiedFlatConfig[]>(
    config,
    config.files ? {} : { files },
  )
}

const deprecatedJsRules = new Set([
  'no-extra-semi',
  'no-mixed-spaces-and-tabs',
])

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

function mergeConfigs(
  c: MaybeArray<UnifiedFlatConfig>,
  finalOptions: Required<ConfigOptions>,
): UnifiedFlatConfig {
  if (Array.isArray(c))
    return create(defu({}, ...c.reverse()), finalOptions)
  return create(c, finalOptions)
}
