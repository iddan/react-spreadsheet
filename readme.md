<div align="center">
  <img src="https://raw.githubusercontent.com/iddan/react-spreadsheet/master/assets/logo.svg?sanitize=true" height="120">
</div>

# React Spreadsheet

Simple, customizable yet performant spreadsheet for React.

![Screenshot](https://github.com/iddan/react-spreadsheet/blob/master/assets/screenshot.png?raw=true)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fiddan%2Freact-spreadsheet.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fiddan%2Freact-spreadsheet?ref=badge_shield)
![CI](https://github.com/iddan/react-spreadsheet/workflows/CI/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/iddan/react-spreadsheet/badge.svg?branch=master)](https://coveralls.io/github/iddan/react-spreadsheet?branch=master)

```bash
npm install react-spreadsheet
```

_or_

```bash
yarn add react-spreadsheet
```

### Features

- Simple straightforward API focusing on common use cases while keeping flexibility
- Performant (yet not virtualized)
- Implements Just Components™

### [Demo](https://iddan.github.io/react-spreadsheet)

### Usage

#### Getting Started

```javascript
import React from "react";
import Spreadsheet from "react-spreadsheet";

const data = [
  [{ value: "Vanilla" }, { value: "Chocolate" }],
  [{ value: "Strawberry" }, { value: "Cookies" }],
];

const MyComponent = () => <Spreadsheet data={data} />;
```

#### Custom Components

```javascript
import React from "react";
import Spreadsheet from "react-spreadsheet";

const RangeView = ({ cell }) => (
  <input
    type="range"
    value={cell.value}
    disabled
    style={{ pointerEvents: "none" }}
  />
);

const RangeEdit = ({ cell, onChange }) => (
  <input
    type="range"
    onChange={(e) => {
      onChange({ ...cell, value: e.target.value });
    }}
    value={cell.value || 0}
    autoFocus
  />
);

const data = [
  [{ value: "Flavors" }],
  [({ value: "Vanilla" }, { value: "Chocolate" })],
  [{ value: "Strawberry" }, { value: "Cookies" }],
  [
    { value: "How much do you like ice cream?" },
    { value: 100, DataViewer: RangeView, DataEditor: RangeEdit },
  ],
];

const MyComponent = () => <Spreadsheet data={data} />;
```

### Prior Art

- [React Datasheet](https://nadbm.github.io/react-datasheet/) - Heavily inspired by, enhanced performance and API, no formulas
- [React Spreadsheet Grid](https://denisraslov.github.io/grid/) - Virtualized, lacks significant UI parts, no formulas
- [Handsonetable](https://handsontable.com/) - Virtualized, lacks dynamic customization. React Spreadsheet uses it's formulas parsing module

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fiddan%2Freact-spreadsheet.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fiddan%2Freact-spreadsheet?ref=badge_large)
