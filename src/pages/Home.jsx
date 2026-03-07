import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTopics } from '../topics'

// Stable color per topic — hash slug to pick a color that never changes with filtering
const CARD_COLORS = [
  'from-amber-600 to-amber-700',
  'from-emerald-600 to-emerald-700',
  'from-violet-600 to-violet-700',
  'from-rose-600 to-rose-700',
  'from-cyan-600 to-cyan-700',
  'from-fuchsia-600 to-fuchsia-700',
  'from-sky-600 to-sky-700',
  'from-lime-600 to-lime-700',
  'from-indigo-600 to-indigo-700',
]

function hashSlug(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Pre-compute stable color map for all topics
const allTopics = getTopics()
const topicColorMap = Object.fromEntries(
  allTopics.map((t) => [t.slug, CARD_COLORS[hashSlug(t.slug) % CARD_COLORS.length]]),
)

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Pictures' },
  { key: 'definition', label: 'Definitions' },
]

export default function Home() {
  const [filter, setFilter] = useState('all')

  const topics = useMemo(() => {
    if (filter === 'all') return allTopics
    return allTopics.filter((t) => t.type === filter)
  }, [filter])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 sm:py-12"
    >
      <div className="mx-auto w-full max-w-4xl">
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

        {/* Filter tabs */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6 flex justify-center gap-2"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                filter === f.key
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-card text-foreground/50 ring-1 ring-border hover:bg-card-hover hover:text-foreground/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {topics.map((topic) => (
              <motion.div
                key={topic.slug}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/topics/${topic.slug}`}
                  className="group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl sm:p-6"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${topicColorMap[topic.slug]} opacity-90 transition-opacity group-hover:opacity-100`}
                  />
                  <div className="relative z-10">
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">{topic.name}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm font-medium text-white/70">
                        {topic.words.length} words to learn
                      </p>
                      {topic.type === 'definition' && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                          Definitions
                        </span>
                      )}
                    </div>
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
          </AnimatePresence>
        </div>

        {topics.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 text-center text-foreground/40"
          >
            <p className="text-2xl">No topics found</p>
            <p className="mt-2">Try a different filter</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
