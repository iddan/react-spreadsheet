const items = require("../reference/typedoc-sidebar.cjs");
console.log(
  items.map((it) => {
    return {
      ...it,
      items: it.items.map((item) => {
        return {
          ...item,
          id: item.id.replace("../reference/", ""),
        };
      }),
    };
  })
);
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  sidebar: items.map((it) => {
    return {
      ...it,
      items: it.items.map((item) => {
        return {
          ...item,
          id: item.id.replace("../reference/", ""),
        };
      }),
    };
  }),
};
