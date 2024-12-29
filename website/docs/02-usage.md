---
id: usage
title: Usage
---

# Usage

## Simple

The Spreadsheet component requires the `data` property: an array of arrays with objects that have the `value` key. Changes made in the Spreadsheet will not affect the passed data array as in React props values should not be mutated.

:::caution
If the `data` prop value is changed the component will discard any changes made by the user. If you want to make changes to `data` and incorporate the user's changes see [Controlled](#controlled).
:::

```javascript
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const data = [
    [{ value: "Vanilla" }, { value: "Chocolate" }],
    [{ value: "Strawberry" }, { value: "Cookies" }],
  ];
  return <Spreadsheet data={data} />;
};
```

## Custom Columns and Rows

The Spreadsheet component accepts the `columnLabels` or `rowLabels` props, both of which accept arrays. If no `columnLabels` are supplied, alphabetical labels are used, and row index labels are used if no `rowLabels` are passed.

```javascript
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const columnLabels = ["Flavour", "Food"];
  const rowLabels = ["Item 1", "Item 2"];
  const data = [
    [{ value: "Vanilla" }, { value: "Chocolate" }],
    [{ value: "Strawberry" }, { value: "Cookies" }],
  ];
  return (
    <Spreadsheet
      data={data}
      columnLabels={columnLabels}
      rowLabels={rowLabels}
    />
  );
};
```

## Readonly Cells

Any particular Spreadsheet cell can be set to read-only by just specifying `readOnly: true` in the cell along with the value.

```javascript
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const data = [
    [{ value: "Vanilla" }, { value: "Chocolate", readOnly: true }],
    [{ value: "Strawberry" }, { value: "Cookies", readOnly: true }],
  ];
  return <Spreadsheet data={data} />;
};
```

## Controlled

The Spreadsheet component accepts the `onChange` prop that is called every time one of the Spreadsheet's cells is changed by the user. You can use it to save the modified data and to react to changes (e.g. validating the modified data, further modifying it, persisting it).

JavaScript (See TypeScript example below):

```javascript
import { useState } from "react";
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const [data, setData] = useState([
    [{ value: "Vanilla" }, { value: "Chocolate" }, { value: "" }],
    [{ value: "Strawberry" }, { value: "Cookies" }, { value: "" }],
  ]);
  return <Spreadsheet data={data} onChange={setData} />;
};
```

TypeScript:

```typescript
import { useState } from "react";
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const [data, setData] = useState<Matrix<CellBase>>([
    [{ value: "Vanilla" }, { value: "Chocolate" }, { value: "" }],
    [{ value: "Strawberry" }, { value: "Cookies" }, { value: "" }],
  ]);
  return <Spreadsheet data={data} onChange={setData} />;
};
```
