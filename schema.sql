-- Leaderboard table for Jan's World
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT,
  completion_time INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on completion time
CREATE INDEX IF NOT EXISTS idx_completion_time ON leaderboard(completion_time);
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard(level);

-- Player progress table
CREATE TABLE IF NOT EXISTS player_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL UNIQUE,
  date_of_birth TEXT NOT NULL,
  highest_unlocked_level INTEGER NOT NULL DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_player_name ON player_progress(player_name);
