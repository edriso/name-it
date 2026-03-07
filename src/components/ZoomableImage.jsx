import { useState, useRef, useCallback } from 'react'

export default function ZoomableImage({ src, alt, className = '' }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })

  const clampTranslate = useCallback((x, y, s) => {
    if (s <= 1) return { x: 0, y: 0 }
    const container = containerRef.current
    if (!container) return { x, y }
    const rect = container.getBoundingClientRect()
    const maxX = (rect.width * (s - 1)) / 2
    const maxY = (rect.height * (s - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  function handleWheel(e) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale((s) => {
      const next = Math.max(1, Math.min(5, s + delta))
      if (next <= 1) setTranslate({ x: 0, y: 0 })
      else setTranslate((t) => clampTranslate(t.x, t.y, next))
      return next
    })
  }

  function handlePointerDown(e) {
    if (scale <= 1) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    translateStart.current = { ...translate }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setTranslate(
      clampTranslate(translateStart.current.x + dx, translateStart.current.y + dy, scale),
    )
  }

  function handlePointerUp(e) {
    setDragging(false)
    containerRef.current?.releasePointerCapture(e.pointerId)
  }

  function handleDoubleClick() {
    if (scale > 1) {
      setScale(1)
      setTranslate({ x: 0, y: 0 })
    } else {
      setScale(2.5)
    }
  }

  function zoomIn() {
    setScale((s) => Math.min(5, s + 0.5))
  }

  function zoomOut() {
    setScale((s) => {
      const next = Math.max(1, s - 0.5)
      if (next <= 1) setTranslate({ x: 0, y: 0 })
      else setTranslate((t) => clampTranslate(t.x, t.y, next))
      return next
    })
  }

  function resetZoom() {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`overflow-hidden ${className}`}
        style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full object-contain transition-transform duration-150 select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 p-1 backdrop-blur-sm">
        <button
          onClick={zoomOut}
          disabled={scale <= 1}
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className="px-1.5 text-xs font-medium text-gray-300 tabular-nums transition-colors hover:text-white"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={zoomIn}
          disabled={scale >= 5}
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}
