-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS game_results (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_mode   text        NOT NULL CHECK (game_mode IN ('ai', 'hotseat', 'online')),
  deck        text        NOT NULL,
  won         boolean     NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own results"
  ON game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own results"
  ON game_results FOR SELECT
  USING (auth.uid() = user_id);
