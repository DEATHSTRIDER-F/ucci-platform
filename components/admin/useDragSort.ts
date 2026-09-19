'use client'

import { useState, useCallback } from 'react'

/**
 * Native HTML5 drag-and-drop reorder state. No external deps.
 * Usage: spread `rowProps(index)` onto each draggable row/handle container.
 */
export function useDragSort<T>(items: T[], onReorder: (next: T[]) => void) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const onDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    // Required for Firefox to fire drag events
    e.dataTransfer.setData('text/plain', String(index))
    setDragIdx(index)
  }, [])

  const onDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (index !== overIdx) setOverIdx(index)
    },
    [overIdx]
  )

  const onDrop = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault()
      const from = dragIdx ?? Number(e.dataTransfer.getData('text/plain'))
      if (Number.isNaN(from) || from === index) {
        setDragIdx(null)
        setOverIdx(null)
        return
      }
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(index, 0, moved)
      setDragIdx(null)
      setOverIdx(null)
      onReorder(next)
    },
    [dragIdx, items, onReorder]
  )

  const onDragEnd = useCallback(() => {
    setDragIdx(null)
    setOverIdx(null)
  }, [])

  const rowProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: onDragStart(index),
      onDragOver: onDragOver(index),
      onDrop: onDrop(index),
      onDragEnd,
      'data-dragging': dragIdx === index,
      'data-dragover': overIdx === index && dragIdx !== index,
    }),
    [onDragStart, onDragOver, onDrop, onDragEnd, dragIdx, overIdx]
  )

  return { dragIdx, overIdx, rowProps }
}

/** Highlight classes for a draggable row while dragging / hovered as drop target. */
export function dragRowClass(dragging: boolean, dragover: boolean): string {
  if (dragging) return 'opacity-40'
  if (dragover) return 'outline outline-2 outline-brand-gold/60 outline-offset-[-2px]'
  return ''
}
