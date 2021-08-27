---
id: usage
title: Usage
---

# Usage

## Simple

The Spreadsheet component requires the `data` property: an array of arrays with objects that has the `value` key. Changes made in the Spreadsheet will not affect the passed data array as in React props values should not be mutated.

:::caution
If `data` prop value is changed the component will discard any changes made by the user. If you want to make changes to `data` and incorporate the user's changes see [Controlled](#Controlled).
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

## Controlled

The Spreadsheet component accepts `onChange` prop that is called every time one of the Spreadsheet's cell is changed by the user. You can use it to save the modified data and to react to changes (e.g. validating the modified data, further modify it, persist it).

```javascript
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const [data, setData] = useState([
    [{ value: "Vanilla" }, { value: "Chocolate" }],
    [{ value: "Strawberry" }, { value: "Cookies" }],
  ]);
  return <Spreadsheet data={data} onChange={setData} />;
};
```
