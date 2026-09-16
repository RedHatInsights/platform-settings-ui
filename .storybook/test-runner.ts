import type { TestRunnerConfig } from '@storybook/test-runner';

/**
 * Test runner hooks for Storybook
 * @see https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 */
const config: TestRunnerConfig = {
  /**
   * Hook that runs before each story test
   */
  async preVisit(page) {
    // Increase default timeout for slow CI environments
    page.setDefaultTimeout(10000);
  },

  /**
   * Hook that runs after each story is rendered but before the play function
   */
  async postVisit(page) {
    // Wait for fonts and images to load
    await page.evaluate(() => document.fonts.ready);
  },
};

export default config;
