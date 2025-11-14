import type { DocusaurusConfig } from "@docusaurus/types";
import type * as pluginContentDocs from "@docusaurus/plugin-content-docs";
import type * as docusaurusPluginTypedoc from "docusaurus-plugin-typedoc";

export default {
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
          to: "reference/variables/Spreadsheet",
          label: "Reference",
          position: "right",
          activeBasePath: "reference",
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
      "docusaurus-plugin-typedoc",
      {
        // @ts-expect-error docusaurus-plugin-typedoc is not typed properly
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        out: "reference",
        sidebar: {
          pretty: true,
          autoConfiguration: true,
          typescript: false,
          deprecatedItemClassName: "deprecated",
        }
      } satisfies Partial<docusaurusPluginTypedoc.PluginOptions>,
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "reference",
        path: "reference",
        routeBasePath: "reference",
        sidebarPath: require.resolve("./src/reference-sidebar.js"),
        exclude: ["index.md"],
      } satisfies Partial<pluginContentDocs.PluginOptions>,
    ],
  ],
} satisfies Partial<DocusaurusConfig>;