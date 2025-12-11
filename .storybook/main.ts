import type { StorybookConfig } from "@stencil/storybook-plugin";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
  ],
  framework: {
    name: "@stencil/storybook-plugin"
  },
  staticDirs: [
    {
      from: '../node_modules/@esri/calcite-components/dist/calcite/assets',
      to: '/assets',
    },
  ]
};

export default config;
