declare module '@eslint/js' {
  import type { SharedConfig } from '@typescript-eslint/utils/ts-eslint'

  export const configs: {
    all: {
      rules: Record<string, SharedConfig.RuleEntry>,
    },
    recommended: {
      rules: Record<string, SharedConfig.RuleEntry>,
    },
  }
}
declare module 'eslint-plugin-import'
declare module 'eslint-plugin-simple-import-sort'
declare module 'eslint-plugin-unicorn'
