import type { Preview } from "@storybook/react";

// function to get user dark mode
const getDarkMode = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: getDarkMode() ? "dark" : "light",
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
