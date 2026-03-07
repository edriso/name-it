const topicModules = import.meta.glob('./assets/topics/*/index.js', { eager: true })

const topics = Object.entries(topicModules).map(([path, mod]) => {
  const slug = path.split('/').at(-2)
  const topic = mod.default
  return {
    slug,
    name: topic.name,
    cover: topic.cover,
    words: topic.words,
  }
})

const topicsBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]))

export function getTopics() {
  return topics
}

export function getTopic(slug) {
  return topicsBySlug[slug] || null
}
