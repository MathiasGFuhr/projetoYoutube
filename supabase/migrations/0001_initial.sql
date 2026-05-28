-- StudioHub Initial Schema
-- Created: 2026-05-28

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Profile ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended user profiles synced from auth.users';

-- Trigger to auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Channels ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT NOT NULL,
  handle      TEXT,
  link        TEXT,
  color       TEXT DEFAULT '#ef4444',
  photo_url   TEXT,
  niche       TEXT,
  videos      INTEGER DEFAULT 0,
  published   INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.channels IS 'YouTube channels managed by the user';

-- ─── Videos / Projects ───────────────────────────────────────────────────
CREATE TYPE public.video_status AS ENUM (
  'Ideia', 'Roteiro', 'Narração', 'Thumbnail', 'Edição',
  'Renderização', 'Pronto', 'Agendado', 'Publicado'
);

CREATE TYPE public.video_priority AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE public.video_type AS ENUM (
  'Vídeo Standard', 'Shorts', 'Live', 'Documentário', 'Tutorial'
);

CREATE TABLE IF NOT EXISTS public.videos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  channel_id    UUID NOT NULL REFERENCES public.channels ON DELETE CASCADE,
  title         TEXT NOT NULL,
  status        public.video_status DEFAULT 'Ideia',
  priority      public.video_priority DEFAULT 'media',
  video_type    public.video_type DEFAULT 'Vídeo Standard',
  publish_date  DATE,
  drive_link    TEXT,
  local_path    TEXT,
  thumbnail_url TEXT,
  description   TEXT,
  notes         TEXT,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.videos IS 'Video productions / projects pipeline';

-- ─── Ideas ─────────────────────────────────────────────────────────────────
CREATE TYPE public.idea_status AS ENUM (
  'ativa', 'em_desenvolvimento', 'usada', 'arquivada'
);

CREATE TABLE IF NOT EXISTS public.ideas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES public.channels ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  tags        TEXT[] DEFAULT '{}',
  status      public.idea_status DEFAULT 'ativa',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.ideas IS 'Content idea bank';

-- ─── Activity Log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('video', 'channel', 'idea')),
  entity_id   UUID,
  action      TEXT NOT NULL, -- e.g. 'created', 'updated', 'published', 'stage_changed'
  title       TEXT,
  description TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.activity_log IS 'Activity feed for the dashboard';

-- ─── Updated At Triggers ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'channels', 'videos', 'ideas')
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%s
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;

-- ─── Row Level Security (RLS) ──────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Channels
CREATE POLICY "Users can view own channels"
  ON public.channels FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own channels"
  ON public.channels FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON public.channels FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels"
  ON public.channels FOR DELETE USING (auth.uid() = user_id);

-- Videos
CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own videos"
  ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE USING (auth.uid() = user_id);

-- Ideas
CREATE POLICY "Users can view own ideas"
  ON public.ideas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ideas"
  ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON public.ideas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas"
  ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- Activity Log
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity"
  ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX idx_channels_user_id ON public.channels(user_id);
CREATE INDEX idx_videos_user_id   ON public.videos(user_id);
CREATE INDEX idx_videos_channel_id ON public.videos(channel_id);
CREATE INDEX idx_videos_status     ON public.videos(status);
CREATE INDEX idx_videos_publish_date ON public.videos(publish_date);
CREATE INDEX idx_ideas_user_id     ON public.ideas(user_id);
CREATE INDEX idx_ideas_status      ON public.ideas(status);
CREATE INDEX idx_activity_user_id  ON public.activity_log(user_id);
CREATE INDEX idx_activity_created  ON public.activity_log(created_at DESC);

-- ─── Realtime for activity_log ─────────────────────────────────────────────
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;

-- ─── Insert Demo Data (optional, for testing) ────────────────────────────
-- This can be run separately to populate with sample data
