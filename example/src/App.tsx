import { DISABLE_SELECTION_CLASS, DragSelection, SELECTABLE_ITEM_CLASS, useDragSelection } from 'react-drag-selection'

interface GridItemProps {
  i: number
  selected: boolean
}

function GridItem({ i, selected }: GridItemProps) {
  console.log(i)

  return (
    <div
      className={`${SELECTABLE_ITEM_CLASS} ${DISABLE_SELECTION_CLASS}`}
      data-selection-id={i}
      key={i}
      style={{
        width: 100,
        height: 100,
        border: '1px solid black',
        background: selected ? '#ff000f' : undefined,
      }}
    >
      {i}
    </div>
  )
}

function App() {
  const { selectionProps, selectedItems, selectionAreaRef } = useDragSelection({})

  return (
    <div
      ref={selectionAreaRef}
      style={{
        width: 900,
      }}
    >
      <DragSelection {...selectionProps} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          padding: 50,
        }}
      >
        {[...Array(100)].map((_, i) => (
          <GridItem i={i} selected={selectedItems.includes(String(i))} />
        ))}
      </div>
    </div>
  )
}

export default App
