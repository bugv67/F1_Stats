export const SEASON = 2026

export interface DriverStanding {
  position: string
  points: string
  wins: string
  Driver: {
    givenName: string
    familyName: string
    code?: string
    permanentNumber?: string
    nationality: string
  }
  Constructors: Array<{
    name: string
  }>
}

interface StandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: DriverStanding[]
      }>
    }
  }
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${SEASON}/driverStandings.json`,
  )

  if (!response.ok) {
    throw new Error('Could not load driver standings.')
  }

  const data: StandingsResponse = await response.json()
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? []
}

// ---------- Races ----------

export interface Race {
  round: string
  raceName: string
  date: string
  Circuit: {
    circuitName: string
    Location: {
      locality: string
      country: string
    }
  }
}

export interface RaceResultEntry {
  position: string
  Driver: {
    givenName: string
    familyName: string
  }
  Constructor: {
    name: string
  }
}

export interface RaceWithResults {
  round: string
  Results: RaceResultEntry[]
}

interface RacesResponse {
  MRData: {
    RaceTable: {
      Races: Race[]
    }
  }
}

interface RaceResultsResponse {
  MRData: {
    RaceTable: {
      Races: RaceWithResults[]
    }
  }
}

// The season calendar. `limit=100` because the API returns only 30 items by default.
export async function getRaces(): Promise<Race[]> {
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${SEASON}/races.json?limit=100`,
  )

  if (!response.ok) {
    throw new Error('Could not load the races.')
  }

  const data: RacesResponse = await response.json()
  return data.MRData.RaceTable.Races
}

// The results of every race so far, in ONE request.
// The limit counts result rows (about 20 per race), so 1000 covers a full season.
export async function getRaceResults(): Promise<RaceWithResults[]> {
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${SEASON}/results.json?limit=1000`,
  )

  if (!response.ok) {
    throw new Error('Could not load the race results.')
  }

  const data: RaceResultsResponse = await response.json()
  return data.MRData.RaceTable.Races
}