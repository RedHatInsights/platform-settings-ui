/**
 * Test runner configuration for Storybook
 * @see https://storybook.js.org/docs/writing-tests/test-runner#test-runner-jest-configuration
 */

const { getJestConfig } = require('@storybook/test-runner');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  // The default configuration comes from @storybook/test-runner
  ...getJestConfig(),
  /** Add your own overrides below */
  testTimeout: 60000,
  // Increase max workers for better performance
  maxWorkers: '50%',
};
