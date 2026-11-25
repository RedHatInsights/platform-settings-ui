module.exports = {
  appUrl: '/settings/user-preferences/language',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  sassPrefix: '.platform-settings-ui, .platformSettingsUi',
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  hotReload: process.env.HOT === 'true',
  moduleFederation: {
    exposes: {
      './RootApp': './src/AppEntry',
    },
  },
};
