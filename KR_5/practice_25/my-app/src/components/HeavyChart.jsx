// Имитация тяжелого компонента с большим модулем
import { select, scaleLinear } from 'd3' 


export default function HeavyChart() {
  const data = Array.from({ length: 1000 }, () => Math.random())
  
  return (
    <div style={{ padding: '1rem', background: '#f0f0f0' }}>
      <h3>Аналитический график</h3>
      <p>Место для визуализации данных</p>
      <p>Размер данных: {data.length} точек</p>
    </div>
  )
}