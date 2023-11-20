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
  setIsDragging: Dispatch<SetStateAction<boolean>>
  readonly onSelectionChanged: (selectionBox: SelectionBox) => void
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
  ({ color, isMouseDown, parentElement, setIsDragging, onSelectionChanged, selectionEnabled }) => {
    const [boxInfo, setBoxInfo] = useState<SelectionBoxInfo>({
      currentX: -1,
      currentY: -1,
      initialX: 0,
      initialY: 0,
      isDragging: false,
    })
    const dragBoxData = useMemo(() => getBoxMeta(boxInfo), [boxInfo])
    const getScrollInfo = useCallback(
      () => ({
        scrollX: parentElement ? 0 : window.scrollX,
        scrollY: parentElement ? 0 : window.scrollY,
      }),
      [],
    )

    useEffect(() => {
      setIsDragging(boxInfo.isDragging)
    }, [boxInfo, setIsDragging])

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
              currentX: e.clientX - parentComponentRect.x + getScrollInfo().scrollX,
              currentY: e.clientY - parentComponentRect.y + getScrollInfo().scrollY,
            }
            const data = getBoxMeta(newBoxInfo)

            return {
              ...newBoxInfo,
              isDragging: data.width * data.height > 10,
            }
          })
        }
      },
      [isMouseDown, getScrollInfo, setBoxInfo],
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
            currentX: e.clientX - parentComponentRect.x + getScrollInfo().scrollX,
            currentY: e.clientY - parentComponentRect.y + getScrollInfo().scrollY,
            initialX: e.clientX - parentComponentRect.x + getScrollInfo().scrollX,
            initialY: e.clientY - parentComponentRect.y + getScrollInfo().scrollY,
          }
          const canSelect = selectionEnabled ? selectionEnabled?.(getBoxMeta(newBoxInfo)) : true

          if (canSelect) {
            e.preventDefault()
            isMouseDown.current = true
            return newBoxInfo
          }

          isMouseDown.current = false
          return currentBoxInfo
        })
      },
      [getScrollInfo, isMouseDown, selectionEnabled, setBoxInfo],
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
    }, [boxInfo, handleMouseDown, handleMouseMove, handleMouseUp, selectionEnabled, setBoxInfo])

    useEffect(() => {
      if (boxInfo.isDragging) {
        onSelectionChanged(dragBoxData)
      }
    }, [onSelectionChanged, boxInfo, dragBoxData])

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
