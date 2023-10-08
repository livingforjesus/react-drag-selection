import { DragSelection, SELECTABLE_ITEM_CLASS, useDragSelection } from 'react-drag-selection'

function App() {
  const { selectionProps, selectedItems } = useDragSelection({})

  return (
    <div
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
          <div
            className={SELECTABLE_ITEM_CLASS}
            data-selection-id={i}
            style={{
              width: 100,
              height: 100,
              border: '1px solid black',
              background: selectedItems.includes(String(i)) ? '#ff000f' : undefined,
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
