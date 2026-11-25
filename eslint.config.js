/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('eslint/config');
const fecPlugin = require('@redhat-cloud-services/eslint-config-redhat-cloud-services');
const tsParser = require('@typescript-eslint/parser');
const tseslint = require('typescript-eslint');

const experienceUiPlugin = require('experience-ui-governance/eslint-plugin');

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
      'experience-ui': experienceUiPlugin,
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'experience-ui/require-use-table-state': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-router-dom',
              importNames: ['Link', 'useNavigate'],
              message:
                'Use AppLink from src/Components/AppLink for links. Use useAppNavigate from src/hooks/useAppNavigate for programmatic navigation.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.stories.@(ts|tsx)'],
    rules: {
      'experience-ui/enforce-story-patterns': 'error',
      'experience-ui/no-direct-user-type': 'error',
    },
  },
);
