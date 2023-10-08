## Installation

To install the package, run the following

```bash
$ npm install react-drag-selection
```

```bash
$ yarn add react-drag-selection
```

## Usage

```tsx
import { DragSelection, useDragSelection } from 'react-drag-selection'

function App() {
  const { selectionProps, isSelecting, selectionAreaRef } = useDragSelection({
    onSelectionChanged: (selectionBox, newSelectedItems, setSelectedItems) => {
      // What happens when selection changes
      return
    },
    selectionEnabled: (selectionBox) => {
      // Can I actually start selecting in a particular region?
      return false
    },
  })

  return (
    // Defaults to window if not set
    <div ref={selectionAreaRef}>
      <DragSelection color='red' {...selectionProps} /> // Optionally customize the color
    </div>
  )
}
```

## Selecting items inbuilt

Selecting of items in the drag box could be done in two ways.

1. By using the onSelectionChaged method to manually compare our box to your elements bounding rect with the function `elementsIntersect`
2. By using the way we provide to select items with classname. To do this you need to do the following.

- Set the classname of the selected div to `SELECTABLE_ITEM_CLASS`

### Example

```tsx
import { DragSelection, useDragSelection, SELECTABLE_ITEM_CLASS } from 'react-drag-selection'

function App() {
  const { selectionProps, selectedItems } = useDragSelection({})

  return (
    <div>
      <DragSelection {...selectionProps} />
      {yourItems.map((item) => (
        <div key={item.id} className={SELECTABLE_ITEM_CLASS} data-selection-id='unique-identifier'></div>
      ))}
    </div>
  )
}
```

By setting the classname as `SELECTABLE_ITEM_CLASS`, you are marking the div as a selectable item. You also add `data-selection-id` to give it a unique id that will be added to the `selectedItems` array. This can all be customized in the `onSelectionChanged` method.

Similarly, to make sure you cant start drag selection from an element, simply add the `DISABLE_SELECTION_CLASS` as a classname (note you can use both classnames). This will make sure you cant start selecting from an element

## Note

This was created as an alternative to [react-drag-to-select](https://www.npmjs.com/package/react-drag-to-select) which is no longer being actively maintained
