import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Study from './pages/Study'
import Quiz from './pages/Quiz'
import Score from './pages/Score'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/topics/:slug" element={<Study />} />
          <Route path="/topics/:slug/quiz" element={<Quiz />} />
          <Route path="/topics/:slug/score" element={<Score />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
