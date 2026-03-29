# FlowTube

**Curate your own wave of content.**

A YouTube playlist manager with progress tracking, notes, and learning paths. Watch smarter, learn faster.

## Features

- **Playlist Management** - Add YouTube playlists (URL/ID) with categories
- **Smart Feed** - Next video to watch from each playlist
- **Progress Tracking** - Auto-saves watch time with totals
- **Resume Watching** - Continue from where you left off
- **Video Player** - Keyboard shortcuts, playback speed, chapters, bookmarks
- **Notes & Export** - Markdown notes with PDF/MD export
- **Video Tags** - Custom tags for organization
- **Learning Paths** - Combine playlists into structured curricula
- **Achievements** - 21 badges for milestones and streaks
- **Global Search** - Press `/` to search videos, playlists, paths with real-time results
- **Real Notifications** - Database-backed notification system
- **User Profile** - Account settings and management
- **Dark/Light Mode** - Theme toggle

## Quick Start

### 1. Database Setup

Run SQL scripts in order from `/scripts`:

1. **`001_core_tables.sql`** - Essential tables: playlists, videos, watch_progress
2. **`002_learning_features.sql`** - Notes, bookmarks, tags for enhanced learning
3. **`003_advanced_features.sql`** - Learning paths and achievement gamification

Each script includes RLS policies and indexes for security and performance.

### 2. Environment Variables

- `YOUTUBE_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/)

### 3. Authentication

Supabase auth is pre-configured. Ensure environment variables are set.

## How It Works

1. Add YouTube playlists with optional categories
2. App fetches videos via YouTube API
3. Watch progress auto-saves every 5 seconds
4. Smart feed shows next video per playlist
5. Take notes, earn achievements, create learning paths

## Keyboard Shortcuts

| Shortcut       | Action         |
| -------------- | -------------- |
| `Space`        | Play/Pause     |
| `←/→`          | Rewind/Forward |
| `N`            | Next video     |
| `/` or `Cmd+K` | Global search  |
| `?`            | Show shortcuts |
| `Escape`       | Close dialogs  |

## Tech Stack

- **Frontend** - Next.js 15.5.9, React 19, TypeScript, Tailwind CSS v4
- **Backend** - Supabase (PostgreSQL) with RLS
- **Auth** - Supabase Auth
- **Video** - YouTube IFrame API
- **UI** - shadcn/ui components
- **Export** - jsPDF
- **Data** - SWR for fetch/cache
