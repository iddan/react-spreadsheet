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
    navbar: {
      title: "React Spreadsheet",
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        // Please keep GitHub link to the right for consistency.
        {
          href: "https://github.com/iddan/react-spreadsheet",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      // Please do not remove the credits, help to publicize Docusaurus :)
      copyright: `Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
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
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        out: "reference",
        readme: "none",
        excludeNotDocumented: true,
      },
    ],
  ],
};
