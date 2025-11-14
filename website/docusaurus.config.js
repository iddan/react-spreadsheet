const path = require("path");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "React Spreadsheet",
  tagline: "Simple, customizable yet performant spreadsheet for React",
  url: "https://iddan.github.io",
  baseUrl: "/react-spreadsheet/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "iddan", // Usually your GitHub org/user name.
  projectName: "react-spreadsheet", // Usually your repo name.
  themeConfig: {
    prism: {
      theme: require("prism-react-renderer").themes.nightOwlLight,
      darkTheme: require("prism-react-renderer").themes.nightOwl,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "React Spreadsheet",
      logo: {
        alt: "React Spreadsheet Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "search",
          position: "right",
        },
        {
          to: "learn/",
          activeBasePath: "learn",
          label: "Learn",
          position: "right",
        },
        {
          to: "reference",
          label: "Reference",
          position: "right",
        },
        {
          href: "https://github.com/iddan/react-spreadsheet",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          routeBasePath: "learn",
          sidebarPath: require.resolve("./docs/sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/iddan/react-spreadsheet/tree/master/website",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  plugins: [
    [
      "docusaurus-plugin-typedoc-api",
      {
        routeBasePath: "reference",
        projectRoot: path.resolve(__dirname, ".."),
        packages: ["."],
        exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
        typedocOptions: {
          excludeNotDocumented: true,
          plugin: ["typedoc-plugin-rename-defaults"],
        },
      },
    ],
  ],
};
