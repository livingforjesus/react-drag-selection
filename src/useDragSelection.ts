import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'

import { DragSelectionProps, SelectionBox } from './DragSelection'

interface UseDragSelectionProps {
  onSelectionChanged?: (
    selectionBox: SelectionBox,
    selectedItems: string[],
    setSelectedItems: Dispatch<SetStateAction<string[]>>,
  ) => void
  onSelectedItemsChanged?: (selectedItems: string[], setSelectedItems: Dispatch<SetStateAction<string[]>>) => void
  selectionEnabled?: (boxInfo: SelectionBox) => boolean
  disableDragging?: boolean
}

interface DragSelectionResponse {
  selectionProps: DragSelectionProps
  isSelecting: boolean
  selectedItems: string[]
  selectionAreaRef: (node: HTMLDivElement) => void
}

export const SELECTABLE_ITEM_CLASS = 'drag-selectable-item'
export const DISABLE_SELECTION_CLASS = 'disable-drag-selection'

export default function useDragSelection({
  onSelectionChanged,
  selectionEnabled,
  onSelectedItemsChanged,
}: UseDragSelectionProps): DragSelectionResponse {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [parentElement, setParentElement] = useState<HTMLDivElement | null>(null)
  const isMouseDown = useRef<boolean>(false)

  const selectionAreaRef = useCallback(
    (node: HTMLDivElement) => {
      setParentElement(node)
      if (node && node.style) {
        node.style.position = 'relative'
      }
    },
    [setParentElement],
  )

  return {
    isSelecting: isDragging,
    selectedItems,
    selectionAreaRef,
    selectionProps: {
      isDragging,
      isMouseDown,
      onSelectionChanged,
      onSelectedItemsChanged,
      selectedItems,
      setSelectedItems,
      parentElement,
      selectionEnabled,
      setIsDragging,
    },
  }
}
