const API_URL =
  'https://en.wikipedia.org/w/rest.php/v1/search/page?q=Monza%20Circuit&limit=1'

export async function getCircuitImage() {
  const response = await fetch(API_URL)

  const data = await response.json()

  return 'https:' + data.pages[0].thumbnail.url
}