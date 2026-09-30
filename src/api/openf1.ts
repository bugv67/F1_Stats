const API_URL =
  'https://api.openf1.org/v1/drivers?driver_number=44&session_key=9462'

export async function getDriver() {
  const response = await fetch(API_URL)

  const data = await response.json()

  console.log(data)
}