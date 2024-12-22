/*
  # Create files table and storage

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text, file name)
      - `path` (text, storage path)
      - `type` (text, file mime type)
      - `size` (bigint, file size in bytes)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp with time zone)

  2. Storage
    - Create `files` bucket for storing uploaded files
    - Enable public access for authenticated users

  3. Security
    - Enable RLS on `files` table
    - Add policies for authenticated users to:
      - Read all files
      - Insert their own files
*/

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  path text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view files"
  ON files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'files');

CREATE POLICY "Anyone can download files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'files');