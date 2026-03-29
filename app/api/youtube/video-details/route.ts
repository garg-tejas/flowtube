import { type NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const videoIds = searchParams.get("videoIds")

  if (!videoIds) {
    return NextResponse.json({ error: "Video IDs are required" }, { status: 400 })
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch video details from YouTube")
    }

    const data = await response.json()

    // Parse ISO 8601 duration to seconds
    const parseDuration = (duration: string): number => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return 0

      const hours = Number.parseInt(match[1] || "0")
      const minutes = Number.parseInt(match[2] || "0")
      const seconds = Number.parseInt(match[3] || "0")

      return hours * 3600 + minutes * 60 + seconds
    }

    const videos = data.items.map((item: any) => ({
      id: item.id,
      duration: parseDuration(item.contentDetails.duration),
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error fetching video details:", error)
    return NextResponse.json({ error: "Failed to fetch video details" }, { status: 500 })
  }
}
