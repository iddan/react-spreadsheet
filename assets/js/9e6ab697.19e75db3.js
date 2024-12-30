"use strict";(self.webpackChunkreact_spreadsheet=self.webpackChunkreact_spreadsheet||[]).push([[198],{8105:(e,t,s)=>{s.r(t),s.d(t,{assets:()=>a,contentTitle:()=>o,default:()=>h,frontMatter:()=>c,metadata:()=>n,toc:()=>d});const n=JSON.parse('{"id":"contributing","title":"Contributing","description":"Perquisites","source":"@site/docs/04-contributing.md","sourceDirName":".","slug":"/contributing","permalink":"/react-spreadsheet/docs/contributing","draft":false,"unlisted":false,"editUrl":"https://github.com/iddan/react-spreadsheet/tree/master/website/docs/04-contributing.md","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"id":"contributing","title":"Contributing"},"sidebar":"sidebar","previous":{"title":"Formula Parser","permalink":"/react-spreadsheet/docs/formula-parser"}}');var r=s(4848),i=s(8453);const c={id:"contributing",title:"Contributing"},o="Contributing",a={},d=[{value:"Perquisites",id:"perquisites",level:3},{value:"Installation",id:"installation",level:3},{value:"Project Structure",id:"project-structure",level:3},{value:"State management",id:"state-management",level:3},{value:"Main data structures",id:"main-data-structures",level:3},{value:"Stories",id:"stories",level:3},{value:"Components",id:"components",level:3},{value:"Website",id:"website",level:3}];function l(e){const t={a:"a",code:"code",h1:"h1",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.header,{children:(0,r.jsx)(t.h1,{id:"contributing",children:"Contributing"})}),"\n",(0,r.jsx)(t.h3,{id:"perquisites",children:"Perquisites"}),"\n",(0,r.jsx)(t.p,{children:"Make sure you are familiar with the following technologies:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://www.typescriptlang.org/",children:"TypeScript"})," - used for the library code."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://react.dev/reference/react",children:"React Hooks"})," - used for the library code."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://jestjs.io/",children:"Jest"})," - used for testing."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://testing-library.com/docs/react-testing-library/intro/",children:"React Testing Library"})," - used for testing."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://storybook.js.org/",children:"Storybook"})," - used for interactive testing."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://typedoc.org/",children:"Typedoc"})," - used for generating the documentation."]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"installation",children:"Installation"}),"\n",(0,r.jsx)(t.p,{children:"Make sure you have the following installed:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://nodejs.org/en/",children:"Node.js"})," v16 or higher."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.a,{href:"https://yarnpkg.com/",children:"Yarn"})," for package management"]}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:"Then run:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"git clone https://github.com/iddan/react-spreadsheet.git;\ncd react-spreadsheet;\nyarn install;\n"})}),"\n",(0,r.jsx)(t.h3,{id:"project-structure",children:"Project Structure"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"src/index.ts"})," - The entry point for the library, exports all the public API."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"src/Spreadsheet.tsx"})," - The main component for the library."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"src/engine"}),"- The spreadsheet formula evaluation engine for the library."]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"state-management",children:"State management"}),"\n",(0,r.jsxs)(t.p,{children:["The component's state is managed in a single reducer defined in ",(0,r.jsx)(t.code,{children:"src/reducer.ts"})," and the actions are defined in ",(0,r.jsx)(t.code,{children:"src/actions.ts"}),".\nThe state is passed to the other components using context (defined in ",(0,r.jsx)(t.code,{children:"src/context.ts"}),"), specifically using ",(0,r.jsx)(t.a,{href:"https://github.com/dai-shi/use-context-selector",children:"use-context-selector"})," to select the required state from the context and avoid unnecessary re-renders."]}),"\n",(0,r.jsx)(t.h3,{id:"main-data-structures",children:"Main data structures"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"Matrix"})," - Represents a 2D matrix of cells, used for the spreadsheet data."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"PointRange"})," - Represents a range in the spreadsheet."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"Selection"})," - Represents a rectangular selection of cells."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"CellBase"})," - Represents a single cell in the spreadsheet."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"Model"})," - Represents the spreadsheet data and the evaluated formulae cells."]}),"\n",(0,r.jsxs)(t.li,{children:[(0,r.jsx)(t.code,{children:"PointSet"})," - Represents a set of points in the spreadsheet. Used for formulae evaluation only."]}),"\n"]}),"\n",(0,r.jsx)(t.h3,{id:"stories",children:"Stories"}),"\n",(0,r.jsxs)(t.p,{children:["The component is interactively tested with ",(0,r.jsx)(t.a,{href:"https://storybook.js.org/",children:"Storybook"}),". The stories are defined in ",(0,r.jsx)(t.code,{children:"src/stories/"}),"."]}),"\n",(0,r.jsx)(t.h3,{id:"components",children:"Components"}),"\n",(0,r.jsxs)(t.p,{children:["As the Spreadsheet component allows customizing all the components used in the spreadsheet. For instance ",(0,r.jsx)(t.code,{children:"src/Table.tsx"})," can be overridden with a component from the outside. That's why the props for the components are imported for ",(0,r.jsx)(t.code,{children:"src/types.ts"}),", so their API will be stable and well defined."]}),"\n",(0,r.jsx)(t.h3,{id:"website",children:"Website"}),"\n",(0,r.jsxs)(t.p,{children:["The website is built with ",(0,r.jsx)(t.a,{href:"https://docusaurus.io/",children:"Docusaurus"})," and it's code is available in ",(0,r.jsx)(t.code,{children:"website/"}),". The docs are in ",(0,r.jsx)(t.code,{children:"website/docs/"})," and the main configuration is in ",(0,r.jsx)(t.code,{children:"website/docusaurus.config.js"}),"."]})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}},8453:(e,t,s)=>{s.d(t,{R:()=>c,x:()=>o});var n=s(6540);const r={},i=n.createContext(r);function c(e){const t=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:c(e.components),n.createElement(i.Provider,{value:t},e.children)}}}]);