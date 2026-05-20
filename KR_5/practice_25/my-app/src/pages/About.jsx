import { Suspense, lazy } from 'react'

// Ленивая загрузка 
const HeavyChart = lazy(() => import('../components/HeavyChart'))

export default function About() {
  return (
    <div>
      <h1>О нас</h1>
      <p>Страница демонстрации lazy loading</p>
      
      <Suspense fallback={<div>График загружается..</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}