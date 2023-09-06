---
id: contributing
title: Contributing
---

# Contributing

### Project Structure

- `src/index.ts` - The entry point for the library, exports all the public API.
- `src/Spreadsheet.tsx` - The main component for the library.
- `src/engine`- The spreadsheet formula evaluation engine for the library.

### State management

The component's state is managed in a single reducer defined in `src/reducer.ts` and the actions are defined in `src/actions.ts`.
The state is passed to the other components using context (defined in `src/context.ts`), specifically using [use-context-selector](https://github.com/dai-shi/use-context-selector) to select the required state from the context and avoid unnecessary re-renders.

### Main data structures

- `Matrix` - Represents a 2D matrix of cells, used for the spreadsheet data.
- `PointRange` - Represents a range in the spreadsheet.
- `Selection` - Represents a rectangular selection of cells.
- `CellBase` - Represents a single cell in the spreadsheet.
- `Model` - Represents the spreadsheet data and the evaluated formulae cells.
- `PointSet` - Represents a set of points in the spreadsheet. Used for formulae evaluation only.

### Stories

The component is interactively tested with [Storybook](https://storybook.js.org/). The stories are defined in `src/stories/`.

### Components

As the Spreadsheet component allows customizing all the components used in the spreadsheet. For instance `src/Table.tsx` can be overridden with a component from the outside. That's why the props for the components are imported for `src/types.ts`, so their API will be stable and well defined.
