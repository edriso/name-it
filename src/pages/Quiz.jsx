import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTopic } from '../topics'

const QUESTION_TIME = 15

function calculateScore(hintsUsed, timeLeft) {
  if (hintsUsed >= 3) return 0
  if (hintsUsed === 2) return 40
  if (hintsUsed === 1) return 75
  const elapsed = QUESTION_TIME - timeLeft
  if (elapsed < 5) return 150
  if (elapsed < 10) return 125
  return 100
}

function getHintText(word, hintsUsed) {
  if (hintsUsed === 0) return null
  if (hintsUsed >= 3) return word
  const reveal = hintsUsed === 1 ? 1 : Math.ceil(word.length * 0.4)
  return word.slice(0, reveal) + '_'.repeat(word.length - reveal)
}

export default function Quiz() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const topic = getTopic(slug)
  const inputRef = useRef(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [feedback, setFeedback] = useState(null)
  const [results, setResults] = useState([])
  const [locked, setLocked] = useState(false)

  const totalQuestions = topic?.words.length ?? 0
  const currentWord = topic?.words[currentIndex] ?? ''

  const advanceQuestion = useCallback(
    (result) => {
      const newResults = [...results, result]
      setResults(newResults)

      if (currentIndex + 1 >= totalQuestions) {
        navigate(`/topics/${slug}/score`, { state: { results: newResults, topic } })
      } else {
        setCurrentIndex((i) => i + 1)
        setAnswer('')
        setHintsUsed(0)
        setTimeLeft(QUESTION_TIME)
        setFeedback(null)
        setLocked(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    },
    [results, currentIndex, totalQuestions, navigate, slug, topic],
  )

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      if (locked) return

      const trimmed = answer.trim().toLowerCase()
      const correct = trimmed === currentWord.toLowerCase()

      setLocked(true)
      setFeedback(correct ? 'correct' : 'wrong')

      const score = correct ? calculateScore(hintsUsed, timeLeft) : 0

      setTimeout(() => {
        advanceQuestion({
          word: currentWord,
          answer: trimmed,
          correct,
          hintsUsed,
          timeLeft,
          score,
        })
      }, 800)
    },
    [answer, currentWord, hintsUsed, timeLeft, locked, advanceQuestion],
  )

  useEffect(() => {
    if (locked || !topic) return
    if (timeLeft <= 0) {
      setLocked(true)
      setFeedback('wrong')
      setTimeout(() => {
        advanceQuestion({
          word: currentWord,
          answer: '',
          correct: false,
          hintsUsed,
          timeLeft: 0,
          score: 0,
        })
      }, 800)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, locked, topic, currentWord, hintsUsed, advanceQuestion])

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-400">Topic not found</p>
          <Link to="/" className="mt-4 inline-block text-primary-light underline">Go back</Link>
        </div>
      </div>
    )
  }

  const hint = getHintText(currentWord, hintsUsed)
  const timerPercent = (timeLeft / QUESTION_TIME) * 100
  const timerColor =
    timeLeft > 10 ? 'bg-success' : timeLeft > 5 ? 'bg-accent' : 'bg-danger'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-4 sm:py-6"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-400">
            {currentIndex + 1} / {totalQuestions}
          </div>
          <h2 className="text-lg font-bold text-white">{topic.name}</h2>
          <span
            className={`text-2xl font-extrabold tabular-nums ${timeLeft <= 5 ? 'text-danger' : 'text-white'}`}
          >
            {timeLeft}s
          </span>
        </div>

        {/* Timer bar */}
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-light">
          <motion.div
            className={`h-full rounded-full ${timerColor}`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Progress dots */}
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {topic.words.map((_, i) => {
            let dotClass = 'bg-surface-light'
            if (i < results.length) {
              dotClass = results[i].correct ? 'bg-success' : 'bg-danger/60'
            } else if (i === currentIndex) {
              dotClass = 'bg-primary ring-2 ring-primary-light'
            }
            return (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${dotClass}`}
              />
            )
          })}
        </div>

        {/* Main content — side by side on large screens */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 lg:flex-1">
            <div className="flex justify-center bg-black/30">
              <img
                src={topic.cover}
                alt={topic.name}
                className="max-h-[40vh] w-full object-contain lg:max-h-[60vh]"
              />
            </div>
          </div>

          {/* Question area */}
          <div className="lg:w-96 lg:flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl p-5 ring-1 ${
                  feedback === 'correct'
                    ? 'bg-success/10 ring-success/40'
                    : feedback === 'wrong'
                      ? 'bg-danger/10 ring-danger/40'
                      : 'bg-surface-light/50 ring-white/10'
                } transition-colors duration-300`}
              >
                <h3 className="mb-1 text-center text-2xl font-extrabold text-white sm:text-3xl">
                  What is number{' '}
                  <span className="text-accent">{currentIndex + 1}</span>?
                </h3>

                {hint && (
                  <p className="mb-3 text-center font-mono text-lg tracking-widest text-primary-light">
                    {hint}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={locked}
                    placeholder="Type your answer..."
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-xl bg-surface px-4 py-3 text-lg font-medium text-white placeholder-gray-500 outline-none ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={locked || !answer.trim()}
                    className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Go!
                  </button>
                </form>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setHintsUsed((h) => Math.min(h + 1, 3))}
                    disabled={locked || hintsUsed >= 3}
                    className="rounded-lg bg-accent/20 px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/30 disabled:opacity-30"
                  >
                    {hintsUsed >= 3
                      ? 'No more hints'
                      : `Hint 💡 (${3 - hintsUsed} left)`}
                  </button>

                  {feedback === 'correct' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-success"
                    >
                      Correct! ✅
                    </motion.span>
                  )}
                  {feedback === 'wrong' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-danger"
                    >
                      It was: {currentWord} ❌
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
