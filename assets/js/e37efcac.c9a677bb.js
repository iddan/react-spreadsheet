"use strict";(self.webpackChunkreact_spreadsheet=self.webpackChunkreact_spreadsheet||[]).push([[646],{3602:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>d,contentTitle:()=>l,default:()=>h,frontMatter:()=>o,metadata:()=>n,toc:()=>c});const n=JSON.parse('{"id":"usage","title":"Usage","description":"Simple","source":"@site/docs/02-usage.md","sourceDirName":".","slug":"/usage","permalink":"/react-spreadsheet/docs/usage","draft":false,"unlisted":false,"editUrl":"https://github.com/iddan/react-spreadsheet/tree/master/website/docs/02-usage.md","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"id":"usage","title":"Usage"},"sidebar":"sidebar","previous":{"title":"Get Started","permalink":"/react-spreadsheet/docs/"},"next":{"title":"Formula Parser","permalink":"/react-spreadsheet/docs/formula-parser"}}');var s=t(4848),r=t(8453);const o={id:"usage",title:"Usage"},l="Usage",d={},c=[{value:"Simple",id:"simple",level:2},{value:"Custom Columns and Rows",id:"custom-columns-and-rows",level:2},{value:"Readonly Cells",id:"readonly-cells",level:2},{value:"Controlled",id:"controlled",level:2}];function i(e){const a={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(a.header,{children:(0,s.jsx)(a.h1,{id:"usage",children:"Usage"})}),"\n",(0,s.jsx)(a.h2,{id:"simple",children:"Simple"}),"\n",(0,s.jsxs)(a.p,{children:["The Spreadsheet component requires the ",(0,s.jsx)(a.code,{children:"data"})," property: an array of arrays with objects that have the ",(0,s.jsx)(a.code,{children:"value"})," key. Changes made in the Spreadsheet will not affect the passed data array as in React props values should not be mutated."]}),"\n",(0,s.jsx)(a.admonition,{type:"caution",children:(0,s.jsxs)(a.p,{children:["If the ",(0,s.jsx)(a.code,{children:"data"})," prop value is changed the component will discard any changes made by the user. If you want to make changes to ",(0,s.jsx)(a.code,{children:"data"})," and incorporate the user's changes see ",(0,s.jsx)(a.a,{href:"#controlled",children:"Controlled"}),"."]})}),"\n",(0,s.jsx)(a.pre,{children:(0,s.jsx)(a.code,{className:"language-javascript",children:'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }],\n  ];\n  return <Spreadsheet data={data} />;\n};\n'})}),"\n",(0,s.jsx)(a.h2,{id:"custom-columns-and-rows",children:"Custom Columns and Rows"}),"\n",(0,s.jsxs)(a.p,{children:["The Spreadsheet component accepts the ",(0,s.jsx)(a.code,{children:"columnLabels"})," or ",(0,s.jsx)(a.code,{children:"rowLabels"})," props, both of which accept arrays. If no ",(0,s.jsx)(a.code,{children:"columnLabels"})," are supplied, alphabetical labels are used, and row index labels are used if no ",(0,s.jsx)(a.code,{children:"rowLabels"})," are passed."]}),"\n",(0,s.jsx)(a.pre,{children:(0,s.jsx)(a.code,{className:"language-javascript",children:'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const columnLabels = ["Flavour", "Food"];\n  const rowLabels = ["Item 1", "Item 2"];\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }],\n  ];\n  return (\n    <Spreadsheet\n      data={data}\n      columnLabels={columnLabels}\n      rowLabels={rowLabels}\n    />\n  );\n};\n'})}),"\n",(0,s.jsx)(a.h2,{id:"readonly-cells",children:"Readonly Cells"}),"\n",(0,s.jsxs)(a.p,{children:["Any particular Spreadsheet cell can be set to read-only by just specifying ",(0,s.jsx)(a.code,{children:"readOnly: true"})," in the cell along with the value."]}),"\n",(0,s.jsx)(a.pre,{children:(0,s.jsx)(a.code,{className:"language-javascript",children:'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate", readOnly: true }],\n    [{ value: "Strawberry" }, { value: "Cookies", readOnly: true }],\n  ];\n  return <Spreadsheet data={data} />;\n};\n'})}),"\n",(0,s.jsx)(a.h2,{id:"controlled",children:"Controlled"}),"\n",(0,s.jsxs)(a.p,{children:["The Spreadsheet component accepts the ",(0,s.jsx)(a.code,{children:"onChange"})," prop that is called every time one of the Spreadsheet's cells is changed by the user. You can use it to save the modified data and to react to changes (e.g. validating the modified data, further modifying it, persisting it)."]}),"\n",(0,s.jsx)(a.p,{children:"JavaScript (See TypeScript example below):"}),"\n",(0,s.jsx)(a.pre,{children:(0,s.jsx)(a.code,{className:"language-javascript",children:'import { useState } from "react";\nimport Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const [data, setData] = useState([\n    [{ value: "Vanilla" }, { value: "Chocolate" }, { value: "" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }, { value: "" }],\n  ]);\n  return <Spreadsheet data={data} onChange={setData} />;\n};\n'})}),"\n",(0,s.jsx)(a.p,{children:"TypeScript:"}),"\n",(0,s.jsx)(a.pre,{children:(0,s.jsx)(a.code,{className:"language-typescript",children:'import { useState } from "react";\nimport Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const [data, setData] = useState<Matrix<CellBase>>([\n    [{ value: "Vanilla" }, { value: "Chocolate" }, { value: "" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }, { value: "" }],\n  ]);\n  return <Spreadsheet data={data} onChange={setData} />;\n};\n'})})]})}function h(e={}){const{wrapper:a}={...(0,r.R)(),...e.components};return a?(0,s.jsx)(a,{...e,children:(0,s.jsx)(i,{...e})}):i(e)}},8453:(e,a,t)=>{t.d(a,{R:()=>o,x:()=>l});var n=t(6540);const s={},r=n.createContext(s);function o(e){const a=n.useContext(r);return n.useMemo((function(){return"function"==typeof e?e(a):{...a,...e}}),[a,e])}function l(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),n.createElement(r.Provider,{value:a},e.children)}}}]);