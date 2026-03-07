import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function getMessage(percent) {
  if (percent === 100) return { text: 'Perfect Score!', emoji: '🏆' }
  if (percent >= 80) return { text: 'Amazing!', emoji: '🌟' }
  if (percent >= 60) return { text: 'Great Job!', emoji: '💪' }
  if (percent >= 40) return { text: 'Not Bad!', emoji: '👍' }
  return { text: 'Keep Practicing!', emoji: '📚' }
}

export default function Score() {
  const { slug } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-400">No results found</p>
          <Link to="/" className="mt-4 inline-block text-primary-light underline">Go home</Link>
        </div>
      </div>
    )
  }

  const { results, topic } = state
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.length * 150
  const percent = Math.round((totalScore / maxScore) * 100)
  const correctCount = results.filter((r) => r.correct).length
  const hintsTotal = results.reduce((sum, r) => sum + r.hintsUsed, 0)
  const bonusPoints = results.reduce((sum, r) => {
    if (!r.correct || r.hintsUsed > 0) return sum
    return sum + (r.score - 100)
  }, 0)
  const message = getMessage(percent)
  const isCelebration = percent >= 80

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
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: `${50 + (Math.random() - 0.5) * 20}vw`,
                  y: '-10vh',
                  rotate: 0,
                }}
                animate={{
                  y: '110vh',
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  ease: 'easeIn',
                }}
              >
                {['🎉', '⭐', '🎊', '✨', '🌟'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}

        {/* Score header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mb-4 text-6xl"
          >
            {message.emoji}
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold text-white sm:text-5xl"
          >
            {message.text}
          </motion.h1>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-6xl font-black text-transparent sm:text-7xl">
              {totalScore}
            </span>
            <span className="ml-2 text-xl text-gray-500">pts</span>
          </motion.div>
        </div>

        {/* Stats grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          <div className="rounded-xl bg-surface-light/50 p-4 text-center ring-1 ring-white/10">
            <div className="text-2xl font-extrabold text-success">
              {correctCount}/{results.length}
            </div>
            <div className="mt-1 text-xs text-gray-400">Correct</div>
          </div>
          <div className="rounded-xl bg-surface-light/50 p-4 text-center ring-1 ring-white/10">
            <div className="text-2xl font-extrabold text-accent">{hintsTotal}</div>
            <div className="mt-1 text-xs text-gray-400">Hints Used</div>
          </div>
          <div className="rounded-xl bg-surface-light/50 p-4 text-center ring-1 ring-white/10">
            <div className="text-2xl font-extrabold text-primary-light">
              +{bonusPoints}
            </div>
            <div className="mt-1 text-xs text-gray-400">Speed Bonus</div>
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8 rounded-2xl bg-surface-light/30 p-4 ring-1 ring-white/10"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Breakdown
          </h3>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface/40 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-light text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {r.word}
                  </span>
                  {r.correct ? (
                    <span className="text-xs text-success">✓</span>
                  ) : (
                    <span className="text-xs text-danger">✗</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {r.hintsUsed > 0 && (
                    <span className="text-xs text-accent">
                      {r.hintsUsed} hint{r.hintsUsed > 1 ? 's' : ''}
                    </span>
                  )}
                  <span
                    className={`min-w-[3rem] text-right text-sm font-bold ${
                      r.score > 100
                        ? 'text-accent'
                        : r.score > 0
                          ? 'text-success'
                          : 'text-gray-500'
                    }`}
                  >
                    {r.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <button
            onClick={() => navigate(`/quiz/${slug}`)}
            className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            Try Again 🔁
          </button>
          <button
            onClick={() => navigate(`/study/${slug}`)}
            className="rounded-xl bg-surface-light px-6 py-3 font-semibold text-gray-300 ring-1 ring-white/10 transition-all hover:bg-surface-light/80"
          >
            Study Again 📖
          </button>
          <Link
            to="/"
            className="rounded-xl bg-surface-light px-6 py-3 text-center font-semibold text-gray-300 ring-1 ring-white/10 transition-all hover:bg-surface-light/80"
          >
            New Topic 🏠
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
