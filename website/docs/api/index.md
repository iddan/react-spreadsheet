---
id: "index"
title: "react-spreadsheet"
slug: "/api"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Namespaces

- [DataEditor](namespaces/DataEditor.md)
- [default](namespaces/default.md)

## References

### Spreadsheet

Renames and exports: [default](index.md#default)

## Type aliases

### CellBase

Ƭ **CellBase**<`Value`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Value` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DataEditor?` | [`DataEditorComponent`](index.md#dataeditorcomponent)<[`CellBase`](index.md#cellbase)<`Value`\>\> |
| `DataViewer?` | [`DataViewerComponent`](index.md#dataviewercomponent)<[`CellBase`](index.md#cellbase)<`Value`\>\> |
| `className?` | `string` |
| `readOnly?` | `boolean` |
| `value` | `Value` |

#### Defined in

[types.ts:13](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L13)

___

### CellComponent

Ƭ **CellComponent**<`Cell`\>: `ComponentType`<[`CellComponentProps`](index.md#cellcomponentprops)<`Cell`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase)[`CellBase`](index.md#cellbase) |

#### Defined in

[types.ts:88](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L88)

___

### CellComponentProps

Ƭ **CellComponentProps**<`Cell`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DataViewer` | [`DataViewerComponent`](index.md#dataviewercomponent)<`Cell`\> |
| `active` | `boolean` |
| `column` | `number` |
| `copied` | `boolean` |
| `data` | `Cell` \| `undefined` |
| `dragging` | `boolean` |
| `formulaParser` | `FormulaParser` |
| `mode` | `Mode` |
| `row` | `number` |
| `selected` | `boolean` |
| `activate` | (`cellPointer`: `Point`) => `void` |
| `select` | (`cellPointer`: `Point`) => `void` |
| `setCellDimensions` | (`point`: `Point`, `dimensions`: `Dimensions`) => `void` |

#### Defined in

[types.ts:72](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L72)

___

### DataEditorComponent

Ƭ **DataEditorComponent**<`Cell`\>: `ComponentType`<[`DataEditorProps`](index.md#dataeditorprops)<`Cell`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase)[`CellBase`](index.md#cellbase) |

#### Defined in

[types.ts:109](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L109)

___

### DataEditorProps

Ƭ **DataEditorProps**<`Cell`\>: `DataComponentProps`<`Cell`\> & { `onChange`: (`cell`: `Cell`) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase) |

#### Defined in

[types.ts:104](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L104)

___

### DataViewerComponent

Ƭ **DataViewerComponent**<`Cell`\>: `ComponentType`<[`DataViewerProps`](index.md#dataviewerprops)<`Cell`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase)[`CellBase`](index.md#cellbase) |

#### Defined in

[types.ts:101](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L101)

___

### DataViewerProps

Ƭ **DataViewerProps**<`Cell`\>: `DataComponentProps`<`Cell`\> & { `formulaParser`: `FormulaParser`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase) |

#### Defined in

[types.ts:96](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/types.ts#L96)

___

### Matrix

Ƭ **Matrix**<`T`\>: (`T` \| `undefined`)[][]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[matrix.ts:7](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/matrix.ts#L7)

___

### Props

Ƭ **Props**<`CellType`\>: `Omit`<`SpreadsheetProps`<`CellType`\>, ``"store"``\> & { `data`: [`Matrix`](index.md#matrix)<`CellType`\> ; `onActivate`: (`active`: `Point`) => `void` ; `onCellCommit`: (`prevCell`: ``null`` \| `CellType`, `nextCell`: ``null`` \| `CellType`, `coords`: ``null`` \| `Point`) => `void` ; `onChange`: (`data`: [`Matrix`](index.md#matrix)<`CellType`\>) => `void` ; `onModeChange`: (`mode`: `Mode`) => `void` ; `onSelect`: (`selected`: `Point`[]) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `CellType` | extends [`CellBase`](index.md#cellbase) |

#### Defined in

[SpreadsheetStateProvider.tsx:13](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/SpreadsheetStateProvider.tsx#L13)

## Variables

### DataEditor

• `Const` **DataEditor**: `Object`

#### Call signature

▸ (`__namedParameters`): `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DataEditorProps`](index.md#dataeditorprops)<`Cell`\> |

##### Returns

`ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultProps` | `Object` |
| `defaultProps.cell` | `Object` |
| `defaultProps.cell.value` | `string` |

#### Defined in

[DataEditor.tsx:9](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/DataEditor.tsx#L9)

___

### default

• `Const` **default**: `Object`

#### Call signature

▸ <`CellType`\>(`props`): `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `CellType` | extends [`CellBase`](index.md#cellbase)<`any`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`Props`](index.md#props)<`CellType`\> |

##### Returns

`ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultProps` | `Object` |
| `defaultProps.onActivate` | () => `void` |
| `defaultProps.onCellCommit` | () => `void` |
| `defaultProps.onChange` | () => `void` |
| `defaultProps.onModeChange` | () => `void` |
| `defaultProps.onSelect` | () => `void` |

#### Defined in

[SpreadsheetStateProvider.tsx:50](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/SpreadsheetStateProvider.tsx#L50)

## Functions

### DataViewer

▸ `Const` **DataViewer**<`Cell`\>(`__namedParameters`): `ReactNode`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase)<`any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DataViewerProps`](index.md#dataviewerprops)<`Cell`\> |

#### Returns

`ReactNode`

#### Defined in

[DataViewer.tsx:15](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/DataViewer.tsx#L15)

___

### createEmptyMatrix

▸ **createEmptyMatrix**<`T`\>(`rows`, `columns`): [`Matrix`](index.md#matrix)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `rows` | `number` |
| `columns` | `number` |

#### Returns

[`Matrix`](index.md#matrix)<`T`\>

#### Defined in

[util.ts:78](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/util.ts#L78)

___

### getComputedValue

▸ **getComputedValue**<`Cell`, `Value`\>(`__namedParameters`): `Value` \| `string` \| `number` \| `boolean` \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cell` | extends [`CellBase`](index.md#cellbase)<`Value`\> |
| `Value` | `Value` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.cell` | `Cell` \| `undefined` |
| `__namedParameters.formulaParser` | `FormulaParser` |

#### Returns

`Value` \| `string` \| `number` \| `boolean` \| ``null``

#### Defined in

[util.ts:115](https://github.com/iddan/react-spreadsheet/blob/75ab97e/src/util.ts#L115)
