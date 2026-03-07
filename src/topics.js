const topicModules = import.meta.glob('./assets/topics/*/index.js', { eager: true })

export function getTopics() {
  return Object.entries(topicModules).map(([path, mod]) => {
    const slug = path.split('/').at(-2)
    const topic = mod.default
    return {
      slug,
      name: topic.name,
      cover: topic.cover,
      words: topic.words,
    }
  })
}

export function getTopic(slug) {
  return getTopics().find((t) => t.slug === slug) || null
}
