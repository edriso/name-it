# NameIt! — Vocabulary Quiz Game

A fun, interactive vocabulary quiz game for young students, inspired by the Oxford Picture Dictionary.

## How It Works

1. **Pick a Topic** — Choose from illustrated scenes (building site, kitchen, etc.)
2. **Study** — See the image with all numbered items labeled. Memorize as many as you can!
3. **Quiz** — The labels disappear. Type the correct word for each numbered item.
4. **Score** — See how you did, with points for speed and accuracy.

## Adding New Topics

Create a folder in `src/assets/topics/` with two files:

```
src/assets/topics/
  your-topic/
    index.js      ← topic definition
    cover.jpeg    ← illustrated image with numbered items
```

The `index.js` file:

```js
import cover from './cover.jpeg'

export default {
  name: "Your Topic Name",
  cover,
  words: [
    "word1",    // 1
    "word2",    // 2
    "word3",    // 3
  ],
}
```

That's it — the app auto-discovers new topics. No other code changes needed.

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
