import type { Artwork } from '../types/artwork'

const API_URL = 'https://api.artic.edu/api/v1/artworks'

export async function fetchArtworks(page: number, limit: number) {
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`)
  const json = await res.json()

  return {
    rows: json.data as Artwork[],
    total: json.pagination.total
  }
}
