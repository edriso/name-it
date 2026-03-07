const topicModules = import.meta.glob('./assets/topics/*/index.js', { eager: true })

function normalizeWord(entry) {
  // { word: 'oven', definition: '...' } or { word: ['frying pan', 'skillet'], definition: '...' }
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    const base = Array.isArray(entry.word)
      ? { display: entry.word[0], accepts: entry.word.map((w) => w.toLowerCase()) }
      : { display: entry.word, accepts: [entry.word.toLowerCase()] }
    return { ...base, definition: entry.definition }
  }
  if (Array.isArray(entry)) {
    return { display: entry[0], accepts: entry.map((w) => w.toLowerCase()) }
  }
  return { display: entry, accepts: [entry.toLowerCase()] }
}

const topics = Object.entries(topicModules).map(([path, mod]) => {
  const slug = path.split('/').at(-2)
  const topic = mod.default
  return {
    slug,
    name: topic.name,
    cover: topic.cover,
    type: topic.type || 'image',
    words: topic.words.map(normalizeWord),
  }
})

const topicsBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]))

export function getTopics() {
  return topics
}

export function getTopic(slug) {
  return topicsBySlug[slug] || null
}
