import { useEffect, useState, type CSSProperties } from 'react'
import {
  getDriverStandings,
  SEASON,
  type DriverStanding,
} from '../api/jolpica'
import { getDrivers, type OpenF1Driver } from '../api/openf1'

interface DriversPageProps {
  onBack: () => void
}

interface DriverWithImage extends DriverStanding {
  imageUrl: string
  teamColour: string
}

interface DriverCardProps {
  driver: DriverWithImage
}

type DriversView = 'drivers' | 'standings'

const FALLBACK_TEAM_COLOUR = 'e10600'

const MEDALS: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' }

// Lower-cases a name and removes accents, so 'Pérez' and 'Perez' are equal.
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Finds the OpenF1 driver that matches a driver from Jolpica.
// Tries three ways, in order, and returns the first match:
// 1. the driver's number
// 2. the three-letter code (e.g. VER)
// 3. the family name (ignoring accents)
function findOpenF1Driver(
  driver: DriverStanding['Driver'],
  openF1Drivers: OpenF1Driver[],
): OpenF1Driver | undefined {
  const byNumber = openF1Drivers.find(
    (openF1Driver) =>
      openF1Driver.driver_number.toString() === driver.permanentNumber,
  )
  if (byNumber) {
    return byNumber
  }

  const byCode = driver.code
    ? openF1Drivers.find(
        (openF1Driver) => openF1Driver.name_acronym === driver.code,
      )
    : undefined
  if (byCode) {
    return byCode
  }

  return openF1Drivers.find(
    (openF1Driver) =>
      normalizeName(openF1Driver.last_name) ===
      normalizeName(driver.familyName),
  )
}

// Turns a team colour from OpenF1 (HEX without '#') into CSS variables:
// --team-colour: the team's colour
// --team-text: dark or white text, whichever is readable on top of that colour
function getTeamStyle(teamColour: string): CSSProperties {
  const colour = /^[0-9a-f]{6}$/i.test(teamColour)
    ? teamColour
    : FALLBACK_TEAM_COLOUR

  const red = parseInt(colour.slice(0, 2), 16)
  const green = parseInt(colour.slice(2, 4), 16)
  const blue = parseInt(colour.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return {
    '--team-colour': `#${colour}`,
    '--team-text': brightness > 150 ? '#15151e' : '#ffffff',
  } as CSSProperties
}

function DriverCard({ driver }: DriverCardProps) {
  const [flipped, setFlipped] = useState(false)

  const fullName = `${driver.Driver.givenName} ${driver.Driver.familyName}`
  const number = driver.Driver.permanentNumber ?? driver.Driver.code ?? '-'
  const teamName = driver.Constructors[0]?.name ?? '-'
  const medal = MEDALS[driver.position]

  return (
    <button
      type="button"
      className={`driver-card${flipped ? ' is-flipped' : ''}`}
      style={getTeamStyle(driver.teamColour)}
      aria-pressed={flipped}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className="driver-card-inner">
        <span className="driver-card-face driver-card-front">
          {medal && (
            <span
              className="driver-card-medal"
              role="img"
              aria-label={`Position ${driver.position}`}
            >
              {medal}
            </span>
          )}

          {driver.imageUrl ? (
            <img
              src={driver.imageUrl}
              alt={fullName}
              className="driver-card-image"
            />
          ) : (
            <span className="driver-card-image driver-card-placeholder">
              {number}
            </span>
          )}
          <span className="driver-card-name">{fullName}</span>
          <span className="driver-card-number">{number}</span>
          <span className="driver-card-team">{teamName}</span>
        </span>

        <span className="driver-card-face driver-card-back">
          <span className="driver-card-back-team">{teamName}</span>
          <span className="driver-card-stat">
            <span className="driver-card-stat-label">Position</span>
            <span className="driver-card-stat-value">{driver.position}</span>
          </span>
          <span className="driver-card-stat">
            <span className="driver-card-stat-label">Points</span>
            <span className="driver-card-stat-value">{driver.points}</span>
          </span>
        </span>
      </span>
    </button>
  )
}

function DriversPage({ onBack }: DriversPageProps) {
  const [view, setView] = useState<DriversView>('standings')
  const [standings, setStandings] = useState<DriverWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Runs once when the page mounts. Both tabs read from the same `standings`.
  useEffect(() => {
    let isCurrent = true

    Promise.all([getDriverStandings(), getDrivers()])
      .then(([driverStandings, openF1Drivers]) => {
        const driversWithImages = driverStandings.map((standing) => {
          const driverInfo = findOpenF1Driver(standing.Driver, openF1Drivers)

          return {
            ...standing,
            imageUrl: driverInfo?.headshot_url ?? '',
            teamColour: driverInfo?.team_colour ?? '',
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

  const firstPlace = standings.find((standing) => standing.position === '1')
  const secondPlace = standings.find((standing) => standing.position === '2')
  const thirdPlace = standings.find((standing) => standing.position === '3')

  const hasData = !loading && !error && standings.length > 0

  return (
    <div className="standings-page">
      <header className="standings-navbar">
        <p className="standings-brand">
          <span aria-hidden="true">F1</span> Stats
        </p>

        <div className="drivers-nav-actions">
          <div
            className="drivers-view-toggle"
            role="group"
            aria-label="Driver view"
          >
            <button
              type="button"
              className={view === 'drivers' ? 'is-active' : ''}
              aria-pressed={view === 'drivers'}
              onClick={() => setView('drivers')}
            >
              Drivers
            </button>
            <button
              type="button"
              className={view === 'standings' ? 'is-active' : ''}
              aria-pressed={view === 'standings'}
              onClick={() => setView('standings')}
            >
              Standings
            </button>
          </div>
          <button className="back-button" onClick={onBack}>
            Back to home
          </button>
        </div>
      </header>

      <main className="standings-content">
        <p className="standings-eyebrow">{SEASON} season</p>
        <h1 className="standings-heading">
          {view === 'standings' ? 'Driver standings' : 'Drivers'}
        </h1>

        <p className="standings-summary">
          {view === 'standings'
            ? 'The championship fight, position by position.'
            : 'Hover over a card, or tap it, to see the details.'}
        </p>

        {loading && (
          <p className="standings-message" role="status">
            Loading drivers...
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

        {/* Drivers tab: grid of flip cards */}
        {hasData && view === 'drivers' && (
          <section className="drivers-grid" aria-label="All drivers">
            {standings.map((driver) => (
              <DriverCard key={driver.Driver.familyName} driver={driver} />
            ))}
          </section>
        )}

        {/* Standings tab: podium + full table */}
        {hasData && view === 'standings' && (
          <>
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
                    <p className="podium-points">{secondPlace.points} pts</p>
                  </div>
                  <div className="podium-block podium-block-second">2</div>
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
                    <p className="podium-points">{firstPlace.points} pts</p>
                  </div>
                  <div className="podium-block podium-block-first">1</div>
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
                    <p className="podium-points">{thirdPlace.points} pts</p>
                  </div>
                  <div className="podium-block podium-block-third">3</div>
                </div>
              </section>
            )}

            <section className="full-standings">
              <h2 className="full-standings-heading">Full standings</h2>
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
                        <td>{standing.Constructors[0]?.name ?? '-'}</td>
                        <td>{standing.Driver.nationality}</td>
                        <td>{standing.wins}</td>
                        <td className="standings-points">
                          <span
                            className="points-badge"
                            style={getTeamStyle(standing.teamColour)}
                          >
                            {standing.points}
                          </span>
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

export default DriversPage