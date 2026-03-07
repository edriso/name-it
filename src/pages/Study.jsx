import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTopic } from '../topics'
import ZoomableImage from '../components/ZoomableImage'

const STUDY_TIME = 30
const TIMER_OPTIONS = [10, 15, 20, 30]

export default function Study() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const topic = getTopic(slug)
  const [secondsLeft, setSecondsLeft] = useState(STUDY_TIME)
  const [started, setStarted] = useState(false)
  const [timer, setTimer] = useState(15)
  const [shuffle, setShuffle] = useState(true)

  const goToQuiz = useCallback(() => {
    navigate(`/topics/${slug}/quiz`, {
      state: { timer, shuffle },
    })
  }, [navigate, slug, timer, shuffle])

  useEffect(() => {
    if (!started) return
    if (secondsLeft <= 0) {
      goToQuiz()
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft, started, goToQuiz])

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-foreground/60">Topic not found</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">Go back</Link>
        </div>
      </div>
    )
  }

  const progress = ((STUDY_TIME - secondsLeft) / STUDY_TIME) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-6 sm:py-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-sm text-foreground/50 ring-1 ring-border transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
          <div className="text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-extrabold sm:text-4xl"
            >
              Study Time! 👀
            </motion.h1>
            <p className="mt-2 text-foreground/50">
              Memorize the words — the quiz is coming!
            </p>
          </div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl ring-1 ring-border"
        >
          <ZoomableImage
            src={topic.cover}
            alt={topic.name}
            className="h-[45vh] bg-muted"
          />
        </motion.div>

        {/* Word list */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6"
        >
          <h2 className="mb-4 text-xl font-bold text-primary">{topic.name}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {topic.words.map((word, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + Math.min(i, 12) * 0.04 }}
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground/80">{word}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quiz settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/40">
            Quiz Settings
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground/60">Timer</span>
              <div className="flex gap-1.5">
                {TIMER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimer(t)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      timer === t
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-muted text-foreground/50 hover:bg-card-hover hover:text-foreground/70'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground/60">Order</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShuffle(true)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    shuffle
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-muted text-foreground/50 hover:bg-card-hover hover:text-foreground/70'
                  }`}
                >
                  Random
                </button>
                <button
                  onClick={() => setShuffle(false)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                    !shuffle
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-muted text-foreground/50 hover:bg-card-hover hover:text-foreground/70'
                  }`}
                >
                  In Order
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {!started ? (
            <div className="flex gap-3">
              <button
                onClick={() => setStarted(true)}
                className="rounded-xl bg-card px-6 py-3 font-semibold text-foreground/60 ring-1 ring-border transition-all hover:bg-card-hover"
              >
                Start Timer ({STUDY_TIME}s)
              </button>
              <button
                onClick={goToQuiz}
                className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110"
              >
                I'm Ready! 🚀
              </button>
            </div>
          ) : (
            <>
              <div className="w-full max-w-md">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-2 text-center text-sm text-foreground/50">
                  {secondsLeft}s remaining
                </p>
              </div>
              <button
                onClick={goToQuiz}
                className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110"
              >
                I'm Ready! 🚀
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
