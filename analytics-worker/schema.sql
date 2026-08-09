PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS visitors (
  visitor_hash TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page TEXT NOT NULL,
  page_title TEXT,
  target TEXT,
  href TEXT,
  referrer_domain TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  is_returning INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(visitor_hash) REFERENCES visitors(visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_page ON events(page);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_visitor_hash ON events(visitor_hash);
