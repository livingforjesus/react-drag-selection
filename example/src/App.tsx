import { DragSelection, useDragSelection } from 'react-drag-selection'

function App() {
  const { selectionProps } = useDragSelection({
    onSelectionChanged: () => {
      return
    },
  })

  return (
    <div>
      <DragSelection {...selectionProps} />
    </div>
  )
}

export default App
