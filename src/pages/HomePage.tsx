import { useEffect, useState } from 'react'
import {
  getDriverStandings,
  SEASON,
  type DriverStanding,
} from '../api/jolpica'
import { getDrivers } from '../api/openf1'

interface HomePageProps {
  onBack: () => void
}

interface DriverWithImage extends DriverStanding {
  imageUrl: string
}

function HomePage({ onBack }: HomePageProps) {
  const [standings, setStandings] = useState<DriverWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    Promise.all([
      getDriverStandings(),
      getDrivers(),
    ])
      .then(([driverStandings, openF1Drivers]) => {
        const driversWithImages = driverStandings.map((driver) => {
          const driverNumber =
            driver.Driver.permanentNumber ?? driver.Driver.code

          const driverInfo = openF1Drivers.find(
            (openF1Driver) =>
              openF1Driver.driver_number.toString() === driverNumber,
          )

          return {
            ...driver,
            imageUrl: driverInfo?.headshot_url ?? '',
          }
        })

        if (isCurrent) {
          setStandings(driversWithImages)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError('Unable to load the driver standings.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const firstPlace = standings.find(
    (standing) => standing.position === '1',
  )

  const secondPlace = standings.find(
    (standing) => standing.position === '2',
  )

  const thirdPlace = standings.find(
    (standing) => standing.position === '3',
  )

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

        <p className="standings-summary">
          The championship fight, position by position.
        </p>

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
          <>
            {/* Podium */}
            {firstPlace && secondPlace && thirdPlace && (
              <section className="podium" aria-label="Top three drivers">
                <div className="podium-place podium-second">
                  <div className="podium-card">
                    <span className="podium-medal">🥈</span>

                    {secondPlace.imageUrl && (
                      <img
                        src={secondPlace.imageUrl}
                        alt={`${secondPlace.Driver.givenName} ${secondPlace.Driver.familyName}`}
                        className="podium-driver-image"
                      />
                    )}

                    <h2>
                      {secondPlace.Driver.givenName}{' '}
                      {secondPlace.Driver.familyName}
                    </h2>

                    <p className="podium-team">
                      {secondPlace.Constructors[0]?.name ?? '-'}
                    </p>

                    <p className="podium-points">
                      {secondPlace.points} pts
                    </p>
                  </div>

                  <div className="podium-block podium-block-second">
                    2
                  </div>
                </div>

                <div className="podium-place podium-first">
                  <div className="podium-card">
                    <span className="podium-medal">🥇</span>

                    {firstPlace.imageUrl && (
                      <img
                        src={firstPlace.imageUrl}
                        alt={`${firstPlace.Driver.givenName} ${firstPlace.Driver.familyName}`}
                        className="podium-driver-image"
                      />
                    )}

                    <h2>
                      {firstPlace.Driver.givenName}{' '}
                      {firstPlace.Driver.familyName}
                    </h2>

                    <p className="podium-team">
                      {firstPlace.Constructors[0]?.name ?? '-'}
                    </p>

                    <p className="podium-points">
                      {firstPlace.points} pts
                    </p>
                  </div>

                  <div className="podium-block podium-block-first">
                    1
                  </div>
                </div>

                <div className="podium-place podium-third">
                  <div className="podium-card">
                    <span className="podium-medal">🥉</span>

                    {thirdPlace.imageUrl && (
                      <img
                        src={thirdPlace.imageUrl}
                        alt={`${thirdPlace.Driver.givenName} ${thirdPlace.Driver.familyName}`}
                        className="podium-driver-image"
                      />
                    )}

                    <h2>
                      {thirdPlace.Driver.givenName}{' '}
                      {thirdPlace.Driver.familyName}
                    </h2>

                    <p className="podium-team">
                      {thirdPlace.Constructors[0]?.name ?? '-'}
                    </p>

                    <p className="podium-points">
                      {thirdPlace.points} pts
                    </p>
                  </div>

                  <div className="podium-block podium-block-third">
                    3
                  </div>
                </div>
              </section>
            )}

            {/* Full standings table */}
            <section className="full-standings">
              <h2 className="full-standings-heading">
                Full standings
              </h2>

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
                        <td className="standings-position">
                          {standing.position === '1' && '🥇'}
                          {standing.position === '2' && '🥈'}
                          {standing.position === '3' && '🥉'}
                          {standing.position !== '1' &&
                            standing.position !== '2' &&
                            standing.position !== '3' &&
                            standing.position}
                        </td>

                        <td className="driver-name">
                          <span className="driver-number">
                            {standing.Driver.permanentNumber ??
                              standing.Driver.code ??
                              '-'}
                          </span>

                          {standing.Driver.givenName}{' '}
                          {standing.Driver.familyName}
                        </td>

                        <td>
                          {standing.Constructors[0]?.name ?? '-'}
                        </td>

                        <td>{standing.Driver.nationality}</td>

                        <td>{standing.wins}</td>

                        <td className="standings-points">
                          {standing.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default HomePage