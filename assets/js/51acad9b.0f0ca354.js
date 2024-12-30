"use strict";(self.webpackChunkreact_spreadsheet=self.webpackChunkreact_spreadsheet||[]).push([[995],{3132:(e,r,a)=>{a.r(r),a.d(r,{assets:()=>i,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>d});const s=JSON.parse('{"id":"formula-parser","title":"Formula Parser","description":"Default","source":"@site/docs/03-formula-parser.md","sourceDirName":".","slug":"/formula-parser","permalink":"/react-spreadsheet/docs/formula-parser","draft":false,"unlisted":false,"editUrl":"https://github.com/iddan/react-spreadsheet/tree/master/website/docs/03-formula-parser.md","tags":[],"version":"current","sidebarPosition":3,"frontMatter":{"id":"formula-parser","title":"Formula Parser"},"sidebar":"sidebar","previous":{"title":"Usage","permalink":"/react-spreadsheet/docs/usage"},"next":{"title":"Contributing","permalink":"/react-spreadsheet/docs/contributing"}}');var t=a(4848),n=a(8453);const o={id:"formula-parser",title:"Formula Parser"},l="Formula Parser",i={},d=[{value:"Default",id:"default",level:2},{value:"Custom formula parser",id:"custom-formula-parser",level:2},{value:"Overriding formulas",id:"overriding-formulas",level:2}];function c(e){const r={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",...(0,n.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.header,{children:(0,t.jsx)(r.h1,{id:"formula-parser",children:"Formula Parser"})}),"\n",(0,t.jsx)(r.h2,{id:"default",children:"Default"}),"\n",(0,t.jsxs)(r.p,{children:["By default, a regular formula parser (based on ",(0,t.jsx)(r.a,{href:"https://github.com/LesterLyu/fast-formula-parser",children:"Fast Formula Parser"}),") is created.\nWith this come all the formulas and implementations from the Fast Formula Parser."]}),"\n",(0,t.jsx)(r.h2,{id:"custom-formula-parser",children:"Custom formula parser"}),"\n",(0,t.jsxs)(r.p,{children:["It is possible to pass a construction function for a formula parser to the ",(0,t.jsx)(r.code,{children:"<Spreadsheet />"})," component by assigning it to the ",(0,t.jsx)(r.code,{children:"createFormulaParser"})," prop. This should be an implementation of the FormulaParser as defined in the Fast Formula Parser library, hence this library should be added as dependency. The",(0,t.jsx)(r.code,{children:"react-spreadsheet"})," library also exposes a function ",(0,t.jsx)(r.code,{children:"createFormulaParser"})," to quickly create the implementation as used by default."]}),"\n",(0,t.jsx)(r.h2,{id:"overriding-formulas",children:"Overriding formulas"}),"\n",(0,t.jsxs)(r.p,{children:["The Fast Formula Parser library allows overriding of the formulas as implemented.\nTo leverage this, one could for example disable the ",(0,t.jsx)(r.code,{children:"SUM"})," function as follows."]}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-javascript",children:'import Spreadsheet, {\n  createFormulaParser,\n  Matrix,\n  CellBase,\n} from "react-spreadsheet";\n\nconst customCreateFormulaParser = (data: Matrix<CellBase>) =>\n  createFormulaParser(data, { SUM: undefined });\n\nconst MyComponent = () => {\n  return (\n    <Spreadsheet data={[]} createFormulaParser={customCreateFormulaParser} />\n  );\n};\n'})})]})}function u(e={}){const{wrapper:r}={...(0,n.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},8453:(e,r,a)=>{a.d(r,{R:()=>o,x:()=>l});var s=a(6540);const t={},n=s.createContext(t);function o(e){const r=s.useContext(n);return s.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function l(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),s.createElement(n.Provider,{value:r},e.children)}}}]);