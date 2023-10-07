import { RefObject, useEffect, useRef, useState } from 'react'

import { DragSelectionProps, SelectionBox, SelectionBoxInfo } from './DragSelection'

interface UseDragSelectionProps {
  onSelectionChanged: (selectionBox: SelectionBox) => void
  selectionEnabled?: (boxInfo: SelectionBoxInfo) => boolean
  disableDragging?: boolean
}

interface DragSelectionResponse {
  selectionProps: DragSelectionProps
  isSelecting: boolean
  selectionAreaRef: RefObject<HTMLDivElement | null>
}

export default function useDragSelection({
  onSelectionChanged,
  selectionEnabled,
  disableDragging,
}: UseDragSelectionProps): DragSelectionResponse {
  const [boxInfo, setBoxInfo] = useState<SelectionBoxInfo>({
    currentX: -1,
    currentY: -1,
    initialX: 0,
    initialY: 0,
    isDragging: false,
  })
  const selectionAreaRef = useRef<HTMLDivElement>(null)
  const isMouseDown = useRef<boolean>(false)

  useEffect(() => {
    if (disableDragging) {
      setBoxInfo({ ...boxInfo, isDragging: false })
    }
  }, [boxInfo, disableDragging])

  return {
    isSelecting: boxInfo.isDragging,
    selectionAreaRef,
    selectionProps: {
      boxInfo,
      isMouseDown,
      onSelectionChanged,
      selectionAreaRef,
      selectionEnabled,
      setBoxInfo,
    },
  }
}
