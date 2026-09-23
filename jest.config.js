/**
 * react-intl v7 is ESM-only and ships no CommonJS build, so anything importing
 * a `messages.ts` — which is every feature module — reaches it. Jest has to
 * transpile it and the @formatjs packages it pulls in.
 */
const esmDependencies = ['uuid', 'react-intl', '@formatjs', 'intl-messageformat'];

const transformIgnorePatterns = [
  `node_modules/(?!(${esmDependencies.join('|')})/)`,
];

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-babel-esm',
  testEnvironment: 'jsdom',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/stories/*', '!src/**/*.stories.{ts,tsx}'],
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transform: {
    // Babel options live here rather than in a root babel.config.js: the app is
    // built by `fec build` (swc), and a root Babel config would be picked up by
    // other tooling that has no business transpiling to CommonJS.
    '\\.[jm]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
  transformIgnorePatterns,
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts'],
};
