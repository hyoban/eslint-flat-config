declare module '@eslint/js' {
  export const configs: {
    all: {
      rules: Record<string, string>
    }
    recommended: {
      rules: Record<string, string>
    }
  }
}
declare module 'eslint-plugin-import'
declare module 'eslint-plugin-simple-import-sort'
declare module 'eslint-plugin-unicorn'
