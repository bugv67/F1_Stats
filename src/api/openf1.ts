const API_URL = 'https://api.openf1.org/v1/drivers'

export interface OpenF1Driver {
  driver_number: number
  full_name: string
  headshot_url: string
  team_name: string
  team_colour: string
}

export async function getDriverInfo(driverNumber: string) {
  const response = await fetch(
    `${API_URL}?driver_number=${driverNumber}&session_key=latest`
  )

  const data: OpenF1Driver[] = await response.json()

  return data[0]
}