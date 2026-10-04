const API_URL = 'https://api.openf1.org/v1/drivers'

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

export async function getDrivers() {
  const response = await fetch(`${API_URL}?session_key=latest`)

  if (!response.ok) {
    throw new Error(`OpenF1 request failed: ${response.status}`)
  }

  const data: OpenF1Driver[] = await response.json()

  return data
}