-- Leaderboard table for Jan's World
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT,
  completion_time INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on completion time
CREATE INDEX IF NOT EXISTS idx_completion_time ON leaderboard(completion_time);
