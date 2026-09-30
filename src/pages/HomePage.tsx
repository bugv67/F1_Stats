import { useEffect, useState } from 'react'
import { getDriverStandings, SEASON, type DriverStanding } from '../api/jolpica'

interface HomePageProps {
  onBack: () => void
}

function HomePage({ onBack }: HomePageProps) {
  const [standings, setStandings] = useState<DriverStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    getDriverStandings()
      .then((drivers) => {
        if (isCurrent) setStandings(drivers)
      })
      .catch(() => {
        if (isCurrent) setError('Unable to load the driver standings.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <div className="standings-page">
      <header className="standings-navbar">
        <p className="standings-brand">
          <span aria-hidden="true">F1</span> Stats
        </p>
        <button className="back-button" onClick={onBack}>
          Back to home
        </button>
      </header>

      <main className="standings-content">
        <p className="standings-eyebrow">{SEASON} season</p>
        <h1 className="standings-heading">Driver standings</h1>
        <p className="standings-summary">The championship fight, position by position.</p>

        {loading && (
          <p className="standings-message" role="status">
            Loading driver standings...
          </p>
        )}
        {!loading && error && (
          <p className="standings-message" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && standings.length === 0 && (
          <p className="standings-message" role="status">
            No driver standings are available yet for {SEASON}.
          </p>
        )}
        {!loading && !error && standings.length > 0 && (
          <div className="standings-table-wrap">
            <table className="standings-table">
              <thead>
                <tr>
                  <th scope="col">Pos</th>
                  <th scope="col">Driver</th>
                  <th scope="col">Team</th>
                  <th scope="col">Nationality</th>
                  <th scope="col">Wins</th>
                  <th scope="col">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr key={standing.Driver.familyName}>
                    <td className="standings-position">{standing.position}</td>
                    <td className="driver-name">
                      <span className="driver-number">
                        {standing.Driver.permanentNumber ?? standing.Driver.code ?? '-'}
                      </span>
                      {standing.Driver.givenName} {standing.Driver.familyName}
                    </td>
                    <td>{standing.Constructors[0]?.name ?? '-'}</td>
                    <td>{standing.Driver.nationality}</td>
                    <td>{standing.wins}</td>
                    <td className="standings-points">{standing.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage