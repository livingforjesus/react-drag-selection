import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react'

import { DragSelectionProps, SelectionBox, elementsIntersect } from './DragSelection'
import _ from 'lodash'

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
  const parentElement = useRef<HTMLDivElement | null>(null)
  const isMouseDown = useRef<boolean>(false)
  const getScrollInfo = useCallback(
    () => ({
      scrollX: parentElement.current ? 0 : window.scrollX,
      scrollY: parentElement.current ? 0 : window.scrollY,
    }),
    [],
  )
  const selectionAreaRef = useCallback((node: HTMLDivElement) => {
    parentElement.current = node
    if (node && node.style) {
      node.style.position = 'relative'
    }
  }, [])
  const onSelectionChangedComponent = useCallback(
    (selectionBox: SelectionBox) => {
      const newSelectedItems: string[] = []
      const selectableElements = (parentElement.current || document).querySelectorAll(`.${SELECTABLE_ITEM_CLASS}`)
      selectableElements.forEach((item) => {
        const { left, top, width, height } = item.getBoundingClientRect()
        const parentRect = parentElement.current?.getBoundingClientRect() || {
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

      if (!_.isEqual(newSelectedItems, selectedItems)) {
        setSelectedItems(newSelectedItems)
        onSelectedItemsChanged?.(newSelectedItems, setSelectedItems)
      }
      onSelectionChanged?.(selectionBox, newSelectedItems, setSelectedItems)
    },
    [getScrollInfo, onSelectedItemsChanged, onSelectionChanged, parentElement, selectedItems],
  )
  const selectionEnabledComponent = useCallback(
    (selectionBox: SelectionBox) => {
      const selectableElements = (parentElement.current || document).querySelectorAll(`.${DISABLE_SELECTION_CLASS}`)
      const pointInfo: SelectionBox = {
        height: 0.01,
        left: selectionBox.left,
        top: selectionBox.top,
        width: 0.01,
      }

      for (const item of Array.from(selectableElements)) {
        const { left, top, width, height } = item.getBoundingClientRect()
        const parentRect = parentElement.current?.getBoundingClientRect() || {
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
    [getScrollInfo, parentElement, selectionEnabled],
  )

  return {
    isSelecting: isDragging,
    selectedItems,
    selectionAreaRef,
    selectionProps: {
      isMouseDown,
      onSelectionChanged: onSelectionChangedComponent,
      parentElement: parentElement.current,
      selectionEnabled: selectionEnabledComponent,
      setIsDragging,
    },
  }
}
