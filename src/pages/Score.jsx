import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const TITLES = [
  { min: 100, title: 'Vocabulary Master', emoji: '🏆', color: 'from-amber-400 to-yellow-500' },
  { min: 90, title: 'Word Wizard', emoji: '🧙', color: 'from-violet-400 to-purple-500' },
  { min: 80, title: 'Language Star', emoji: '🌟', color: 'from-cyan-400 to-blue-500' },
  { min: 70, title: 'Quick Learner', emoji: '🚀', color: 'from-emerald-400 to-green-500' },
  { min: 60, title: 'Word Explorer', emoji: '🧭', color: 'from-teal-400 to-emerald-500' },
  { min: 40, title: 'Rising Scholar', emoji: '📖', color: 'from-orange-400 to-amber-500' },
  { min: 20, title: 'Word Apprentice', emoji: '✏️', color: 'from-rose-400 to-pink-500' },
  { min: 0, title: 'Word Rookie', emoji: '🌱', color: 'from-gray-400 to-gray-500' },
]

function getTitle(percent) {
  return TITLES.find((t) => percent >= t.min) || TITLES.at(-1)
}

export default function Score() {
  const { slug } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

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
    if (state?.settings) navigate(`/topics/${slug}/quiz`, { state: state.settings })
  }, [navigate, slug, state])

  // Keyboard shortcuts: R or Enter to try again
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        handleTryAgain()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleTryAgain])

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
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1c1917',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `nameit-${slug}-${totalScore}pts.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // silently handle — canvas may fail on some deployments
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
            <h2
              className={`mt-2 bg-gradient-to-r ${title.color} bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl`}
            >
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
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-6xl font-black text-transparent sm:text-7xl">
              {totalScore}
            </span>
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
              <div className="text-2xl font-extrabold text-amber-500">{hintsTotal}</div>
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
                      {r.number ?? i + 1}
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
                      <span className="text-xs text-amber-500">
                        {r.hintsUsed} hint{r.hintsUsed > 1 ? 's' : ''}
                      </span>
                    )}
                    <span
                      className={`min-w-[3rem] text-right text-sm font-bold ${
                        r.score > 100
                          ? 'text-amber-500'
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

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {downloading ? 'Saving...' : 'Save Result 📸'}
          </button>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleTryAgain}
              className="cursor-pointer rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110"
            >
              Try Again 🔁
            </button>
            <span className="text-[10px] text-foreground/30">Press R or Enter</span>
          </div>
          <button
            onClick={() => navigate(`/topics/${slug}`)}
            className="rounded-xl bg-card px-6 py-3 font-semibold text-foreground/70 ring-1 ring-border transition-all hover:bg-card-hover"
          >
            Study Again 📖
          </button>
          <Link
            to="/"
            className="rounded-xl bg-card px-6 py-3 text-center font-semibold text-foreground/70 ring-1 ring-border transition-all hover:bg-card-hover"
          >
            New Topic 🏠
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
