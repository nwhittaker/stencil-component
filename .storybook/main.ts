const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
  ],
  framework: {
    name: "@stencil/storybook-plugin"
  },
};

export default config;
