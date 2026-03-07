import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTopics } from '../topics'

export default function Home() {
  const topics = getTopics()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8 sm:py-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-14">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-5xl font-extrabold tracking-tight sm:text-7xl"
          >
            <span className="bg-gradient-to-r from-primary-light via-accent to-accent-light bg-clip-text text-transparent">
              NameIt!
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 sm:text-xl"
          >
            How many can you name?
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.slug}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <Link
                to={`/study/${topic.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-surface-light/60 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.03] hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {topic.image ? (
                    <img
                      src={topic.image}
                      alt={topic.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface text-4xl">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-white">{topic.name}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {topic.words.length} words to learn
                  </p>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>
          ))}
        </div>

        {topics.length === 0 && (
          <div className="mt-20 text-center text-gray-500">
            <p className="text-2xl">No topics yet!</p>
            <p className="mt-2">Add a topic file to <code className="rounded bg-surface-light px-2 py-1 text-sm text-primary-light">src/assets/topics/</code></p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
