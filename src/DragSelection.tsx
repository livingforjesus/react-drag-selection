import _ from 'lodash'
import React, {
  Dispatch,
  FC,
  memo,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import elementsIntersect from './elementsIntersect'
import { DISABLE_SELECTION_CLASS, SELECTABLE_ITEM_CLASS } from './useDragSelection'

export interface SelectionBoxInfo {
  initialX: number
  initialY: number
  currentX: number
  currentY: number
  isDragging: boolean
}

export interface SelectionBox {
  top: number
  left: number
  width: number
  height: number
}

export interface DragSelectionProps {
  readonly parentElement: HTMLElement | null
  readonly isMouseDown: MutableRefObject<boolean>
  readonly color?: string
  selectedItems: string[]
  isDragging: boolean
  setSelectedItems: Dispatch<SetStateAction<string[]>>
  setIsDragging: Dispatch<SetStateAction<boolean>>
  readonly onSelectionChanged?: (
    selectionBox: SelectionBox,
    selectedItems: string[],
    setSelectedItems: Dispatch<SetStateAction<string[]>>,
  ) => void
  onSelectedItemsChanged?: (selectedItems: string[], setSelectedItems: Dispatch<SetStateAction<string[]>>) => void
  readonly selectionEnabled?: (selectionBox: SelectionBox) => boolean
}

const getBoxMeta = (boxInfo: SelectionBoxInfo) => {
  const width = Math.abs(boxInfo.initialX - boxInfo.currentX)
  const height = Math.abs(boxInfo.initialY - boxInfo.currentY)

  return {
    height,
    left: Math.min(boxInfo.initialX, boxInfo.currentX),
    top: Math.min(boxInfo.initialY, boxInfo.currentY),
    width,
  }
}

export const DragSelection: FC<DragSelectionProps> = memo(
  ({
    isDragging,
    color,
    selectedItems,
    setSelectedItems,
    isMouseDown,
    parentElement,
    setIsDragging,
    onSelectedItemsChanged,
    onSelectionChanged,
    selectionEnabled,
  }) => {
    const [scrollInfo, setScrollInfo] = useState<{ scrollX: number; scrollY: number }>({ scrollX: 0, scrollY: 0 })
    const [boxInfo, setBoxInfo] = useState<SelectionBoxInfo>({
      currentX: -1,
      currentY: -1,
      initialX: 0,
      initialY: 0,
      isDragging: false,
    })
    const dragBoxData = useMemo(() => getBoxMeta(boxInfo), [boxInfo])
    const selectionEnabledComponent = useCallback(
      (selectionBox: SelectionBox) => {
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
            left: left - parentRect.left + scrollInfo.scrollX,
            top: top - parentRect.top + scrollInfo.scrollY,
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
      [parentElement, selectionEnabled, scrollInfo],
    )

    useEffect(() => {
      if (boxInfo.isDragging !== isDragging) setIsDragging(boxInfo.isDragging)
    }, [boxInfo, setIsDragging])

    useEffect(() => {
      setScrollInfo({
        scrollX: parentElement ? 0 : window.scrollX,
        scrollY: parentElement ? 0 : window.scrollY,
      })
    }, [parentElement])

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isMouseDown.current) {
          const parentComponentRect = parentElement?.getBoundingClientRect() || {
            x: 0,
            y: 0,
          }
          setBoxInfo((currentBoxInfo) => {
            const newBoxInfo = {
              ...currentBoxInfo,
              currentX: e.clientX - parentComponentRect.x + scrollInfo.scrollX,
              currentY: e.clientY - parentComponentRect.y + scrollInfo.scrollY,
            }
            const data = getBoxMeta(newBoxInfo)

            return {
              ...newBoxInfo,
              isDragging: data.width * data.height > 10,
            }
          })
        }
      },
      [isMouseDown, parentElement, scrollInfo],
    )

    const handleMouseDown = useCallback(
      (e: MouseEvent) => {
        setBoxInfo((currentBoxInfo) => {
          const parentComponentRect = parentElement?.getBoundingClientRect() || {
            x: 0,
            y: 0,
          }
          const newBoxInfo = {
            ...currentBoxInfo,
            currentX: e.clientX - parentComponentRect.x + scrollInfo.scrollX,
            currentY: e.clientY - parentComponentRect.y + scrollInfo.scrollY,
            initialX: e.clientX - parentComponentRect.x + scrollInfo.scrollX,
            initialY: e.clientY - parentComponentRect.y + scrollInfo.scrollY,
          }
          const canSelect = selectionEnabledComponent(getBoxMeta(newBoxInfo))

          if (canSelect) {
            e.preventDefault()
            isMouseDown.current = true
            return newBoxInfo
          }

          isMouseDown.current = false
          return currentBoxInfo
        })
      },
      [isMouseDown, parentElement, scrollInfo, selectionEnabledComponent],
    )

    const handleMouseUp = useCallback(() => {
      isMouseDown.current = false
      setBoxInfo((currentBoxInfo) => ({
        ...currentBoxInfo,
        initialX: -1,
        initialY: -1,
        isDragging: false,
      }))
    }, [isMouseDown, setBoxInfo])

    useEffect(() => {
      const wrapperElement = (parentElement || window) as HTMLElement

      wrapperElement.addEventListener('pointermove', handleMouseMove)
      wrapperElement.addEventListener('pointerdown', handleMouseDown)
      window.addEventListener('pointerup', handleMouseUp)

      return () => {
        wrapperElement.removeEventListener('pointermove', handleMouseMove)
        wrapperElement.removeEventListener('pointerdown', handleMouseDown)
        window.removeEventListener('pointerup', handleMouseUp)
      }
    }, [boxInfo, handleMouseDown, handleMouseMove, handleMouseUp, parentElement, selectionEnabled, setBoxInfo])

    useEffect(() => {
      if (boxInfo.isDragging) {
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
            left: left - parentRect.left + scrollInfo.scrollX,
            top: top - parentRect.top + scrollInfo.scrollY,
            width,
          }

          if (elementsIntersect(itemPos, dragBoxData)) {
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
        onSelectionChanged?.(dragBoxData, newSelectedItems, setSelectedItems)
      }
    }, [
      onSelectionChanged,
      boxInfo,
      dragBoxData,
      parentElement,
      selectedItems,
      setSelectedItems,
      scrollInfo,
      onSelectedItemsChanged,
    ])

    return boxInfo.isDragging ? (
      <div
        style={{
          height: dragBoxData.height,
          left: dragBoxData.left,
          position: 'absolute',
          backgroundColor: color || 'rgba(155, 193, 239, 0.4)',
          top: dragBoxData.top,
          width: dragBoxData.width,
          zIndex: 100,
        }}
      />
    ) : null
  },
)
DragSelection.displayName = 'DragSelection'

export { default as elementsIntersect } from './elementsIntersect'
