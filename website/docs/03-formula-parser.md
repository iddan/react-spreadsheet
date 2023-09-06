---
id: formula-parser
title: Formula Parser
---

# Formula Parser

## Default

By default, a regular formula parser (based on [Fast Formula Parser](https://github.com/LesterLyu/fast-formula-parser)) is created.
With this come all the formulas and implementations from the Fast Formula Parser.

## Custom formula parser

It is possible to pass a construction function for a formula parser to the `<Spreadsheet />` component by assigning it to the `createFormulaParser` prop. This should be an implementation of the FormulaParser as defined in the Fast Formula Parser library, hence this library should be added as dependency. The`react-spreadsheet` library also exposes a function `createFormulaParser` to quickly create the implementation as used by default.

## Overriding formulas

The Fast Formula Parser library allows overriding of the formulas as implemented.
To leverage this, one could for example disable the `SUM` function as follows.

```javascript
import Spreadsheet, {
  createFormulaParser,
  Matrix,
  CellBase,
} from "react-spreadsheet";

const customCreateFormulaParser = (data: Matrix<CellBase>) =>
  createFormulaParser(data, { SUM: undefined });

const MyComponent = () => {
  return (
    <Spreadsheet data={[]} createFormulaParser={customCreateFormulaParser} />
  );
};
```
