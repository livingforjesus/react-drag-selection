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
    onSelectionChanged: (selectionBox) => {
      // What happens when selection changes
      return
    },
    selectionEnabled: (selectionBox) => {
      // Can I actually start selecting in a particular region?
      return false
    },
  })

  return (
    <div ref={selectionAreaRef}>
      {' '}
      {/* Defaults to window if not set */}
      <DragSelection color='red' {...selectionProps} /> {/* Optionally customize the color */}
    </div>
  )
}
```

## Note

This was created as an alternative to [react-drag-to-select](https://www.npmjs.com/package/react-drag-to-select) which is no longer being actively maintained
