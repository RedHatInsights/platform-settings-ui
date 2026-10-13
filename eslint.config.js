/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('eslint/config');
const fecPlugin = require('@redhat-cloud-services/eslint-config-redhat-cloud-services');
const tsParser = require('@typescript-eslint/parser');
const tseslint = require('typescript-eslint');
const governancePlugin = require('experience-ui-governance/eslint-plugin');

module.exports = defineConfig(
  fecPlugin,
  {
    languageOptions: {
      globals: {
        insights: 'readonly',
      },
    },
    ignores: ['node_modules/*', 'dist/*'],
    rules: {
      requireConfigFile: 'off',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
  tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      'experience-ui': governancePlugin,
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'experience-ui/no-boundary-violations': 'error',
      'experience-ui/no-jest-snapshot': 'error',
      ...governancePlugin.configs.recommended.rules,
    },
  },
  {
    files: ['src/**/*.stories.@(ts|tsx)'],
    rules: {
      ...governancePlugin.configs.stories.rules,
    },
  },
  {
    files: ['src/**/data/queries/**/*.ts', 'src/**/data/queries/**/*.tsx'],
    rules: {
      ...governancePlugin.configs['data-layer'].rules,
    },
  },
  {
    files: ['src/capabilities/**/*.ts', 'src/capabilities/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths:
            governancePlugin.configs.recommended.restrictedImportPaths.filter(
              (p) => p.name !== '@unleash/proxy-client-react',
            ),
        },
      ],
    },
  },
  {
    files: ['src/App.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: governancePlugin.configs.recommended.restrictedImportPaths.filter(
            (p) => p.name !== '@redhat-cloud-services/frontend-components/useChrome',
          ),
        },
      ],
    },
  },
  {
    files: ['src/Components/AppLink.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: governancePlugin.configs.recommended.restrictedImportPaths
            .filter(
              (p) => p.name !== '@redhat-cloud-services/frontend-components/useChrome',
            )
            .map((p) =>
              p.name === 'react-router-dom'
                ? { ...p, importNames: ['useNavigate'] }
                : p,
            ),
        },
      ],
    },
  },
  {
    files: ['src/hooks/useAppNavigate.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: governancePlugin.configs.recommended.restrictedImportPaths
            .filter(
              (p) => p.name !== '@redhat-cloud-services/frontend-components/useChrome',
            )
            .map((p) =>
              p.name === 'react-router-dom'
                ? { ...p, importNames: ['Link'] }
                : p,
            ),
        },
      ],
    },
  },
);
