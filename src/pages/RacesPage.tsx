import { useEffect, useState } from 'react'
import {
  getRaceResults,
  getRaces,
  SEASON,
  type Race,
  type RaceWithResults,
} from '../api/jolpica'
import { getMeetings, type OpenF1Meeting } from '../api/openf1'

interface RacesPageProps {
  onBack: () => void
}

interface PodiumEntry {
  position: string
  driverName: string
  teamName: string
}

// Everything one card needs, already prepared, so the card itself stays simple.
interface RaceCardData {
  round: string
  name: string
  city: string
  country: string
  circuitName: string
  dateLabel: string
  imageUrl: string
  flagUrl: string
  podium: PodiumEntry[]
}

const MEDALS: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' }

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// Reads the day and month straight from the text ('2026-09-06') instead of
// using `new Date()`, which can shift the day because of time zones.
function parseDay(isoDate: string) {
  const [, month, day] = isoDate.slice(0, 10).split('-')
  return { day: Number(day), month: Number(month) - 1 }
}

// '2026-09-04' + '2026-09-06' -> '4–6 September'
function formatDateRange(start: string, end: string): string {
  const first = parseDay(start)
  const last = parseDay(end)

  if (first.month !== last.month) {
    return `${first.day} ${MONTHS[first.month]} – ${last.day} ${MONTHS[last.month]}`
  }

  if (first.day === last.day) {
    return `${first.day} ${MONTHS[first.month]}`
  }

  return `${first.day}–${last.day} ${MONTHS[first.month]}`
}

// OpenF1 has no round number, so we match by date:
// the race day from Jolpica must fall inside the OpenF1 weekend.
// Dates in 'YYYY-MM-DD' form can be compared as plain text.
function findMeeting(
  race: Race,
  meetings: OpenF1Meeting[],
): OpenF1Meeting | undefined {
  return meetings.find(
    (meeting) =>
      race.date >= meeting.date_start.slice(0, 10) &&
      race.date <= meeting.date_end.slice(0, 10),
  )
}

function buildRaceCards(
  races: Race[],
  results: RaceWithResults[],
  meetings: OpenF1Meeting[],
): RaceCardData[] {
  // round number -> the top 3 of that race
  const podiumByRound = new Map<string, PodiumEntry[]>()

  for (const result of results) {
    podiumByRound.set(
      result.round,
      result.Results.filter((entry) => Boolean(MEDALS[entry.position])).map(
        (entry) => ({
          position: entry.position,
          driverName: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
          teamName: entry.Constructor.name,
        }),
      ),
    )
  }

  return races.map((race) => {
    const meeting = findMeeting(race, meetings)

    return {
      round: race.round,
      name: race.raceName,
      city: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      circuitName: race.Circuit.circuitName,
      dateLabel: meeting
        ? formatDateRange(meeting.date_start, meeting.date_end)
        : formatDateRange(race.date, race.date),
      imageUrl: meeting?.circuit_image ?? '',
      flagUrl: meeting?.country_flag ?? '',
      podium: podiumByRound.get(race.round) ?? [],
    }
  })
}

interface RaceCardProps {
  race: RaceCardData
}

function RaceCard({ race }: RaceCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={`race-card${flipped ? ' is-flipped' : ''}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className="race-card-inner">
        {/* Front: track image, date, name, location */}
        <span className="race-card-face race-card-front">
          {race.imageUrl ? (
            <img
              src={race.imageUrl}
              alt={`${race.circuitName} circuit`}
              className="race-card-image"
            />
          ) : (
            <span className="race-card-image race-card-placeholder">
              R{race.round}
            </span>
          )}

          <span className="race-card-info">
            <span className="race-card-meta">
              {race.flagUrl && (
                <img src={race.flagUrl} alt="" className="race-card-flag" />
              )}
              <span>{race.dateLabel}</span>
            </span>
            <span className="race-card-name">{race.name}</span>
            <span className="race-card-location">
              {race.city}, {race.country}
            </span>
          </span>
        </span>

        {/* Back: circuit and podium (the podium shows only if the race has happened) */}
        <span className="race-card-face race-card-back">
          <span className="race-card-back-name">{race.name}</span>
          <span className="race-card-circuit">{race.circuitName}</span>

          {race.podium.length > 0 && (
            <span className="race-card-podium">
              {race.podium.map((entry) => (
                <span className="race-card-podium-row" key={entry.position}>
                  <span className="race-card-podium-medal" aria-hidden="true">
                    {MEDALS[entry.position]}
                  </span>
                  <span className="race-card-podium-driver">
                    {entry.driverName}
                  </span>
                  <span className="race-card-podium-team">
                    {entry.teamName}
                  </span>
                </span>
              ))}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function RacesPage({ onBack }: RacesPageProps) {
  const [races, setRaces] = useState<RaceCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Runs once when the page mounts: exactly three requests in total.
  useEffect(() => {
    let isCurrent = true

    Promise.all([
      getRaces(), // required: if this fails, we show an error
      getRaceResults().catch(() => []), // optional: without it, no podium
      getMeetings(SEASON).catch(() => []), // optional: without it, no images
    ])
      .then(([calendar, results, meetings]) => {
        if (isCurrent) {
          setRaces(buildRaceCards(calendar, results, meetings))
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError('Unable to load the races.')
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
        <h1 className="standings-heading">Races</h1>
        <p className="standings-summary">
          Hover over a card, or tap it, to see the podium.
        </p>

        {loading && (
          <p className="standings-message" role="status">
            Loading races...
          </p>
        )}
        {!loading && error && (
          <p className="standings-message" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && races.length === 0 && (
          <p className="standings-message" role="status">
            No races are available yet for {SEASON}.
          </p>
        )}

        {!loading && !error && races.length > 0 && (
          <section className="races-grid" aria-label="Race calendar">
            {races.map((race) => (
              <RaceCard key={race.round} race={race} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default RacesPage