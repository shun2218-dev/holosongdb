-- Talents table
CREATE TABLE IF NOT EXISTS talents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_jp TEXT,
  name_en TEXT,
  branch TEXT NOT NULL,
  generation TEXT,
  debut TIMESTAMP,
  active BOOLEAN DEFAULT true NOT NULL,
  channel_id TEXT,
  subscriber_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for talents
CREATE INDEX IF NOT EXISTS idx_talents_channel_id ON talents(channel_id);
CREATE INDEX IF NOT EXISTS idx_talents_subscriber_count ON talents(subscriber_count);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_jp TEXT,
  title_en TEXT,
  type TEXT NOT NULL CHECK (type IN ('ORIGINAL', 'COVER', 'COLLABORATION')),
  video_id TEXT,
  video_url TEXT,
  release_date TIMESTAMP,
  duration INTEGER,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  lyrics TEXT,
  composer TEXT,
  arranger TEXT,
  mixer TEXT,
  illustrator TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  talent_id TEXT NOT NULL,
  FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
);

-- Create indexes for songs
CREATE INDEX IF NOT EXISTS idx_songs_type ON songs(type);
CREATE INDEX IF NOT EXISTS idx_songs_release_date ON songs(release_date);
CREATE INDEX IF NOT EXISTS idx_songs_view_count ON songs(view_count);
CREATE INDEX IF NOT EXISTS idx_songs_like_count ON songs(like_count);
CREATE INDEX IF NOT EXISTS idx_songs_talent_id ON songs(talent_id);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'ADMIN' NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')),
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for admin activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);

-- Admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  admin_id TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Create indexes for admin sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- User oshi preferences
CREATE TABLE IF NOT EXISTS user_oshi_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  talent_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
  UNIQUE(user_id, talent_id)
);

-- Create indexes for user oshi preferences
CREATE INDEX IF NOT EXISTS idx_user_oshi_preferences_user_id ON user_oshi_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_oshi_preferences_talent_id ON user_oshi_preferences(talent_id);
CREATE INDEX IF NOT EXISTS idx_user_oshi_preferences_created_at ON user_oshi_preferences(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_talents_updated_at BEFORE UPDATE ON talents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_activity_log_updated_at BEFORE UPDATE ON admin_activity_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_sessions_updated_at BEFORE UPDATE ON admin_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_oshi_preferences_updated_at BEFORE UPDATE ON user_oshi_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
