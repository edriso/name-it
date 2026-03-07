import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const TITLES = [
  { min: 100, title: 'Vocabulary Master', emoji: '🏆', color: 'text-[#c97b63]' },
  { min: 90, title: 'Word Wizard', emoji: '🧙', color: 'text-[#8b7ea8]' },
  { min: 80, title: 'Language Star', emoji: '🌟', color: 'text-[#6d9aaa]' },
  { min: 70, title: 'Quick Learner', emoji: '📚', color: 'text-[#81b29a]' },
  { min: 60, title: 'Word Explorer', emoji: '🧭', color: 'text-[#5c6078]' },
  { min: 40, title: 'Rising Scholar', emoji: '📖', color: 'text-[#b8876e]' },
  { min: 20, title: 'Word Apprentice', emoji: '✏️', color: 'text-[#a07e7e]' },
  { min: 0, title: 'Word Rookie', emoji: '🌱', color: 'text-[#9a8c76]' },
]

function getTitle(percent) {
  return TITLES.find((t) => percent >= t.min) || TITLES.at(-1)
}

export default function Score() {
  const { type, slug } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        x: 50 + (Math.random() - 0.5) * 20,
        rotate: Math.random() > 0.5 ? 360 : -360,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 1.5,
      })),
    [],
  )

  const handleTryAgain = useCallback(() => {
    if (state?.settings) navigate(`/topics/${type}/${slug}/quiz`, { state: state.settings })
  }, [navigate, type, slug, state])

  // Keyboard shortcuts: R or Enter to try again, Escape to go home
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        handleTryAgain()
      } else if (e.key === 'Escape') {
        navigate('/')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleTryAgain, navigate])

  if (!state?.results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-foreground/60">No results found</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const { results, topic } = state
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.length * 150
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const correctCount = results.filter((r) => r.correct).length
  const hintsTotal = results.reduce((sum, r) => sum + r.hintsUsed, 0)
  const bonusPoints = results.reduce((sum, r) => {
    if (!r.correct || r.hintsUsed > 0) return sum
    return sum + (r.score - 100)
  }, 0)
  const title = getTitle(percent)
  const isCelebration = percent >= 80

  async function handleDownload() {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas-pro')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#f4f1de',
        scale: 2,
        onclone: (clonedDoc) => {
          Array.from(document.styleSheets).forEach((sheet) => {
            try {
              const style = clonedDoc.createElement('style')
              style.textContent = Array.from(sheet.cssRules)
                .map((r) => r.cssText)
                .join('\n')
              clonedDoc.head.appendChild(style)
            } catch {
              // skip CORS-restricted sheets
            }
          })
        },
      })
      const link = document.createElement('a')
      link.download = `nameit-${slug}-${totalScore}pts.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('Could not save the image. Try a different browser.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-2xl">
        {/* Celebration particles */}
        {isCelebration && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ x: `${p.x}vw`, y: '-10vh', rotate: 0 }}
                animate={{ y: '110vh', rotate: p.rotate }}
                transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              >
                {['🎉', '⭐', '🎊', '✨', '🌟'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}

        {/* Downloadable result card */}
        <div ref={cardRef} className="rounded-3xl bg-card-solid p-6 sm:p-8">
          {/* Title badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mb-6 text-center"
          >
            <span className="text-6xl">{title.emoji}</span>
            <h2 className={`mt-2 text-2xl font-extrabold sm:text-3xl ${title.color}`}>
              {title.title}
            </h2>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 text-center"
          >
            <span className="text-6xl font-black text-primary-light sm:text-7xl">{totalScore}</span>
            <span className="ml-2 text-xl text-foreground/40">pts</span>
            <p className="mt-1 text-sm text-foreground/40">{topic.name}</p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 grid grid-cols-3 gap-3"
          >
            <div className="rounded-xl bg-muted p-4 text-center ring-1 ring-border">
              <div className="text-2xl font-extrabold text-success">
                {correctCount}/{results.length}
              </div>
              <div className="mt-1 text-xs text-foreground/50">Correct</div>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center ring-1 ring-border">
              <div className="text-2xl font-extrabold text-highlight">{hintsTotal}</div>
              <div className="mt-1 text-xs text-foreground/50">Hints Used</div>
            </div>
            <div className="rounded-xl bg-muted p-4 text-center ring-1 ring-border">
              <div className="text-2xl font-extrabold text-primary">+{bonusPoints}</div>
              <div className="mt-1 text-xs text-foreground/50">Speed Bonus</div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-muted p-4 ring-1 ring-border"
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/50">
              Breakdown
            </h3>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground/70">
                      {topic.type === 'definition' ? i + 1 : (r.number ?? i + 1)}
                    </span>
                    <span className="text-sm font-medium text-foreground/80">{r.word}</span>
                    {r.correct ? (
                      <span className="text-xs text-success">✓</span>
                    ) : (
                      <span className="text-xs text-danger">✗</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!r.correct && r.answer && (
                      <span className="text-xs text-danger/70 line-through">{r.answer}</span>
                    )}
                    {r.hintsUsed > 0 && (
                      <span className="text-xs text-highlight">
                        {r.hintsUsed} hint{r.hintsUsed > 1 ? 's' : ''}
                      </span>
                    )}
                    <span
                      className={`min-w-[3rem] text-right text-sm font-bold ${
                        r.score > 100
                          ? 'text-highlight'
                          : r.score > 0
                            ? 'text-success'
                            : 'text-foreground/30'
                      }`}
                    >
                      {r.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="mt-4 text-center text-xs text-foreground/30">
            NameIt! — Vocabulary Quiz Game
          </p>
        </div>

        {/* Scoring info toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="cursor-pointer text-sm text-foreground/40 transition-colors hover:text-foreground/60 rounded-md px-2 py-1"
          >
            &#9432; How scoring works
          </button>
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-xl bg-card p-4 text-left text-sm ring-1 ring-border">
                  <ul className="space-y-1.5 text-foreground/60">
                    <li><span className="font-bold text-highlight">150 pts</span> — correct, no hints, under 5s</li>
                    <li><span className="font-bold text-highlight">125 pts</span> — correct, no hints, under 10s</li>
                    <li><span className="font-bold text-success">100 pts</span> — correct, no hints</li>
                    <li><span className="font-bold text-success">75 pts</span> — correct, 1 hint used</li>
                    <li><span className="font-bold text-success">40 pts</span> — correct, 2 hints used</li>
                    <li><span className="font-bold text-foreground/30">0 pts</span> — 3 hints, wrong, or skipped</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Save result as image"
            className="cursor-pointer rounded-xl bg-highlight px-6 py-3 font-bold text-white shadow-lg shadow-highlight/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              {downloading ? 'Saving...' : 'Save Result'}
            </span>
          </button>
          <button
            onClick={handleTryAgain}
            className="cursor-pointer rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110"
          >
            Try Again
            <kbd className="ml-2 hidden rounded bg-white/20 px-1 text-[10px] sm:inline">R</kbd>
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-card px-6 py-3 font-semibold text-foreground/70 ring-1 ring-border transition-all hover:bg-card-hover"
          >
            New Topic
            <kbd className="ml-2 hidden rounded bg-foreground/10 px-1 text-[10px] sm:inline">Esc</kbd>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
