import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

import { DragSelectionProps, SelectionBox, SelectionBoxInfo, elementsIntersect } from './DragSelection'

interface UseDragSelectionProps {
  onSelectionChanged?: (
    selectionBox: SelectionBox,
    selectedItems: string[],
    setSelectedItems: Dispatch<SetStateAction<string[]>>,
  ) => void
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
  disableDragging,
}: UseDragSelectionProps): DragSelectionResponse {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [boxInfo, setBoxInfo] = useState<SelectionBoxInfo>({
    currentX: -1,
    currentY: -1,
    initialX: 0,
    initialY: 0,
    isDragging: false,
  })
  const [parentElement, setParentElement] = useState<HTMLDivElement | null>(null)
  const isMouseDown = useRef<boolean>(false)
  const getScrollInfo = useCallback(
    () => ({
      scrollX: parentElement ? 0 : window.scrollX,
      scrollY: parentElement ? 0 : window.scrollY,
    }),
    [parentElement],
  )
  const selectionAreaRef = useCallback((node: HTMLDivElement) => {
    setParentElement(node)
  }, [])

  useEffect(() => {
    if (disableDragging) {
      setBoxInfo({ ...boxInfo, isDragging: false })
    }
  }, [boxInfo, disableDragging])

  useEffect(() => {
    if (parentElement) {
      parentElement.style.position = 'relative'
    }
  }, [parentElement])

  return {
    isSelecting: boxInfo.isDragging,
    selectedItems,
    selectionAreaRef,
    selectionProps: {
      boxInfo,
      isMouseDown,
      onSelectionChanged: (selectionBox) => {
        const newSelectedItems: string[] = []
        const selectableElements = (parentElement || document).querySelectorAll(`.${SELECTABLE_ITEM_CLASS}`)
        selectableElements.forEach((item) => {
          const { left, top, width, height } = item.getBoundingClientRect()
          const parentRect = parentElement?.getBoundingClientRect() || {
            left: 0,
            top: 0,
          }
          const itemPos = {
            height,
            left: left - parentRect.left + getScrollInfo().scrollX,
            top: top - parentRect.top + getScrollInfo().scrollY,
            width,
          }

          if (elementsIntersect(itemPos, selectionBox)) {
            const selectedId = item.getAttribute('data-selection-id')
            if (selectedId) {
              newSelectedItems.push(selectedId)
            }
          }
        })

        setSelectedItems(newSelectedItems)
        onSelectionChanged?.(selectionBox, newSelectedItems, setSelectedItems)
      },
      parentElement,
      selectionEnabled: (selectionBox) => {
        const selectableElements = (parentElement || document).querySelectorAll(`.${DISABLE_SELECTION_CLASS}`)
        const pointInfo: SelectionBox = {
          height: 0.01,
          left: selectionBox.left,
          top: selectionBox.top,
          width: 0.01,
        }

        for (const item of Array.from(selectableElements)) {
          const { left, top, width, height } = item.getBoundingClientRect()
          const parentRect = parentElement?.getBoundingClientRect() || {
            left: 0,
            top: 0,
          }
          const itemPos = {
            height,
            left: left - parentRect.left + getScrollInfo().scrollX,
            top: top - parentRect.top + getScrollInfo().scrollY,
            width,
          }

          if (elementsIntersect(itemPos, pointInfo)) {
            return false
          }
        }

        if (selectionEnabled) {
          return selectionEnabled(selectionBox)
        }

        return true
      },
      setBoxInfo,
    },
  }
}
