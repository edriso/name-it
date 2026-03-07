# NameIt! — Project Conventions

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier — format all files
npm run format:check # Prettier — check formatting
```

## Project Structure

```
src/
  App.jsx              # Routes (react-router-dom v7)
  main.jsx             # Entry point
  topics.js            # Auto-discovers topics via import.meta.glob (image + definition types)
  index.css            # Tailwind CSS 4 with @theme tokens
  pages/
    Home.jsx           # Topic grid with All/Pictures/Definitions filter
    Study.jsx          # Study page (image or definition cards), quiz settings
    Quiz.jsx           # Quiz page with timer, hints, skip (image or definition mode)
    Score.jsx          # Results with breakdown, download, title badges
    NotFound.jsx       # 404 page
  components/
    ZoomableImage.jsx  # Fullscreen image viewer with pan/zoom
  assets/topics/       # Topic folders (auto-discovered)
```

## Stack

- **React 19** with functional components and hooks
- **Tailwind CSS 4** using `@theme` for design tokens (defined in `src/index.css`)
- **Framer Motion** for page transitions and animations
- **React Router v7** with `AnimatePresence` for animated route changes
- **Vite 7** as build tool
- **html2canvas** (lazy-loaded) for score screenshot download

## Coding Conventions

- Single quotes, trailing commas, no semicolons in most cases
- Tailwind utility classes directly in JSX — no CSS modules
- Theme colors via CSS custom properties: `bg-background`, `text-foreground`, `bg-card`, `bg-primary`, etc.
- Pages use `motion.div` with `initial/animate/exit` opacity transitions
- State passed between pages via `useNavigate` + `useLocation` state
- Keep button/heading text simple and clear — no cliche emojis (rockets, sparkles, etc.)
- Personality emojis in dynamic UI are fine (e.g. quiz countdown faces, score title badges)

## URL Structure

Routes use `/topics/:type/:slug` where `type` is `image` or `definition`:

```
/                                  # Home — topic grid
/topics/image/building-site        # Study — image topic
/topics/definition/kitchen         # Study — definition topic
/topics/:type/:slug/quiz           # Quiz
/topics/:type/:slug/score          # Score
```

This allows same-name topics across quiz types without URL conflicts.

## Adding a New Topic

### Image Topic (numbered illustration)

1. Create a folder in `src/assets/topics/your-topic/`
2. Add `cover.jpeg` (illustrated image with numbered items)
3. Add `index.js`:

```js
import cover from './cover.jpeg'

export default {
  name: 'Your Topic Name',
  cover,
  words: [
    'simple word', // single accepted answer
    ['primary-name', 'alt1', 'alt2'], // multiple accepted answers
  ],
}
```

Words can be a string (single answer) or an array (multiple accepted answers).
When using an array, the first element is the display name shown during study/hints.

### Definition Topic (text-based, no image needed)

1. Create a folder in `src/assets/topics/your-topic/`
2. Add `index.js` with `type: 'definition'`:

```js
export default {
  name: 'Your Topic Name',
  type: 'definition',
  words: [
    { word: 'oven', definition: 'A hot box where you bake cakes and roast food' },
    { word: ['frying pan', 'skillet'], definition: 'A flat pan used to cook food in oil' },
  ],
}
```

Each word entry is an object with `word` (string or array of accepted answers) and `definition` (shown as the quiz question). No cover image is required.

The app auto-discovers topics — no other changes needed.
