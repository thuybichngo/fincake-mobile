-- Clean up and recreate FinCake Mobile App Database Schema
-- Run this if you get column errors

-- Drop existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS news_clusters CASCADE;

-- Create news_clusters table
CREATE TABLE news_clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_id UUID NOT NULL REFERENCES news_clusters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_news_clusters_created_at ON news_clusters(created_at DESC);
CREATE INDEX idx_news_cluster_id ON news(cluster_id);
CREATE INDEX idx_news_published_at ON news(published_at DESC);

-- Enable Row Level Security
ALTER TABLE news_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no authentication required)
CREATE POLICY "Allow public read access to news_clusters" ON news_clusters
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to news" ON news
  FOR SELECT USING (true);

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON news_clusters TO anon;
GRANT SELECT ON news TO anon;
