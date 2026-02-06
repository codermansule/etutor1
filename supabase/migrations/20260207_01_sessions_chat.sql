-- Phase 5: Live Classroom Sessions & In-Session Chat
-- ===================================================

-- Sessions table: tracks live classroom sessions linked to bookings
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  livekit_room_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_livekit_room ON sessions(livekit_room_name);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Participants can update their sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);

-- Session chat messages table
CREATE TABLE IF NOT EXISTS session_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_session_chat_session_id ON session_chat_messages(session_id);
CREATE INDEX idx_session_chat_created_at ON session_chat_messages(created_at);

-- RLS
ALTER TABLE session_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view chat messages"
  ON session_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_chat_messages.session_id
      AND (s.tutor_id = auth.uid() OR s.student_id = auth.uid())
    )
  );

CREATE POLICY "Session participants can send chat messages"
  ON session_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_chat_messages.session_id
      AND (s.tutor_id = auth.uid() OR s.student_id = auth.uid())
    )
  );

-- Enable Realtime for session chat
ALTER PUBLICATION supabase_realtime ADD TABLE session_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Updated_at trigger for sessions
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();
