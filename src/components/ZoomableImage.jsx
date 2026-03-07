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

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Non-passive wheel listener for proper scroll prevention
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function handleWheel(e) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.3 : 0.3
      setScale((s) => Math.max(1, Math.min(6, s + delta)))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // Clamp translate when scale changes
  useEffect(() => {
    queueMicrotask(() => {
      if (scale <= 1) {
        setTranslate({ x: 0, y: 0 })
      } else {
        setTranslate((t) => {
          const img = imgRef.current
          if (!img) return t
          const rect = img.getBoundingClientRect()
          const imgW = rect.width / scale
          const imgH = rect.height / scale
          const maxX = (imgW * (scale - 1)) / 2
          const maxY = (imgH * (scale - 1)) / 2
          return {
            x: Math.max(-maxX, Math.min(maxX, t.x)),
            y: Math.max(-maxY, Math.min(maxY, t.y)),
          }
        })
      }
    })
  }, [scale])

  function clamp(x, y) {
    const img = imgRef.current
    if (!img || scale <= 1) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    const imgW = rect.width / scale
    const imgH = rect.height / scale
    const maxX = (imgW * (scale - 1)) / 2
    const maxY = (imgH * (scale - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
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
    setTranslate(clamp(translateStart.current.x + dx, translateStart.current.y + dy))
  }

  function handlePointerUp() {
    setDragging(false)
  }

  function handleDoubleClick(e) {
    e.stopPropagation()
    setScale((s) => (s > 1 ? 1 : 3))
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-label={`Viewing image: ${alt}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-gray-400">{alt}</p>
        <button
          onClick={onClose}
          aria-label="Close image viewer"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex flex-1 items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
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

      <div className="flex items-center justify-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-sm">
          <button
            onClick={() => setScale((s) => Math.max(1, s - 0.5))}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-30"
          >
            −
          </button>
          <button
            onClick={() => {
              setScale(1)
              setTranslate({ x: 0, y: 0 })
            }}
            className="min-w-[3.5rem] px-2 text-sm font-medium text-gray-300 tabular-nums transition-colors hover:text-white"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => setScale((s) => Math.min(6, s + 0.5))}
            disabled={scale >= 6}
            aria-label="Zoom in"
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
        className={`group relative cursor-pointer overflow-hidden ${className}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View ${alt} fullscreen`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full select-none object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-white"
            >
              <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM12.22 13.28l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 00-1.06 1.06zM3.5 4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V4.56z" />
            </svg>
            <span className="text-sm font-medium text-white">Tap to zoom</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && <ImageViewer src={src} alt={alt} onClose={handleClose} />}
      </AnimatePresence>
    </>
  )
}
