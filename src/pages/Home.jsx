import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTopics } from '../topics'

const CARD_COLORS = [
  'from-amber-600 to-amber-700',
  'from-emerald-600 to-emerald-700',
  'from-violet-600 to-violet-700',
  'from-rose-600 to-rose-700',
  'from-cyan-600 to-cyan-700',
  'from-fuchsia-600 to-fuchsia-700',
]

export default function Home() {
  const topics = getTopics()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:py-12"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10 text-center sm:mb-14">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-5xl font-extrabold tracking-tight sm:text-7xl"
          >
            <span className="bg-gradient-to-r from-amber-700 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              NameIt!
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-foreground/50 sm:text-xl"
          >
            How many can you name?
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.slug}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + Math.min(i, 8) * 0.08 }}
            >
              <Link
                to={`/topics/${topic.slug}`}
                className="group relative block overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} opacity-90 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <h2 className="text-xl font-extrabold text-white sm:text-2xl">{topic.name}</h2>
                  <p className="mt-2 text-sm font-medium text-white/70">
                    {topic.words.length} words to learn
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                    Start
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {topics.length === 0 && (
          <div className="mt-20 text-center text-foreground/40">
            <p className="text-2xl">No topics yet!</p>
            <p className="mt-2">
              Add a topic file to{' '}
              <code className="rounded bg-muted px-2 py-1 text-sm text-primary">
                src/assets/topics/
              </code>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
