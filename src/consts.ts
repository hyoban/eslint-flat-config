export type PluginInfo = {
  pluginName: string
  name: string
  description: string
  url: string
}

export const pluginInfoList: PluginInfo[] = [
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
  {
    pluginName: 'jsx-a11y',
    name: 'eslint-plugin-jsx-a11y',
    description: 'Static AST checker for a11y rules on JSX elements.',
    url: 'https://github.com/jsx-eslint/eslint-plugin-jsx-a11y',
  },
  {
    pluginName: 'react-refresh',
    name: 'eslint-plugin-react-refresh',
    description: 'Validate that your components can safely be updated with fast refresh',
    url: 'https://github.com/ArnaudBarre/eslint-plugin-react-refresh',
  },
  {
    pluginName: 'validate-jsx-nesting',
    name: 'eslint-plugin-validate-jsx-nesting',
    description: 'ESLint Plugin to Validate JSX Nestings',
    url: 'https://github.com/MananTank/eslint-plugin-validate-jsx-nesting',
  },
  {
    pluginName: 'jsonc',
    name: 'eslint-plugin-jsonc',
    description: 'ESLint plugin for JSON(C|5)? files',
    url: 'https://github.com/ota-meshi/eslint-plugin-jsonc',
  },
]
