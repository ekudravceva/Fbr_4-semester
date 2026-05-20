import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Ленивая загрузка страниц
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Главная</Link>
          <Link to="/about" style={{ color: 'white' }}>О нас</Link>
        </nav>

        <Suspense fallback={<div>Загрузка страницы</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App