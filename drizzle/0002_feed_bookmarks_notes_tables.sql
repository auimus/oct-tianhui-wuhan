DROP TABLE entries;
--> statement-breakpoint
CREATE TABLE feed_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  published_date TEXT,
  fetched_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_item_id INTEGER NOT NULL UNIQUE REFERENCES feed_items(id),
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE refresh_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL,
  message TEXT,
  created_at INTEGER NOT NULL
);
