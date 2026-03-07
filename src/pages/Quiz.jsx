import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTopic } from '../topics'
import ZoomableImage from '../components/ZoomableImage'

const DEFAULT_TIME = 30
const EMPTY_ACCEPTS = []
const CORRECT_DELAY = 800
const WRONG_DELAY = 1800

function calculateScore(hintsUsed, timeLeft, questionTime) {
  if (hintsUsed >= 3) return 0
  if (hintsUsed === 2) return 40
  if (hintsUsed === 1) return 75
  const elapsed = questionTime - timeLeft
  if (elapsed < 5) return 150
  if (elapsed < 10) return 125
  return 100
}

function getHintText(display, hintsUsed) {
  if (hintsUsed === 0) return null
  if (hintsUsed >= 3) return display
  const reveal = hintsUsed === 1 ? 1 : Math.ceil(display.length * 0.4)
  return display.slice(0, reveal) + '_'.repeat(display.length - reveal)
}

export default function Quiz() {
  const { type, slug } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const topic = getTopic(type, slug)
  const inputRef = useRef(null)
  const resultsRef = useRef([])
  const [completedResults, setCompletedResults] = useState([])

  const questionTime = state?.timer ?? DEFAULT_TIME
  const shouldShuffle = state?.shuffle ?? true
  const wordCount = state?.wordCount ?? topic?.words.length ?? 0

  // useState lazy init — runs once, Math.random is fine here
  const [questions] = useState(() => {
    if (!topic) return []
    const all = topic.words.map((w, i) => ({
      display: w.display,
      accepts: w.accepts,
      definition: w.definition,
      originalIndex: i,
    }))
    const sliced = wordCount < all.length ? all.slice(0, wordCount) : all
    if (!shouldShuffle) return sliced
    const shuffled = [...sliced]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(questionTime)
  const [feedback, setFeedback] = useState(null)
  const [locked, setLocked] = useState(false)

  const totalQuestions = questions.length
  const current = questions[currentIndex]
  const currentDisplay = current?.display ?? ''
  const currentAccepts = current?.accepts ?? EMPTY_ACCEPTS
  const currentNumber = current ? current.originalIndex + 1 : 0
  const currentDefinition = current?.definition ?? ''
  const isDefinition = topic?.type === 'definition'

  const advanceQuestion = useCallback(
    (result) => {
      const newResults = [...resultsRef.current, result]
      resultsRef.current = newResults
      setCompletedResults(newResults)

      if (currentIndex + 1 >= totalQuestions) {
        navigate(`/topics/${type}/${slug}/score`, {
          state: {
            results: newResults,
            topic,
            settings: { timer: questionTime, shuffle: shouldShuffle, wordCount },
          },
        })
      } else {
        setCurrentIndex((i) => i + 1)
        setAnswer('')
        setHintsUsed(0)
        setTimeLeft(questionTime)
        setFeedback(null)
        setLocked(false)
        // input is focused via onAnimationComplete on the motion.div
      }
    },
    [
      currentIndex,
      totalQuestions,
      navigate,
      type,
      slug,
      topic,
      questionTime,
      shouldShuffle,
      wordCount,
    ],
  )

  const submitAnswer = useCallback(
    (submittedAnswer) => {
      if (locked) return
      const trimmed = (submittedAnswer ?? '').trim().toLowerCase()
      const correct = currentAccepts.includes(trimmed)

      setLocked(true)
      setFeedback(correct ? 'correct' : 'wrong')

      const score = correct ? calculateScore(hintsUsed, timeLeft, questionTime) : 0
      const delay = correct ? CORRECT_DELAY : WRONG_DELAY

      setTimeout(() => {
        advanceQuestion({
          word: currentDisplay,
          number: currentNumber,
          answer: trimmed,
          correct,
          hintsUsed,
          timeLeft,
          score,
        })
      }, delay)
    },
    [
      currentDisplay,
      currentAccepts,
      currentNumber,
      hintsUsed,
      timeLeft,
      questionTime,
      locked,
      advanceQuestion,
    ],
  )

  function handleSubmit(e) {
    e?.preventDefault()
    if (!answer.trim()) return
    submitAnswer(answer)
  }

  const handleSkip = useCallback(() => {
    if (locked) return
    setLocked(true)
    setFeedback('wrong')
    setTimeout(() => {
      advanceQuestion({
        word: currentDisplay,
        number: currentNumber,
        answer: '',
        correct: false,
        hintsUsed,
        timeLeft,
        score: 0,
      })
    }, WRONG_DELAY)
  }, [locked, currentDisplay, currentNumber, hintsUsed, timeLeft, advanceQuestion])

  // Timer countdown
  useEffect(() => {
    if (locked || !topic) return
    if (timeLeft <= 0) {
      queueMicrotask(() => {
        setLocked(true)
        setFeedback('wrong')
        setTimeout(() => {
          advanceQuestion({
            word: currentDisplay,
            number: currentNumber,
            answer: '',
            correct: false,
            hintsUsed,
            timeLeft: 0,
            score: 0,
          })
        }, WRONG_DELAY)
      })
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, locked, topic, currentDisplay, currentNumber, hintsUsed, advanceQuestion])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      const inInput = e.target.tagName === 'INPUT'
      if (e.key === '?') {
        e.preventDefault()
        if (!locked && hintsUsed < 3) setHintsUsed((h) => Math.min(h + 1, 3))
      } else if (e.key === 'Escape') {
        handleSkip()
      } else if (!inInput) {
        if (e.key === 'h' || e.key === 'H') {
          if (!locked && hintsUsed < 3) setHintsUsed((h) => Math.min(h + 1, 3))
        } else if (e.key === 's' || e.key === 'S') {
          handleSkip()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [locked, hintsUsed, handleSkip])

  // initial focus handled by onAnimationComplete on the question motion.div

  if (!topic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-foreground/60">Topic not found</p>
          <Link to="/" className="mt-4 inline-block text-primary underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  const hint = getHintText(currentDisplay, hintsUsed)
  const timerPercent = (timeLeft / questionTime) * 100
  const timerEmoji =
    timeLeft > questionTime * 0.66 ? '😊' : timeLeft > questionTime * 0.33 ? '🤔' : '😬'

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
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground/50 ring-1 ring-border transition-colors hover:bg-card-hover hover:text-foreground"
              title="Exit quiz"
              aria-label="Exit quiz"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <span className="text-sm font-medium text-foreground/50">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">{topic.name}</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{timerEmoji}</span>
            <span className="text-lg font-bold tabular-nums text-foreground/60">{timeLeft}s</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-primary/15">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Progress dots */}
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {questions.map((_, i) => {
            let dotClass = 'bg-muted'
            if (i < completedResults.length) {
              dotClass = completedResults[i].correct ? 'bg-success' : 'bg-danger/60'
            } else if (i === currentIndex) {
              dotClass = 'bg-primary ring-2 ring-primary/50'
            }
            return (
              <div key={i} className={`h-2.5 w-2.5 rounded-full transition-colors ${dotClass}`} />
            )
          })}
        </div>

        {/* Main content */}
        <div
          className={
            isDefinition ? 'mx-auto max-w-lg' : 'flex flex-col gap-4 lg:flex-row lg:items-start'
          }
        >
          {/* Image (image topics only) */}
          {!isDefinition && (
            <div className="overflow-hidden rounded-2xl ring-1 ring-border lg:flex-1">
              <ZoomableImage
                src={topic.cover}
                alt={topic.name}
                className="h-[35vh] bg-black/10 lg:h-[55vh]"
              />
            </div>
          )}

          {/* Question area */}
          <div className={isDefinition ? '' : 'lg:w-96 lg:flex-shrink-0'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onAnimationComplete={() => {
                  // Don't auto-focus on touch devices — it opens the virtual keyboard
                  const isCoarse = window.matchMedia('(pointer: coarse)').matches
                  if (!isCoarse) inputRef.current?.focus()
                }}
                className={`rounded-2xl p-5 ring-1 ${
                  feedback === 'correct'
                    ? 'bg-success/10 ring-success/40'
                    : feedback === 'wrong'
                      ? 'bg-danger/10 ring-danger/40'
                      : 'bg-card ring-border'
                } transition-colors duration-300`}
              >
                {isDefinition ? (
                  <div className="mb-2">
                    <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-foreground/40">
                      What word matches this definition?
                    </p>
                    <p className="text-center text-lg leading-relaxed text-foreground/80">
                      &ldquo;{currentDefinition}&rdquo;
                    </p>
                  </div>
                ) : (
                  <h3 className="mb-1 text-center text-2xl font-extrabold text-foreground sm:text-3xl">
                    What is number <span className="text-primary">{currentNumber}</span>?
                  </h3>
                )}

                {hint && (
                  <p className="mb-3 text-center font-mono text-lg tracking-widest text-primary/80">
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
                    className="min-w-0 flex-1 rounded-xl bg-muted px-4 py-3 text-lg font-medium text-foreground placeholder-foreground/40 outline-none ring-1 ring-border transition-all focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={locked || !answer.trim()}
                    aria-label="Submit answer"
                    className="cursor-pointer rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-40"
                  >
                    Go!
                  </button>
                </form>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHintsUsed((h) => Math.min(h + 1, 3))}
                        disabled={locked || hintsUsed >= 3}
                        className="cursor-pointer rounded-lg bg-highlight/20 px-3 py-2 text-sm font-semibold text-highlight transition-all hover:bg-highlight/30 disabled:opacity-30"
                      >
                        {hintsUsed >= 3 ? 'Revealed' : 'Hint'}
                      </button>
                      <button
                        onClick={handleSkip}
                        disabled={locked}
                        className="cursor-pointer rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-foreground/50 transition-all hover:bg-muted/80 hover:text-foreground/70 disabled:opacity-30"
                      >
                        Skip
                      </button>
                    </div>
                    <span className="hidden text-[10px] text-foreground/30 sm:inline">? = hint, Esc = skip</span>
                  </div>

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
                      className="text-base font-bold text-danger"
                    >
                      It was: {currentDisplay} ❌
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
