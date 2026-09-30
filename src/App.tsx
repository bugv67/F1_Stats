import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import './App.css'
import { getDriver } from './api/openf1'

getDriver()

function App() {
  const [lit, setLit] = useState(0)
  const [showDrivers, setShowDrivers] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setLit((l) => (l + 1) % 8), 600)
    return () => clearInterval(id)
  }, [])

  if (showDrivers) {
    return <HomePage onBack={() => setShowDrivers(false)} />
  }

  return (
    <div className="home-page">
      <header className="navbar">
        <h2>
          <span>🏎</span>F1 Stats
        </h2>
      </header>

      <main className="hero">
        <div className="start-lights" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={n <= lit ? 'on' : ''} />
          ))}
        </div>

        <h1>
          F1
          <br />
          Stats
        </h1>

        <p>
          Formula 1 statistics, standings and race information in one place.
        </p>

        <button onClick={() => setShowDrivers(true)}>Explore the season</button>
      </main>

      <div className="checker" aria-hidden="true" />
    </div>
  )
}

export default App