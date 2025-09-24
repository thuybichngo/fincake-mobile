-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create portfolios table  
CREATE TABLE portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    shares INTEGER NOT NULL CHECK (shares > 0),
    avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create news table
CREATE TABLE news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT,
    title TEXT NOT NULL,
    summary TEXT,
    source_url TEXT NOT NULL,
    source TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create chat_logs table
CREATE TABLE chat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
