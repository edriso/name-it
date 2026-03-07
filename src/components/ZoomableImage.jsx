import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

function ImageViewer({ src, alt, onClose }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // ESC to close
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const clamp = useCallback((x, y, s) => {
    if (s <= 1) return { x: 0, y: 0 }
    const img = imgRef.current
    if (!img) return { x, y }
    const rect = img.getBoundingClientRect()
    const imgW = rect.width / s
    const imgH = rect.height / s
    const maxX = (imgW * (s - 1)) / 2
    const maxY = (imgH * (s - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  function handleWheel(e) {
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    setScale((s) => {
      const next = Math.max(1, Math.min(6, s + delta))
      setTranslate((t) => clamp(t.x, t.y, next))
      return next
    })
  }

  function handlePointerDown(e) {
    if (e.button !== 0) return
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
    setTranslate(clamp(
      translateStart.current.x + dx,
      translateStart.current.y + dy,
      scale,
    ))
  }

  function handlePointerUp() {
    setDragging(false)
  }

  function handleDoubleClick(e) {
    e.stopPropagation()
    if (scale > 1) {
      setScale(1)
      setTranslate({ x: 0, y: 0 })
    } else {
      setScale(3)
    }
  }

  function zoomIn() {
    setScale((s) => {
      const next = Math.min(6, s + 0.5)
      setTranslate((t) => clamp(t.x, t.y, next))
      return next
    })
  }

  function zoomOut() {
    setScale((s) => {
      const next = Math.max(1, s - 0.5)
      setTranslate((t) => clamp(t.x, t.y, next))
      return next
    })
  }

  function resetZoom() {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-gray-400">{alt}</p>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex flex-1 items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
            cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-sm">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-30"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="min-w-[3.5rem] px-2 text-sm font-medium text-gray-300 tabular-nums transition-colors hover:text-white"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 6}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}

export default function ZoomableImage({ src, alt, className = '' }) {
  const [open, setOpen] = useState(false)
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <div
        className={`group relative cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full select-none object-contain"
        />
        {/* Expand hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="rounded-full bg-black/60 p-3 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-white">
              <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM12.22 13.28l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 00-1.06 1.06zM3.5 4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V4.56z" />
            </svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && <ImageViewer src={src} alt={alt} onClose={handleClose} />}
      </AnimatePresence>
    </>
  )
}
