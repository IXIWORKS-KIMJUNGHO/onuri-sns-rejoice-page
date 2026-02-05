import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'
import Layout from './components/Layout'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const WeeklyPage = lazy(() => import('./pages/WeeklyPage'))
const PlacesPage = lazy(() => import('./pages/PlacesPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const RecreationPage = lazy(() => import('./pages/RecreationPage'))
const GuessLeaderGame = lazy(() => import('./pages/GuessLeaderGame'))
const GoldenBellGame = lazy(() => import('./pages/GoldenBellGame'))
const SayTheWordOnBeat = lazy(() => import('./pages/SayTheWordOnBeat'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader__spinner"></div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="weekly" element={<WeeklyPage />} />
            <Route path="places" element={<PlacesPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="recreation" element={<RecreationPage />} />
            <Route path="recreation/guess-leader" element={<GuessLeaderGame />} />
            <Route path="recreation/golden-bell" element={<GoldenBellGame />} />
            <Route path="recreation/say-the-word" element={<SayTheWordOnBeat />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
