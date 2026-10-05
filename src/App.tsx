import { useState } from 'react'
import DriversPage from './pages/DriversPage'
import RacesPage from './pages/RacesPage'
import HomeHub from './pages/HomeHub'
import './App.css'

type Section = 'home' | 'drivers' | 'races' | 'constructors'

function App() {
  const [section, setSection] = useState<Section>('home')

  if (section === 'drivers') {
    return <DriversPage onBack={() => setSection('home')} />
  }

  if (section === 'races') {
    return <RacesPage onBack={() => setSection('home')} />
  }

  if (section === 'constructors') {
    return (
      <div className="standings-page">
        <header className="standings-navbar">
          <p className="standings-brand">
            <span aria-hidden="true">F1</span> Stats
          </p>

          <button
            className="back-button"
            onClick={() => setSection('home')}
          >
            Back to home
          </button>
        </header>

        <main className="standings-content">
          <p className="standings-eyebrow">Constructors</p>
          <h1 className="standings-heading">Constructors</h1>
          <p className="standings-summary">Coming soon.</p>
        </main>
      </div>
    )
  }

  return <HomeHub onSelectSection={setSection} />
}

export default App