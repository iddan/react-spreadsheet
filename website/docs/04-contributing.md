---
id: contributing
title: Contributing
---

# Contributing

### Perquisites

Make sure you are familiar with the following technologies:

- [TypeScript](https://www.typescriptlang.org/) - used for the library code.
- [React Hooks](https://react.dev/reference/react) - used for the library code.
- [Jest](https://jestjs.io/) - used for testing.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - used for testing.
- [Storybook](https://storybook.js.org/) - used for interactive testing.
- [Typedoc](https://typedoc.org/) - used for generating the documentation.

### Installation

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) v16 or higher.
- [Yarn](https://yarnpkg.com/) for package management

Then run:

```bash
git clone https://github.com/iddan/react-spreadsheet.git;
cd react-spreadsheet;
yarn install;
```

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

### Website

The website is built with [Docusaurus](https://docusaurus.io/) and it's code is available in `website/`. The docs are in `website/docs/` and the main configuration is in `website/docusaurus.config.js`.
