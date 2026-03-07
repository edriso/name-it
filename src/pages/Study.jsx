import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTopic } from '../topics'

const STUDY_TIME = 30

export default function Study() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const topic = getTopic(slug)
  const [secondsLeft, setSecondsLeft] = useState(STUDY_TIME)
  const [started, setStarted] = useState(false)

  const goToQuiz = useCallback(() => {
    navigate(`/topics/${slug}/quiz`)
  }, [navigate, slug])

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
          <p className="text-2xl text-gray-400">Topic not found</p>
          <Link to="/" className="mt-4 inline-block text-primary-light underline">Go back</Link>
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
        <div className="mb-6 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-extrabold sm:text-4xl"
          >
            Study Time! 👀
          </motion.h1>
          <p className="mt-2 text-gray-400">
            Memorize the words — the quiz is coming!
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-surface-light/50 ring-1 ring-white/10"
        >
          <div className="relative flex justify-center bg-black/30">
            <img
              src={topic.image}
              alt={topic.name}
              className="max-h-[50vh] w-full object-contain"
            />
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="mb-4 text-xl font-bold text-primary-light">{topic.name}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {topic.words.map((word, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="flex items-center gap-2 rounded-lg bg-surface/60 px-3 py-2"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-200">{word}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-4">
          {!started ? (
            <div className="flex gap-3">
              <button
                onClick={() => setStarted(true)}
                className="rounded-xl bg-surface-light px-6 py-3 font-semibold text-gray-300 ring-1 ring-white/10 transition-all hover:bg-surface-light/80"
              >
                Start Timer ({STUDY_TIME}s)
              </button>
              <button
                onClick={goToQuiz}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
              >
                I'm Ready! 🚀
              </button>
            </div>
          ) : (
            <>
              <div className="w-full max-w-md">
                <div className="h-2 overflow-hidden rounded-full bg-surface-light">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-2 text-center text-sm text-gray-400">
                  {secondsLeft}s remaining
                </p>
              </div>
              <button
                onClick={goToQuiz}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
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
