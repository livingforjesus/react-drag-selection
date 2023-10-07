import React, {
  Dispatch,
  FC,
  memo,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
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
  readonly boxInfo: SelectionBoxInfo
  readonly selectionAreaRef: RefObject<HTMLElement>
  readonly isMouseDown: MutableRefObject<boolean>
  readonly color?: string
  readonly setBoxInfo: Dispatch<SetStateAction<SelectionBoxInfo>>
  readonly onSelectionChanged: (selectionBox: SelectionBox) => void
  readonly selectionEnabled?: (boxInfo: SelectionBoxInfo) => boolean
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
  ({ boxInfo, color, isMouseDown, selectionAreaRef, setBoxInfo, onSelectionChanged, selectionEnabled }) => {
    const dragBoxData = useMemo(() => getBoxMeta(boxInfo), [boxInfo])

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isMouseDown.current) {
          const parentComponentRect = (selectionAreaRef.current || document.body).getBoundingClientRect()
          setBoxInfo((currentBoxInfo) => {
            const newBoxInfo = {
              ...currentBoxInfo,
              currentX: e.clientX - parentComponentRect.x + window.scrollX,
              currentY: e.clientY - parentComponentRect.y + window.scrollY,
            }
            const data = getBoxMeta(newBoxInfo)

            return {
              ...newBoxInfo,
              isDragging: data.width * data.height > 10,
            }
          })
        }
      },
      [isMouseDown, selectionAreaRef, setBoxInfo],
    )

    const handleMouseDown = useCallback(
      (e: MouseEvent) => {
        setBoxInfo((currentBoxInfo) => {
          const parentComponentRect = (selectionAreaRef.current || document.body).getBoundingClientRect()
          const newBoxInfo = {
            ...currentBoxInfo,
            currentX: e.clientX - parentComponentRect.x + window.scrollX,
            currentY: e.clientY - parentComponentRect.y + window.scrollY,
            initialX: e.clientX - parentComponentRect.x + window.scrollX,
            initialY: e.clientY - parentComponentRect.y + window.scrollY,
          }
          const canSelect = selectionEnabled ? selectionEnabled?.(newBoxInfo) : true

          if (canSelect) {
            e.preventDefault()
            isMouseDown.current = true
            return newBoxInfo
          }

          isMouseDown.current = false
          return currentBoxInfo
        })
      },
      [isMouseDown, selectionAreaRef, selectionEnabled, setBoxInfo],
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
      const wrapperElement = (selectionAreaRef.current || window) as HTMLElement

      wrapperElement.addEventListener('pointermove', handleMouseMove)
      wrapperElement.addEventListener('pointerdown', handleMouseDown)
      window.addEventListener('pointerup', handleMouseUp)

      return () => {
        wrapperElement.removeEventListener('pointermove', handleMouseMove)
        wrapperElement.removeEventListener('pointerdown', handleMouseDown)
        window.removeEventListener('pointerup', handleMouseUp)
      }
    }, [boxInfo, handleMouseDown, handleMouseMove, handleMouseUp, selectionAreaRef, selectionEnabled, setBoxInfo])

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
