---
id: formula-parser
title: Formula Parser
---

# Formula Parser

## Default

By default, a regular formula parser (based on [Fast Formula Parser](https://github.com/LesterLyu/fast-formula-parser)) is created.
With this come all the formulas and implementations from the Fast Formula Parser.

## Custom formula parser

It is possible to pass a construction function for a formula parser to the SpreadSheet component by assigning it to the `parserConstructor` prop.
This should be an implementation of the FormulaParser as defined in the Fast Formula Parser library, hence this library should be added as dependency.
The `react-spreadsheet` library also exposes a function `createBoundFormulaParser` to quickly create the implementation as used by default.

## Overriding formulas

The Fast Formula Parser library allows overriding of the formulas as implemented.
To leverage this, one could for example disable the `SUM` function as follows.
```javascript
import Spreadsheet, {createBoundFormulaParser} from "react-spreadsheet";
const App = () => {
    function parserConstructor(getData) {
        return createBoundFormulaParser(getData, {SUM: undefined});
    }
    return <Spreadsheet data={[]} parserConstructor={parserConstructor}/>;
};
```