"use strict";(self.webpackChunkreact_spreadsheet=self.webpackChunkreact_spreadsheet||[]).push([[805],{4396:function(e,t,a){a.r(t),a.d(t,{assets:function(){return i},contentTitle:function(){return l},default:function(){return u},frontMatter:function(){return o},metadata:function(){return s},toc:function(){return p}});var n=a(3117),r=(a(7294),a(3905));const o={id:"usage",title:"Usage"},l="Usage",s={unversionedId:"usage",id:"usage",title:"Usage",description:"Simple",source:"@site/docs/02-usage.md",sourceDirName:".",slug:"/usage",permalink:"/react-spreadsheet/docs/usage",draft:!1,editUrl:"https://github.com/iddan/react-spreadsheet/tree/master/website/docs/02-usage.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{id:"usage",title:"Usage"},sidebar:"sidebar",previous:{title:"Get Started",permalink:"/react-spreadsheet/docs/"},next:{title:"Formula Parser",permalink:"/react-spreadsheet/docs/formula-parser"}},i={},p=[{value:"Simple",id:"simple",level:2},{value:"Custom Columns and Rows",id:"custom-columns-and-rows",level:2},{value:"Readonly Cells",id:"readonly-cells",level:2},{value:"Controlled",id:"controlled",level:2}],c={toc:p};function u(e){let{components:t,...a}=e;return(0,r.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"usage"},"Usage"),(0,r.kt)("h2",{id:"simple"},"Simple"),(0,r.kt)("p",null,"The Spreadsheet component requires the ",(0,r.kt)("inlineCode",{parentName:"p"},"data")," property: an array of arrays with objects that have the ",(0,r.kt)("inlineCode",{parentName:"p"},"value")," key. Changes made in the Spreadsheet will not affect the passed data array as in React props values should not be mutated."),(0,r.kt)("admonition",{type:"caution"},(0,r.kt)("p",{parentName:"admonition"},"If the ",(0,r.kt)("inlineCode",{parentName:"p"},"data")," prop value is changed the component will discard any changes made by the user. If you want to make changes to ",(0,r.kt)("inlineCode",{parentName:"p"},"data")," and incorporate the user's changes see ",(0,r.kt)("a",{parentName:"p",href:"#Controlled"},"Controlled"),".")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }],\n  ];\n  return <Spreadsheet data={data} />;\n};\n')),(0,r.kt)("h2",{id:"custom-columns-and-rows"},"Custom Columns and Rows"),(0,r.kt)("p",null,"The Spreadsheet component accepts the ",(0,r.kt)("inlineCode",{parentName:"p"},"columnLabels")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"rowLabels")," props, both of which accept arrays. If no ",(0,r.kt)("inlineCode",{parentName:"p"},"columnLabels")," are supplied, alphabetical labels are used, and row index labels are used if no ",(0,r.kt)("inlineCode",{parentName:"p"},"rowLabels")," are passed."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const columnLabels = ["Flavour", "Food"];\n  const rowLabels = ["Item 1", "Item 2"];\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }],\n  ];\n  return (\n    <Spreadsheet\n      data={data}\n      columnLabels={columnLabels}\n      rowLabels={rowLabels}\n    />\n  );\n};\n')),(0,r.kt)("h2",{id:"readonly-cells"},"Readonly Cells"),(0,r.kt)("p",null,"Any particular Spreadsheet cell can be set to read-only by just specifying ",(0,r.kt)("inlineCode",{parentName:"p"},"readOnly: true")," in the cell along with the value."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'import Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const data = [\n    [{ value: "Vanilla" }, { value: "Chocolate", readOnly: true }],\n    [{ value: "Strawberry" }, { value: "Cookies", readOnly: true }],\n  ];\n  return <Spreadsheet data={data} />;\n};\n')),(0,r.kt)("h2",{id:"controlled"},"Controlled"),(0,r.kt)("p",null,"The Spreadsheet component accepts the ",(0,r.kt)("inlineCode",{parentName:"p"},"onChange")," prop that is called every time one of the Spreadsheet's cells is changed by the user. You can use it to save the modified data and to react to changes (e.g. validating the modified data, further modifying it, persisting it)."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},'import { useState } from "react";\nimport Spreadsheet from "react-spreadsheet";\n\nconst App = () => {\n  const [data, setData] = useState([\n    [{ value: "Vanilla" }, { value: "Chocolate" }, { value: "" }],\n    [{ value: "Strawberry" }, { value: "Cookies" }, { value: "" }],\n  ]);\n  return <Spreadsheet data={data} onChange={setData} />;\n};\n')))}u.isMDXComponent=!0},3905:function(e,t,a){a.d(t,{Zo:function(){return c},kt:function(){return m}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var i=n.createContext({}),p=function(e){var t=n.useContext(i),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},c=function(e){var t=p(e.components);return n.createElement(i.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=p(a),m=r,h=d["".concat(i,".").concat(m)]||d[m]||u[m]||o;return a?n.createElement(h,l(l({ref:t},c),{},{components:a})):n.createElement(h,l({ref:t},c))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,l=new Array(o);l[0]=d;var s={};for(var i in t)hasOwnProperty.call(t,i)&&(s[i]=t[i]);s.originalType=e,s.mdxType="string"==typeof e?e:r,l[1]=s;for(var p=2;p<o;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"}}]);