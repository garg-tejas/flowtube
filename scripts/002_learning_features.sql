-- ============================================================================
-- FLOWTUBE: LEARNING FEATURES
-- ============================================================================
-- This script adds tables for note-taking, bookmarking, and tagging videos.
--
-- Requires: 001_core_tables.sql (Depends on videos and playlists tables)
-- Tables: notes, bookmarks, tags

-- Notes: Store markdown notes for videos or playlists
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  playlist_id uuid references public.playlists(id) on delete cascade,
  content text not null default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Either video_id or playlist_id must be set
  check (video_id is not null or playlist_id is not null)
);

-- Bookmarks: Mark important timestamps within a video
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  timestamp_seconds integer not null,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Tags: Custom tags for organizing videos beyond categories
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  tag text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, video_id, tag)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.notes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.tags enable row level security;

-- Notes: Users can only see/modify their own notes
create policy "Users can view their own notes"
  on public.notes for select using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete using (auth.uid() = user_id);

-- Bookmarks: Users can only see/modify their own bookmarks
create policy "Users can view their own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookmarks"
  on public.bookmarks for update using (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- Tags: Users can only see/modify their own tags
create policy "Users can view their own tags"
  on public.tags for select using (auth.uid() = user_id);

create policy "Users can insert their own tags"
  on public.tags for insert with check (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on public.tags for delete using (auth.uid() = user_id);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_video_id on public.notes(video_id);
create index if not exists idx_notes_playlist_id on public.notes(playlist_id);
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_video_id on public.bookmarks(video_id);
create index if not exists idx_tags_user_id on public.tags(user_id);
create index if not exists idx_tags_video_id on public.tags(video_id);
