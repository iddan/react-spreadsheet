"use strict";(self.webpackChunkreact_spreadsheet=self.webpackChunkreact_spreadsheet||[]).push([[634],{2468:(e,t,s)=>{s.r(t),s.d(t,{default:()=>x});var n=s(6540),r=s(53),a=s(1123),i=s(8774),o=s(144),l=s.n(o),c=s(4586),d=s(6025),h=s(1753);const u={heroBanner:"heroBanner_UJJx",buttons:"buttons_pzbO",spreadsheetContainer:"spreadsheetContainer_tmI4",features:"features_keug",featureImage:"featureImage_yA8i"};var m=s(4848);const p=[{title:"Simple",description:(0,m.jsx)(m.Fragment,{children:"Straightforward API focusing on common use cases while keeping flexibility"})},{title:"Performant",description:(0,m.jsx)(m.Fragment,{children:"Draw and update tables with many columns and rows without virtualization"})},{title:"Just Components\u2122",description:(0,m.jsx)(m.Fragment,{children:"The Spreadsheet is just a component, compose it easily with other components and data"})}];function f(e){let{title:t,description:s}=e;return(0,m.jsxs)("div",{className:(0,r.A)("col col--4",u.feature),children:[(0,m.jsx)("h3",{children:t}),(0,m.jsx)("p",{children:s})]})}function x(){const e=(0,c.default)(),{siteConfig:t={}}=e,[s,o]=n.useState((0,h.JH)(4,5)),x=n.useRef(null),j=l()(x),b=Math.floor(j.width/120);return n.useEffect((()=>{if(b){const e=s.map((e=>{const t=[...e];return t.length=b,t}));o(e)}}),[b]),(0,m.jsxs)(a.A,{title:t.title,description:"Simple, customizable yet performant spreadsheet for React",children:[(0,m.jsx)("header",{className:(0,r.A)("hero hero--primary",u.heroBanner),children:(0,m.jsxs)("div",{className:"container",children:[(0,m.jsx)("h1",{className:"hero__title",children:t.title}),(0,m.jsx)("p",{className:"hero__subtitle",children:t.tagline}),(0,m.jsxs)("div",{className:u.buttons,children:[(0,m.jsx)(i.default,{className:(0,r.A)("button button--outline button--secondary button--lg",u.getStarted),to:(0,d.Ay)("docs/"),children:"Get Started"}),(0,m.jsx)("a",{className:(0,r.A)("button button--outline button--secondary button--lg",u.getStarted),href:(0,d.Ay)("storybook/"),children:"Storybook"})]}),(0,m.jsx)("div",{ref:x,className:u.spreadsheetContainer,children:(0,m.jsx)(h.Ay,{data:s,onChange:o})})]})}),(0,m.jsx)("main",{children:p&&p.length>0&&(0,m.jsx)("section",{className:u.features,children:(0,m.jsx)("div",{className:"container",children:(0,m.jsx)("div",{className:"row",children:p.map((e=>{let{title:t,imageUrl:s,description:n}=e;return(0,m.jsx)(f,{title:t,imageUrl:s,description:n},t)}))})})})})]})}}}]);