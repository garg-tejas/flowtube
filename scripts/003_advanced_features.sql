-- ============================================================================
-- FLOWTUBE: ADVANCED FEATURES
-- ============================================================================
-- This script adds tables for learning paths and achievement gamification.
--
-- Requires: 001_core_tables.sql (Depends on playlists table)
-- Tables: learning_paths, learning_path_playlists, achievements

-- Learning Paths: Group multiple playlists into structured learning curricula
create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Learning Path Playlists: Junction table linking playlists to learning paths
create table if not exists public.learning_path_playlists (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  position integer not null default 0, -- order within the learning path
  created_at timestamp with time zone default now(),
  unique(learning_path_id, playlist_id)
);

-- Achievements: Track user achievements and badges
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  achievement_data jsonb, -- flexible data storage for badge metadata
  unlocked_at timestamp with time zone default now(),
  unique(user_id, achievement_type)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.learning_paths enable row level security;
alter table public.learning_path_playlists enable row level security;
alter table public.achievements enable row level security;

-- Learning Paths: Users can only see/modify their own learning paths
create policy "Users can view their own learning paths"
  on public.learning_paths for select using (auth.uid() = user_id);

create policy "Users can insert their own learning paths"
  on public.learning_paths for insert with check (auth.uid() = user_id);

create policy "Users can update their own learning paths"
  on public.learning_paths for update using (auth.uid() = user_id);

create policy "Users can delete their own learning paths"
  on public.learning_paths for delete using (auth.uid() = user_id);

-- Learning Path Playlists: Users can manage playlists in their learning paths
create policy "Users can view their learning path playlists"
  on public.learning_path_playlists for select
  using (
    exists (
      select 1 from public.learning_paths
      where id = learning_path_id and user_id = auth.uid()
    )
  );

create policy "Users can insert their learning path playlists"
  on public.learning_path_playlists for insert
  with check (
    exists (
      select 1 from public.learning_paths
      where id = learning_path_id and user_id = auth.uid()
    )
  );

create policy "Users can update their learning path playlists"
  on public.learning_path_playlists for update
  using (
    exists (
      select 1 from public.learning_paths
      where id = learning_path_id and user_id = auth.uid()
    )
  );

create policy "Users can delete their learning path playlists"
  on public.learning_path_playlists for delete
  using (
    exists (
      select 1 from public.learning_paths
      where id = learning_path_id and user_id = auth.uid()
    )
  );

-- Achievements: Users can only see/manage their own achievements
create policy "Users can view their own achievements"
  on public.achievements for select using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
  on public.achievements for insert with check (auth.uid() = user_id);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

create index if not exists idx_learning_paths_user_id on public.learning_paths(user_id);
create index if not exists idx_learning_path_playlists_path_id on public.learning_path_playlists(learning_path_id);
create index if not exists idx_learning_path_playlists_playlist_id on public.learning_path_playlists(playlist_id);
create index if not exists idx_achievements_user_id on public.achievements(user_id);
