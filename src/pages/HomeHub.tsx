import { useEffect, useState } from 'react'

type HomeSection = 'drivers' | 'races' | 'constructors'

interface HomeHubProps {
  onSelectSection: (section: HomeSection) => void
}

function HomeHub({ onSelectSection }: HomeHubProps) {
  const [lit, setLit] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setLit((value) => (value + 1) % 6), 600)
    return () => clearInterval(id)
  }, [])

  const sections: { id: HomeSection; number: string; label: string }[] = [
    { id: 'drivers', number: '01', label: 'Drivers' },
    { id: 'races', number: '02', label: 'Races' },
    { id: 'constructors', number: '03', label: 'Constructors' },
  ]

  return (
    <div className="home-page">
      <header className="navbar">
        <h2>
          <span>🏎</span>F1 Stats
        </h2>
      </header>

      <main className="hero">
        <div className="start-lights" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((number) => (
            <i key={number} className={number <= lit ? 'on' : ''} />
          ))}
        </div>

        <h1>
          F1
          <br />
          Stats
        </h1>

        <p>Formula 1 stats, standings and race information in one place.</p>

        <nav className="home-section-list" aria-label="Explore F1 Stats">
          {sections.map((section) => (
            <button
              className="home-section-button"
              key={section.id}
              onClick={() => onSelectSection(section.id)}
            >
              <span className="home-section-number">{section.number}</span>
              <span className="home-section-name">{section.label}</span>
              <span className="home-section-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </nav>
      </main>

      <div className="checker" aria-hidden="true" />
    </div>
  )
}

export default HomeHub