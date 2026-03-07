# NameIt! — Vocabulary Quiz Game

A fun, interactive vocabulary quiz game for young students, inspired by the Oxford Picture Dictionary.

## How It Works

1. **Pick a Topic** — Choose from illustrated scenes (building site, kitchen, etc.)
2. **Study** — See the image with all numbered items labeled. Memorize as many as you can!
3. **Quiz** — The labels disappear. Type the correct word for each numbered item.
4. **Score** — See how you did, with points for speed and accuracy.

## Adding New Topics

Just drop two files into `src/assets/topics/`:

1. A topic definition: `your-topic.js`
2. Its image: `your-topic.jpg`

The app auto-discovers new topics — no code changes needed.

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- React Router
- Framer Motion

## Development

```bash
npm install
npm run dev
```
