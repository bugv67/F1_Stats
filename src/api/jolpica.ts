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