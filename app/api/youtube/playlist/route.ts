import { type NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const playlistId = searchParams.get("playlistId")

  if (!playlistId) {
    return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch playlist from YouTube")
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    const playlist = data.items[0]
    return NextResponse.json({
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default?.url,
    })
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 })
  }
}
