import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Study from './pages/Study'
import Quiz from './pages/Quiz'
import Score from './pages/Score'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-surface to-gray-950">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/topics/:slug" element={<Study />} />
            <Route path="/topics/:slug/quiz" element={<Quiz />} />
            <Route path="/topics/:slug/score" element={<Score />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  )
}
