-- ============================================================================
-- FLOWTUBE: CORE TABLES
-- ============================================================================
-- This script creates the core tables for managing YouTube playlists, videos,
-- and tracking watch progress.
-- 
-- Tables: playlists, videos, watch_progress

-- Playlists: Store user's YouTube playlists with metadata
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_playlist_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  category text, -- User-defined category for organization
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Videos: Store videos from user's playlists
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  youtube_video_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  duration integer, -- duration in seconds
  position integer not null, -- position in playlist
  created_at timestamp with time zone default now()
);

-- Watch Progress: Track how much of each video the user has watched
create table if not exists public.watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  progress_seconds integer not null default 0, -- seconds watched
  completed boolean not null default false, -- fully watched?
  last_watched_at timestamp with time zone default now(),
  unique(user_id, video_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.playlists enable row level security;
alter table public.videos enable row level security;
alter table public.watch_progress enable row level security;

-- Playlists: Users can only see/modify their own playlists
create policy "Users can view their own playlists"
  on public.playlists for select using (auth.uid() = user_id);

create policy "Users can insert their own playlists"
  on public.playlists for insert with check (auth.uid() = user_id);

create policy "Users can update their own playlists"
  on public.playlists for update using (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on public.playlists for delete using (auth.uid() = user_id);

-- Videos: Users can see videos from their playlists only
create policy "Users can view videos from their playlists"
  on public.videos for select
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can insert videos to their playlists"
  on public.videos for insert
  with check (
    exists (
      select 1 from public.playlists
      where playlists.id = videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can update videos in their playlists"
  on public.videos for update
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

create policy "Users can delete videos from their playlists"
  on public.videos for delete
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = videos.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

-- Watch Progress: Users can only see/modify their own progress
create policy "Users can view their own watch progress"
  on public.watch_progress for select using (auth.uid() = user_id);

create policy "Users can insert their own watch progress"
  on public.watch_progress for insert with check (auth.uid() = user_id);

create policy "Users can update their own watch progress"
  on public.watch_progress for update using (auth.uid() = user_id);

create policy "Users can delete their own watch progress"
  on public.watch_progress for delete using (auth.uid() = user_id);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

create index if not exists idx_playlists_user_id on public.playlists(user_id);
create index if not exists idx_playlists_category on public.playlists(category);
create index if not exists idx_videos_playlist_id on public.videos(playlist_id);
create index if not exists idx_watch_progress_user_id on public.watch_progress(user_id);
create index if not exists idx_watch_progress_playlist_id on public.watch_progress(playlist_id);
