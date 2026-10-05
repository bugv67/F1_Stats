const BASE_URL = 'https://api.openf1.org/v1'

export interface OpenF1Driver {
  driver_number: number
  full_name: string
  first_name: string
  last_name: string
  name_acronym: string
  headshot_url: string | null
  team_name: string
  team_colour: string
}

export interface OpenF1Meeting {
  meeting_key: number
  meeting_name: string
  circuit_short_name: string
  circuit_image: string | null
  country_flag: string | null
  date_start: string
  date_end: string
}

export async function getDrivers() {
  const response = await fetch(`${BASE_URL}/drivers?session_key=latest`)

  if (!response.ok) {
    throw new Error(`OpenF1 request failed: ${response.status}`)
  }

  const data: OpenF1Driver[] = await response.json()

  return data
}

// All the race weekends ("meetings") of a season, in one request.
export async function getMeetings(year: number) {
  const response = await fetch(`${BASE_URL}/meetings?year=${year}`)

  if (!response.ok) {
    throw new Error(`OpenF1 request failed: ${response.status}`)
  }

  const data: OpenF1Meeting[] = await response.json()

  return data
}