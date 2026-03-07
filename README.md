# NameIt! — Vocabulary Quiz Game

A fun, interactive vocabulary quiz game for young students, inspired by the Oxford Picture Dictionary.

## How It Works

1. **Pick a Topic** — Choose from illustrated scenes (building site, kitchen, etc.)
2. **Study** — See the image with all numbered items labeled. Memorize as many as you can!
3. **Quiz** — The labels disappear. Type the correct word for each numbered item.
4. **Score** — See how you did, with points for speed and accuracy.

## Features

- **Word Count Selector** — Choose how many words to quiz (8, 12, 16, or all)
- **Quiz Settings** — Customizable timer (10s–30s) and random/in-order mode
- **Multi-Answer Support** — Words with alternative names (e.g., "cement-mixer" / "concrete mixer") all count as correct
- **Hint System** — Up to 3 hints per question, with progressive letter reveals
- **Score Titles** — Earn titles from "Word Rookie" to "Vocabulary Master" based on performance
- **Screenshot Download** — Save your score card as a PNG image
- **Keyboard Shortcuts** — Quick keys for hints, skip, and navigation
- **Fullscreen Image Viewer** — Pan and zoom the study image for detail
- **Animated Transitions** — Smooth page transitions and celebration effects

## Adding New Topics

Create a folder in `src/assets/topics/` with two files:

```
src/assets/topics/
  your-topic/
    index.js      <- topic definition
    cover.jpeg    <- illustrated image with numbered items
```

The `index.js` file:

```js
import cover from './cover.jpeg'

export default {
  name: 'Your Topic Name',
  cover,
  words: [
    'simple word', // single answer
    ['pick-axe', 'pickaxe', 'pick axe'], // multiple accepted answers
  ],
}
```

Words can be a string or an array. Arrays accept multiple correct answers — the first is the display name.

That's it — the app auto-discovers new topics. No other code changes needed.

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- React Router v7
- Framer Motion

## Development

```bash
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier — format all files
npm run format:check # Check formatting
```
