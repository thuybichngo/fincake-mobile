-- FinCake Database Schema
-- Run these commands in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    shares INTEGER NOT NULL CHECK (shares > 0),
    avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT,
    title TEXT NOT NULL,
    summary TEXT,
    source_url TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('CafeF', 'VNExpress')),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_logs table
CREATE TABLE chat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_symbol ON portfolios(symbol);
CREATE INDEX idx_news_symbol ON news(symbol);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_chat_logs_user_id ON chat_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Portfolios: users can only access their own portfolios
CREATE POLICY "Users can view own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- News: allow read access for authenticated users
CREATE POLICY "Authenticated users can view news" ON news
    FOR SELECT USING (auth.role() = 'authenticated');

-- Chat logs: users can only access their own chat logs
CREATE POLICY "Users can view own chat logs" ON chat_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat logs" ON chat_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
