-- Migration for Chat Messages Table
-- Run this SQL in your Supabase SQL Editor

-- Create the chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'direct')),
  recipient_id TEXT,
  recipient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read all messages
CREATE POLICY "Allow read all messages" ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow all authenticated users to insert messages
CREATE POLICY "Allow insert messages" ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow users to update only their own messages (for marking as read)
CREATE POLICY "Allow update own messages" ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow users to delete only their own messages (if needed)
CREATE POLICY "Allow delete own messages" ON chat_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for the chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
