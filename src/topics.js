const topicModules = import.meta.glob('./assets/topics/*.js', { eager: true })

const imageModules = import.meta.glob('./assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

function resolveImage(filename) {
  for (const [path, url] of Object.entries(imageModules)) {
    if (path.endsWith(`/${filename}`)) return url
  }
  return null
}

export function getTopics() {
  return Object.entries(topicModules).map(([path, mod]) => {
    const slug = path.split('/').pop().replace('.js', '')
    const topic = mod.default
    return {
      slug,
      name: topic.name,
      image: resolveImage(topic.image),
      words: topic.words,
    }
  })
}

export function getTopic(slug) {
  return getTopics().find((t) => t.slug === slug) || null
}
