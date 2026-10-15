/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('eslint/config');
const fecPlugin = require('@redhat-cloud-services/eslint-config-redhat-cloud-services');
const tsParser = require('@typescript-eslint/parser');
const tseslint = require('typescript-eslint');
const governancePlugin = require('experience-ui-governance/eslint-plugin');
const i18nextPlugin = require('eslint-plugin-i18next');

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
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['**/*.test.*', '**/*.stories.*'],
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          ignore: [', ', ' ', ': ', ':'],
          callees: {
            exclude: ['join'],
          },
          words: {
            exclude: [
              // PatternFly flex/layout modifier enums (RegExp objects for flat config)
              /^alignItems[A-Z]/, /^spaceItems[A-Z]/, /^justifyContent[A-Z]/,
              /^flexWrap[A-Z]/, /^inset[A-Z]/, /^spacer[A-Z]/, /^gap[A-Z]/,
              /^flex_[0-9]+$/, /^flexDefault$/, /^flexNone$/,
              /^grow$/, /^shrink$/, /^noPadding$/, /^nowrap$/, /^compact$/,
              /^alignSelf[A-Z]/,
              // CSS values
              /^100%$/, /^calc\(/, /^var\(/,
              // PatternFly positional/interaction enums
              /^right$/, /^left$/, /^center$/, /^top$/, /^bottom$/,
              /^hover$/, /^click$/, /^single$/, /^multiple$/,
              // PatternFly status/severity/color enums
              /^danger$/, /^success$/, /^warning$/, /^info$/, /^default$/, /^error$/,
              /^outline$/, /^filled$/,
              /^purple$/, /^red$/, /^grey$/, /^gray$/, /^green$/, /^blue$/, /^orange$/, /^cyan$/, /^teal$/,
              // Provider identifiers
              /^openshift$/, /^aws$/, /^azure$/, /^google$/,
              // HTML attribute values
              /^_blank$/, /^noopener\snoreferrer$/,
              // Workflow state enums
              /^pending$/, /^approved$/, /^denied$/, /^create$/, /^edit$/, /^cancel$/,
              // Structural
              /^,\s$/, /^:\s$/, /^a$/,
              /^#$/, /^2xl$/, /^wrap$/, /^inset2xl$/,
            ],
          },
          'jsx-attributes': {
            include: [],
            exclude: [
              'className', 'styleName', 'style', 'type', 'key', 'id', 'width', 'height',
              'name', 'href', 'to', 'path', 'target', 'variant', 'component', 'form',
              'fieldId', 'filterId', 'widgetId', 'ouiaId', 'data-testid', 'testId',
              'autoFocus', 'headingLevel', 'size', 'sx', 'direction', 'position',
              'align', 'icon', 'variantPrefix', 'isCompact', 'ouiaId.*',
              'locale', 'defaultLocale', 'aria-describedby', 'aria-labelledby',
              'titleIconVariant', 'iconVariant', 'placeholder',
              'eventKey', 'labelId', 'serviceName', 'toLandingPageUrl', 'buttonLink',
              'sortableColumns', 'triggerAction', 'iconPosition', 'color', 'status',
              'validated', 'rel', 'role', 'popperProps', 'appendTo',
            ],
          },
        },
      ],
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
    files: ['src/hooks/useAppNavigate.ts', 'src/shared/i18n/useChromeLocale.ts'],
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
