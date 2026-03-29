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
    let allVideos: any[] = []
    let nextPageToken = ""

    // Fetch all videos from playlist (handle pagination)
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch videos from YouTube")
      }

      const data = await response.json()
      allVideos = allVideos.concat(data.items || [])
      nextPageToken = data.nextPageToken || ""
    } while (nextPageToken)

    const videoIds = allVideos.map((item) => item.contentDetails.videoId).join(",")
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
    )

    const detailsData = await detailsResponse.json()

    const parseDuration = (duration: string): number => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return 0

      const hours = Number.parseInt(match[1] || "0")
      const minutes = Number.parseInt(match[2] || "0")
      const seconds = Number.parseInt(match[3] || "0")

      return hours * 3600 + minutes * 60 + seconds
    }

    const durationMap = new Map(
      detailsData.items.map((item: any) => [item.id, parseDuration(item.contentDetails.duration)]),
    )

    const videos = allVideos.map((item: any, index: number) => ({
      youtube_video_id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      position: index,
      duration: durationMap.get(item.contentDetails.videoId) || 0,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}
