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
  topics.js            # Auto-discovers topics via import.meta.glob
  index.css            # Tailwind CSS 4 with @theme tokens
  pages/
    Home.jsx           # Topic selection grid
    Study.jsx          # Study page with image, word list, quiz settings
    Quiz.jsx           # Quiz page with timer, hints, skip
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

## Adding a New Topic

1. Create a folder in `src/assets/topics/your-topic/`
2. Add `cover.jpeg` (illustrated image with numbered items)
3. Add `index.js`:

```js
import cover from './cover.jpeg'

export default {
  name: 'Your Topic Name',
  cover,
  words: ['word1', 'word2', 'word3'],
}
```

The app auto-discovers it — no other changes needed.
